# PharmaTrend

[Version française](README.md)

Mobile app for pharmacies: a **marketplace** for second-hand equipment between professionals,
product **trends** you swipe like cards, and **real-time messaging** between buyers and sellers.

| Marketplace | Listing | Trends | Messaging |
| --- | --- | --- | --- |
| ![Marketplace](docs/captures/marketplace.png) | ![Listing](docs/captures/annonce.png) | ![Trends](docs/captures/tendances.png) | ![Messaging](docs/captures/chat.png) |

## Features

- Sign up and log in (pharmacist or professional seller), session kept on the phone
- Marketplace: search, category filters, listing details, posting a listing
- Trends: swipe right to add a product to favorites, left to skip
- Real-time messaging (Socket.IO) with the history of each conversation

## Architecture

```
mobile/    Expo app (React Native, TypeScript, expo-router) – Android, iOS and web
backend/   Node.js API: Express 5, Socket.IO, PostgreSQL + PostGIS, bcrypt, JWT
```

**API security**

- Passwords hashed with bcrypt; login with a JWT (valid 7 days).
- Identity always comes from the token, never from the request: nobody can post, like or write
  on behalf of someone else, or read a conversation that isn't theirs.
- The chat requires the token when the socket connects and only delivers a message to its two
  participants.
- Parameterized SQL queries, validated input, rate-limited login attempts, same error message
  for an unknown email or a wrong password.

| Route | Access | Purpose |
| --- | --- | --- |
| `POST /register`, `POST /login` | public | sign up, log in (return the token) |
| `GET /me`, `GET /users/:id` | logged in | my profile, someone else's public profile |
| `GET /equipments`, `GET /equipments/:id` | public | listings (`?category=` filter) |
| `POST /equipments` | logged in | post a listing |
| `GET /products/trends`, `POST /swipes` | public / logged in | trends, LIKE or PASS |
| `GET /my-conversations`, `GET /messages/:contactId` | logged in | messaging |
| Socket `send_message` | logged in | `{ receiver_id, content }`, with acknowledgement |

## Running the project

Requirements: Node.js 22, Docker.

```bash
# 1. Database (schema + demo data)
cp backend/.env.example backend/.env      # then fill in DB_PASSWORD and JWT_SECRET
docker compose --env-file backend/.env up -d

# 2. API
cd backend && npm install && npm start    # http://localhost:3000

# 3. Mobile app
cd mobile && npm install
cp .env.example .env                      # EXPO_PUBLIC_API_URL = your PC's IP address
npx expo start                            # Expo Go on the phone, or "w" for the web
```

Demo accounts (local): `pharmacie@demo.test` and `vendeur@demo.test`, password
`demo-pharmatrend`.

An Android APK is built with EAS: `npx eas build -p android --profile preview`.

## Tests

```bash
cd backend
TEST_DATABASE_URL=postgres://postgres:test@localhost:5432/pharmatrend_test npm test
```

Nine tests (Node test runner + supertest + Socket.IO client) run against a real PostGIS
database: sign-up, login, protected routes, posting, likes, messaging and message isolation.
GitHub Actions CI runs them on every push, along with the TypeScript check of the app.

## Author

Alexis Renazé – [github.com/Optiware](https://github.com/Optiware)
