const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const http = require("http");
const { Server } = require("socket.io");
const { rateLimit } = require("express-rate-limit");
const { creerJeton, lireJeton, exigerConnexion } = require("./auth");

const ROLES = ["PHARMACIST", "SELLER"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COLONNES_USER = "id_user, name, email, role, company_name";

// Entier positif, sinon null (identifiants dans l'URL).
function entier(valeur) {
  const n = Number(valeur);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Crée l'API et le chat temps réel. La connexion à la base est fournie de l'extérieur,
 * ce qui permet aux tests d'utiliser leur propre base.
 */
function creerServeur({ pool, secret, limiter = true }) {
  if (!secret) throw new Error("JWT_SECRET manquant");

  const app = express();
  const auth = exigerConnexion(secret);
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));

  // Pas plus de 20 tentatives de connexion ou d'inscription par quart d'heure et par adresse.
  const limite = limiter
    ? rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false })
    : (req, res, next) => next();

  app.get("/health", (req, res) => res.json({ ok: true }));

  // ——— Authentification ———

  app.post("/register", limite, async (req, res) => {
    const { name, email, password, companyName, role } = req.body ?? {};
    const nom = typeof name === "string" ? name.trim() : "";
    const mail = typeof email === "string" ? email.toLowerCase().trim() : "";
    if (!nom || !EMAIL.test(mail)) {
      return res.status(400).json({ error: "Nom et email valides obligatoires" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Mot de passe de 8 caractères minimum" });
    }
    try {
      const hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, company_name, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING ${COLONNES_USER}`,
        [nom, mail, hash, companyName?.trim() || null, ROLES.includes(role) ? role : "PHARMACIST"],
      );
      const user = result.rows[0];
      res.status(201).json({ success: true, user, token: creerJeton(user, secret) });
    } catch (err) {
      if (err.code === "23505") return res.status(400).json({ error: "Cet email est déjà utilisé." });
      console.error("Inscription :", err.message);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/login", limite, async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email et mot de passe obligatoires" });
    }
    try {
      const result = await pool.query(
        `SELECT ${COLONNES_USER}, password_hash FROM users WHERE email = $1`,
        [email.toLowerCase().trim()],
      );
      const user = result.rows[0];
      // Même message dans les deux cas : on ne révèle pas si l'email existe.
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }
      delete user.password_hash;
      res.json({ success: true, user, token: creerJeton(user, secret) });
    } catch (err) {
      console.error("Connexion :", err.message);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/me", auth, async (req, res) => {
    const result = await pool.query(`SELECT ${COLONNES_USER} FROM users WHERE id_user = $1`, [
      req.utilisateur.id,
    ]);
    if (!result.rows[0]) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json(result.rows[0]);
  });

  // Profil public d'un autre utilisateur : sans son email.
  app.get("/users/:id", auth, async (req, res) => {
    const id = entier(req.params.id);
    if (!id) return res.status(400).json({ error: "Identifiant invalide" });
    const result = await pool.query(
      "SELECT id_user, name, role, company_name FROM users WHERE id_user = $1",
      [id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json(result.rows[0]);
  });

  // ——— Marketplace ———

  const COLONNES_EQUIP =
    "id_equip, title, description, price, status, image_url, ST_AsText(location) AS location, id_user, created_at";

  app.get("/equipments", async (req, res) => {
    const { category } = req.query;
    const filtre = typeof category === "string" && category !== "Tout";
    const result = await pool.query(
      `SELECT ${COLONNES_EQUIP} FROM equipments ${filtre ? "WHERE status = $1" : ""} ORDER BY id_equip DESC`,
      filtre ? [category] : [],
    );
    res.json(result.rows);
  });

  app.get("/equipments/:id", async (req, res) => {
    const id = entier(req.params.id);
    if (!id) return res.status(400).json({ error: "Identifiant invalide" });
    const result = await pool.query(`SELECT ${COLONNES_EQUIP} FROM equipments WHERE id_equip = $1`, [id]);
    if (!result.rows[0]) return res.status(404).json({ error: "Équipement introuvable" });
    res.json(result.rows[0]);
  });

  app.post("/equipments", auth, async (req, res) => {
    const { title, description, price, status, image_url, lat, lng } = req.body ?? {};
    const titre = typeof title === "string" ? title.trim() : "";
    const prix = Number(price);
    if (!titre || !Number.isFinite(prix) || prix < 0) {
      return res.status(400).json({ error: "Titre et prix valides obligatoires" });
    }
    // Position facultative : un point GPS, pas un texte libre.
    const gps = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
    const result = await pool.query(
      `INSERT INTO equipments (title, description, price, status, image_url, location, id_user)
       VALUES ($1, $2, $3, $4, $5, ${gps ? "ST_SetSRID(ST_MakePoint($7, $8), 4326)" : "NULL"}, $6)
       RETURNING id_equip`,
      [
        titre,
        typeof description === "string" ? description : null,
        prix,
        typeof status === "string" && status ? status : "Neuf",
        typeof image_url === "string" && image_url ? image_url : null,
        req.utilisateur.id,
        ...(gps ? [Number(lng), Number(lat)] : []),
      ],
    );
    res.status(201).json({ success: true, id_equip: result.rows[0].id_equip });
  });

  // ——— Tendances ———

  app.get("/products/trends", async (req, res) => {
    const result = await pool.query("SELECT * FROM products ORDER BY likes_count DESC LIMIT 10");
    res.json(result.rows);
  });

  // LIKE ajoute un favori (une seule fois) ; PASS retire celui qu'on avait mis, s'il existe.
  app.post("/swipes", auth, async (req, res) => {
    const idProduit = entier(req.body?.id_product);
    const action = req.body?.action;
    if (!idProduit || !["LIKE", "PASS"].includes(action)) {
      return res.status(400).json({ error: "Produit et action (LIKE ou PASS) obligatoires" });
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const produit = await client.query("SELECT 1 FROM products WHERE id_product = $1", [idProduit]);
      if (!produit.rows[0]) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Produit introuvable" });
      }
      let change = 0;
      if (action === "LIKE") {
        const ajout = await client.query(
          `INSERT INTO swipes (id_user, id_product, action) VALUES ($1, $2, 'LIKE')
           ON CONFLICT (id_user, id_product) DO NOTHING`,
          [req.utilisateur.id, idProduit],
        );
        change = ajout.rowCount;
      } else {
        const retrait = await client.query("DELETE FROM swipes WHERE id_user = $1 AND id_product = $2", [
          req.utilisateur.id,
          idProduit,
        ]);
        change = -retrait.rowCount;
      }
      if (change !== 0) {
        await client.query(
          "UPDATE products SET likes_count = GREATEST(likes_count + $1, 0) WHERE id_product = $2",
          [change, idProduit],
        );
      }
      await client.query("COMMIT");
      res.json({ status: action === "LIKE" ? "liked" : "passed" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  });

  // ——— Messagerie ———

  app.get("/messages/:contactId", auth, async (req, res) => {
    const contact = entier(req.params.contactId);
    if (!contact) return res.status(400).json({ error: "Identifiant invalide" });
    const result = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC, id_message ASC`,
      [req.utilisateur.id, contact],
    );
    res.json(result.rows);
  });

  app.get("/my-conversations", auth, async (req, res) => {
    const result = await pool.query(
      `SELECT DISTINCT c.contact_id, u.name AS contact_name
       FROM (
         SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS contact_id
         FROM messages WHERE sender_id = $1 OR receiver_id = $1
       ) c
       JOIN users u ON u.id_user = c.contact_id
       ORDER BY u.name`,
      [req.utilisateur.id],
    );
    res.json(result.rows);
  });

  app.use((req, res) => res.status(404).json({ error: "Route inconnue" }));
  // Erreur imprévue (base indisponible…) : jamais le détail au client.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  });

  // ——— Chat temps réel ———

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });

  // Le jeton est exigé dès la connexion du socket.
  io.use((socket, next) => {
    try {
      socket.data.utilisateur = lireJeton(socket.handshake.auth?.token ?? "", secret);
      next();
    } catch {
      next(new Error("Connexion requise"));
    }
  });

  io.on("connection", (socket) => {
    const moi = socket.data.utilisateur.id;
    socket.join(`user:${moi}`);

    socket.on("send_message", async (data, accuse) => {
      const destinataire = entier(data?.receiver_id);
      const texte = typeof data?.content === "string" ? data.content.trim() : "";
      const repondre = typeof accuse === "function" ? accuse : () => {};
      if (!destinataire || !texte || texte.length > 2000) {
        return repondre({ error: "Message invalide" });
      }
      try {
        const result = await pool.query(
          "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *",
          [moi, destinataire, texte],
        );
        const message = result.rows[0];
        // Seuls l'expéditeur et le destinataire reçoivent le message.
        io.to(`user:${moi}`).to(`user:${destinataire}`).emit("receive_message", message);
        repondre({ ok: true, message });
      } catch (err) {
        console.error("Chat :", err.message);
        repondre({ error: "Message non envoyé" });
      }
    });
  });

  return { app, server, io };
}

module.exports = { creerServeur };
