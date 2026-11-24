# PharmaTrend

Application mobile pour les pharmacies : une **marketplace** de matériel d'occasion entre
professionnels, des **tendances** produits à faire glisser comme des cartes, et une
**messagerie en temps réel** entre acheteurs et vendeurs.

| Marketplace | Annonce | Tendances | Messagerie |
| --- | --- | --- | --- |
| ![Marketplace](docs/captures/marketplace.png) | ![Annonce](docs/captures/annonce.png) | ![Tendances](docs/captures/tendances.png) | ![Messagerie](docs/captures/chat.png) |

## Fonctionnalités

- Inscription et connexion (pharmacien ou vendeur pro), session gardée sur le téléphone
- Marketplace : recherche, filtres par catégorie, fiche de l'annonce, publication d'une annonce
- Tendances : on glisse à droite pour mettre un produit en favori, à gauche pour passer
- Messagerie temps réel (Socket.IO) avec l'historique de chaque conversation

## Architecture

```
mobile/    Appli Expo (React Native, TypeScript, expo-router) – Android, iOS et web
backend/   API Node.js : Express 5, Socket.IO, PostgreSQL + PostGIS, bcrypt, JWT
```

**Sécurité de l'API**

- Mots de passe hachés avec bcrypt ; connexion par jeton JWT (7 jours).
- L'identité vient toujours du jeton, jamais de la requête : on ne peut ni publier, ni liker,
  ni écrire au nom de quelqu'un d'autre, ni lire une conversation qui n'est pas la sienne.
- Le chat exige le jeton à la connexion du socket et n'envoie un message qu'à ses deux
  participants.
- Requêtes SQL paramétrées, entrées validées, tentatives de connexion limitées,
  même message d'erreur pour un email inconnu ou un mauvais mot de passe.

| Route | Accès | Rôle |
| --- | --- | --- |
| `POST /register`, `POST /login` | public | inscription, connexion (renvoient le jeton) |
| `GET /me`, `GET /users/:id` | connecté | mon profil, profil public d'un autre |
| `GET /equipments`, `GET /equipments/:id` | public | annonces (filtre `?category=`) |
| `POST /equipments` | connecté | publier une annonce |
| `GET /products/trends`, `POST /swipes` | public / connecté | tendances, LIKE ou PASS |
| `GET /my-conversations`, `GET /messages/:contactId` | connecté | messagerie |
| Socket `send_message` | connecté | `{ receiver_id, content }`, accusé de réception |

## Lancer le projet

Prérequis : Node.js 22, Docker.

```bash
# 1. Base de données (schéma + données de démonstration)
cp backend/.env.example backend/.env      # puis remplir DB_PASSWORD et JWT_SECRET
docker compose --env-file backend/.env up -d

# 2. API
cd backend && npm install && npm start    # http://localhost:3000

# 3. Appli mobile
cd mobile && npm install
cp .env.example .env                      # EXPO_PUBLIC_API_URL = adresse IP du PC
npx expo start                            # Expo Go sur le téléphone, ou « w » pour le web
```

Comptes de démonstration (locaux) : `pharmacie@demo.test` et `vendeur@demo.test`, mot de passe
`demo-pharmatrend`.

Un APK Android se construit avec EAS : `npx eas build -p android --profile preview`.

## Tests

```bash
cd backend
TEST_DATABASE_URL=postgres://postgres:test@localhost:5432/pharmatrend_test npm test
```

Neuf tests (runner de Node + supertest + client Socket.IO) tournent sur une vraie base PostGIS :
inscription, connexion, routes protégées, publication, likes, messagerie et cloisonnement des
messages. La CI GitHub Actions les lance à chaque envoi, avec la vérification TypeScript de
l'appli.

## Auteur

Alexis Renazé – [github.com/Optiware](https://github.com/Optiware)
