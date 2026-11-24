const jwt = require("jsonwebtoken");

// Jeton de connexion : l'identifiant de l'utilisateur vient du jeton, jamais du corps de la requête.
const DUREE = "7d";

function creerJeton(utilisateur, secret) {
  return jwt.sign({ sub: String(utilisateur.id_user), role: utilisateur.role }, secret, {
    expiresIn: DUREE,
  });
}

function lireJeton(jeton, secret) {
  const contenu = jwt.verify(jeton, secret);
  const id = Number(contenu.sub);
  if (!Number.isInteger(id)) throw new Error("Jeton invalide");
  return { id, role: contenu.role };
}

// Middleware Express : refuse la requête sans jeton valide.
function exigerConnexion(secret) {
  return (req, res, next) => {
    const entete = req.get("authorization") || "";
    const [type, jeton] = entete.split(" ");
    if (type !== "Bearer" || !jeton) {
      return res.status(401).json({ error: "Connexion requise" });
    }
    try {
      req.utilisateur = lireJeton(jeton, secret);
      next();
    } catch {
      res.status(401).json({ error: "Session expirée, reconnectez-vous" });
    }
  };
}

module.exports = { creerJeton, lireJeton, exigerConnexion };
