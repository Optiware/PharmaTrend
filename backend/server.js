require("dotenv").config(); // 🟢 INDISPENSABLE : Charge les variables du fichier .env

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// 🗄️ Configuration de la connexion BDD
// ==========================================
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

// LOGS (Pour voir ce qui se passe)
app.use((req, res, next) => {
  console.log(`📡 APPEL REÇU : ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 🔌 INITIALISATION SOCKET.IO (CHAT TEMPS RÉEL)
// ==========================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(`🔌 Nouvel utilisateur connecté (ID: ${socket.id})`);

  socket.on("send_message", async (data) => {
    try {
      await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)",
        [data.sender_id, data.receiver_id, data.content],
      );
      io.emit("receive_message", data);
    } catch (err) {
      console.error("Erreur Socket:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Utilisateur déconnecté (ID: ${socket.id})`);
  });
});

// ==========================================
// 🔐 ZONE AUTHENTIFICATION (LOGIN / SIGNUP)
// ==========================================

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, companyName, role } = req.body;
    console.log(`📝 Inscription : ${email} en tant que ${role}`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password_hash, company_name, role, created_at) 
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id_user, name, role
    `;

    const values = [
      name,
      email,
      hashedPassword,
      companyName,
      role || "PHARMACIST",
    ];
    const result = await pool.query(query, values);

    console.log("✅ Utilisateur créé ID :", result.rows[0].id_user);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur Inscription :", err.message);
    if (err.code === "23505") {
      res.status(400).json({ error: "Cet email est déjà utilisé." });
    } else {
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const result = await pool.query(
      "SELECT id_user, name, role, email, password_hash, company_name FROM users WHERE email = $1",
      [cleanEmail],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Utilisateur inconnu" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (match) {
      console.log(`✅ Connexion réussie : ${user.name}`);
      delete user.password_hash;
      res.json({ success: true, user: user });
    } else {
      res.status(401).json({ error: "Mot de passe incorrect" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id_user, name, email, role, company_name FROM users WHERE id_user = $1",
      [id],
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Utilisateur introuvable" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur BDD" });
  }
});

// ==========================================
// 🛒 MARKETPLACE & FILTRES
// ==========================================

app.get("/equipments", async (req, res) => {
  try {
    const { category } = req.query;
    let query = `SELECT id_equip, title, description, price, status, image_url, location::text, id_user FROM equipments`;
    let params = [];

    if (category && category !== "Tout") {
      query += ` WHERE status = $1`;
      params.push(category);
    }

    query += ` ORDER BY id_equip DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur BDD" });
  }
});

// 📄 DÉTAIL D'UN ÉQUIPEMENT
app.get("/equipments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM equipments WHERE id_equip = $1",
      [id],
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Équipement introuvable" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur BDD" });
  }
});

// ➕ AJOUTER UN ÉQUIPEMENT (VENDRE)
app.post("/equipments", async (req, res) => {
  try {
    const { title, description, price, status, image_url, location, id_user } =
      req.body;
    await pool.query(
      "INSERT INTO equipments (title, description, price, status, image_url, location, id_user) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        title,
        description,
        price,
        status,
        image_url ||
          "https://images.unsplash.com/photo-1516549655134-f62893452362",
        location,
        id_user,
      ],
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'ajout" });
  }
});

// ==========================================
// 🔥 TRENDS (PRODUITS & SWIPES)
// ==========================================

app.get("/products/trends", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products ORDER BY likes_count DESC LIMIT 10`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur BDD Trends" });
  }
});

app.post("/swipes", async (req, res) => {
  try {
    const { id_user, id_product, action } = req.body;

    const check = await pool.query(
      "SELECT * FROM swipes WHERE id_user = $1 AND id_product = $2",
      [id_user, id_product],
    );

    if (check.rows.length > 0) {
      await pool.query(
        "DELETE FROM swipes WHERE id_user = $1 AND id_product = $2",
        [id_user, id_product],
      );
      await pool.query(
        "UPDATE products SET likes_count = likes_count - 1 WHERE id_product = $1",
        [id_product],
      );
      res.json({ status: "unliked" });
    } else {
      await pool.query(
        "INSERT INTO swipes (id_user, id_product, action) VALUES ($1, $2, 'LIKE')",
        [id_user, id_product],
      );
      await pool.query(
        "UPDATE products SET likes_count = likes_count + 1 WHERE id_product = $1",
        [id_product],
      );
      res.json({ status: "liked" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur BDD" });
  }
});

// ==========================================
// 💬 CHAT - HISTORIQUE
// ==========================================
app.get("/messages/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [user1, user2],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur Chat" });
  }
});

// ==========================================
// 💬 CHAT - LISTE DES CONVERSATIONS (CORRIGÉ AVEC LES NOMS)
// ==========================================
app.get("/my-conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT DISTINCT
        CASE
          WHEN sender_id = $1 THEN receiver_id
          ELSE sender_id
        END AS contact_id,
        users.name AS contact_name
      FROM messages
      JOIN users ON users.id_user = (
        CASE
          WHEN sender_id = $1 THEN receiver_id
          ELSE sender_id
        END
      )
      WHERE sender_id = $1 OR receiver_id = $1;
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération conversations :", err);
    res.status(500).json({ error: "Erreur liste conversations" });
  }
});

// ==========================================
// 🚀 LANCEMENT DU SERVEUR
// ==========================================
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 SERVEUR PRÊT sur le port ${port}`);
});
