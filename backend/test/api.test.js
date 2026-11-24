// Tests de l'API sur une vraie base PostGIS jetable : TEST_DATABASE_URL=postgres://… npm test
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");
const request = require("supertest");
const { io: client } = require("socket.io-client");
const { creerServeur } = require("../src/app");

const URL = process.env.TEST_DATABASE_URL;
const SECRET = "secret-de-test";

describe("API PharmaTrend", { skip: !URL && "TEST_DATABASE_URL non défini" }, () => {
  let pool;
  let app;
  let server;
  let io;
  let alice;
  let bob;

  async function inscrire(nom, email, role) {
    const res = await request(app)
      .post("/register")
      .send({ name: nom, email, password: "motdepasse123", role })
      .expect(201);
    return res.body;
  }

  before(async () => {
    pool = new Pool({ connectionString: URL });
    await pool.query("DROP TABLE IF EXISTS messages, swipes, equipments, products, users CASCADE");
    await pool.query(fs.readFileSync(path.join(__dirname, "../db/schema.sql"), "utf8"));
    await pool.query(
      "INSERT INTO products (name, category, likes_count) VALUES ('Crème solaire', 'Dermatologie', 5)",
    );
    ({ app, server, io } = creerServeur({ pool, secret: SECRET, limiter: false }));
    await new Promise((resolve) => server.listen(0, resolve));
    alice = await inscrire("Alice", "alice@test.fr", "PHARMACIST");
    bob = await inscrire("Bob", "bob@test.fr", "SELLER");
  });

  after(async () => {
    io.close();
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });

  const avec = (jeton) => ({ Authorization: `Bearer ${jeton}` });

  it("inscrit un utilisateur avec un jeton, sans renvoyer le mot de passe", () => {
    assert.equal(alice.user.name, "Alice");
    assert.equal(alice.user.role, "PHARMACIST");
    assert.ok(alice.token);
    assert.equal(alice.user.password_hash, undefined);
  });

  it("refuse un email déjà pris, un mot de passe trop court et un rôle inventé", async () => {
    await request(app)
      .post("/register")
      .send({ name: "A", email: "alice@test.fr", password: "motdepasse123" })
      .expect(400);
    await request(app)
      .post("/register")
      .send({ name: "C", email: "c@test.fr", password: "court" })
      .expect(400);
    const res = await request(app)
      .post("/register")
      .send({ name: "D", email: "d@test.fr", password: "motdepasse123", role: "ADMIN" })
      .expect(201);
    assert.equal(res.body.user.role, "PHARMACIST");
  });

  it("connecte avec le bon mot de passe, avec le même message d'erreur sinon", async () => {
    const ok = await request(app)
      .post("/login")
      .send({ email: " ALICE@test.fr ", password: "motdepasse123" })
      .expect(200);
    assert.ok(ok.body.token);
    const faux = await request(app)
      .post("/login")
      .send({ email: "alice@test.fr", password: "mauvais" })
      .expect(401);
    const inconnu = await request(app)
      .post("/login")
      .send({ email: "personne@test.fr", password: "mauvais" })
      .expect(401);
    assert.equal(faux.body.error, inconnu.body.error);
    await request(app).post("/login").send({}).expect(400);
  });

  it("protège les routes personnelles", async () => {
    await request(app).get("/me").expect(401);
    await request(app).get("/my-conversations").expect(401);
    await request(app).get("/me").set(avec("jeton-bidon")).expect(401);
    const moi = await request(app).get("/me").set(avec(alice.token)).expect(200);
    assert.equal(moi.body.email, "alice@test.fr");
  });

  it("montre le profil d'un autre sans son email", async () => {
    const res = await request(app)
      .get(`/users/${bob.user.id_user}`)
      .set(avec(alice.token))
      .expect(200);
    assert.equal(res.body.name, "Bob");
    assert.equal(res.body.email, undefined);
    await request(app).get("/users/abc").set(avec(alice.token)).expect(400);
  });

  it("publie une annonce au nom de l'utilisateur connecté, pas de celui envoyé", async () => {
    await request(app).post("/equipments").send({ title: "Frigo", price: 100 }).expect(401);
    const res = await request(app)
      .post("/equipments")
      .set(avec(bob.token))
      .send({ title: "Frigo", price: 100, status: "Refrigeration", id_user: alice.user.id_user, lat: 45.76, lng: 4.83 })
      .expect(201);
    const annonce = await request(app).get(`/equipments/${res.body.id_equip}`).expect(200);
    assert.equal(annonce.body.id_user, bob.user.id_user);
    assert.equal(annonce.body.location, "POINT(4.83 45.76)");
    const liste = await request(app).get("/equipments?category=Refrigeration").expect(200);
    assert.equal(liste.body.length, 1);
    await request(app).post("/equipments").set(avec(bob.token)).send({ title: "", price: -1 }).expect(400);
    await request(app).get("/equipments/999999").expect(404);
  });

  it("compte un like une seule fois et le retire avec PASS", async () => {
    const [produit] = (await request(app).get("/products/trends").expect(200)).body;
    const likes = () => pool.query("SELECT likes_count FROM products WHERE id_product = $1", [produit.id_product]);

    await request(app).post("/swipes").set(avec(alice.token)).send({ id_product: produit.id_product, action: "LIKE" }).expect(200);
    await request(app).post("/swipes").set(avec(alice.token)).send({ id_product: produit.id_product, action: "LIKE" }).expect(200);
    assert.equal((await likes()).rows[0].likes_count, 6);

    await request(app).post("/swipes").set(avec(alice.token)).send({ id_product: produit.id_product, action: "PASS" }).expect(200);
    await request(app).post("/swipes").set(avec(alice.token)).send({ id_product: produit.id_product, action: "PASS" }).expect(200);
    assert.equal((await likes()).rows[0].likes_count, 5);

    await request(app).post("/swipes").set(avec(alice.token)).send({ id_product: produit.id_product, action: "SUPER" }).expect(400);
  });

  it("envoie un message seulement à son destinataire, et le range dans la conversation", async () => {
    const port = server.address().port;
    const connecter = (jeton) =>
      new Promise((resolve, reject) => {
        const socket = client(`http://127.0.0.1:${port}`, { auth: { token: jeton }, transports: ["websocket"] });
        socket.on("connect", () => resolve(socket));
        socket.on("connect_error", reject);
      });

    await assert.rejects(connecter("jeton-bidon"));

    const sA = await connecter(alice.token);
    const sB = await connecter(bob.token);
    const autre = await inscrire("Eve", "eve@test.fr");
    const sE = await connecter(autre.token);
    let eveARecu = false;
    sE.on("receive_message", () => {
      eveARecu = true;
    });

    const recuParBob = new Promise((resolve) => sB.on("receive_message", resolve));
    // L'expéditeur annoncé par le client est ignoré : c'est celui du jeton.
    const accuse = await sA.emitWithAck("send_message", {
      sender_id: bob.user.id_user,
      receiver_id: bob.user.id_user,
      content: "Bonjour Bob",
    });
    assert.equal(accuse.ok, true);
    const message = await recuParBob;
    assert.equal(message.sender_id, alice.user.id_user);
    assert.equal(message.content, "Bonjour Bob");

    const invalide = await sA.emitWithAck("send_message", { receiver_id: bob.user.id_user, content: "  " });
    assert.equal(invalide.error, "Message invalide");

    await new Promise((resolve) => setTimeout(resolve, 200));
    assert.equal(eveARecu, false);
    [sA, sB, sE].forEach((s) => s.close());

    const fil = await request(app).get(`/messages/${alice.user.id_user}`).set(avec(bob.token)).expect(200);
    assert.deepEqual(fil.body.map((m) => m.content), ["Bonjour Bob"]);
    const conv = await request(app).get("/my-conversations").set(avec(bob.token)).expect(200);
    assert.deepEqual(conv.body, [{ contact_id: alice.user.id_user, contact_name: "Alice" }]);
    const vide = await request(app).get(`/messages/${bob.user.id_user}`).set(avec(autre.token)).expect(200);
    assert.deepEqual(vide.body, []);
  });

  it("répond en JSON sur une route inconnue", async () => {
    const res = await request(app).get("/nimporte-quoi").expect(404);
    assert.equal(res.body.error, "Route inconnue");
  });
});
