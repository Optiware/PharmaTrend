// Adresse de l'API : variable EXPO_PUBLIC_API_URL (fichier .env de l'appli, voir .env.example).
// Sur un téléphone, mettre l'adresse IP du PC sur le réseau local (ex. http://192.168.1.20:3000).
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
