require("dotenv").config();

const { Pool } = require("pg");
const { creerServeur } = require("./src/app");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET manquant dans .env (voir .env.example).");
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

const { server } = creerServeur({ pool, secret: process.env.JWT_SECRET });
const port = Number(process.env.PORT) || 3000;

server.listen(port, "0.0.0.0", () => {
  console.log(`API PharmaTrend prête sur le port ${port}`);
});
