import { io } from "socket.io-client";
import { API_URL } from "../constants/Config";

const SOCKET_URL = API_URL.replace("/api", "");

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("[Socket.IO] Connecté au serveur avec l'ID :", socket.id);
});

socket.on("connect_error", (err: Error) => {
  console.log("[Socket.IO] Erreur de connexion :", err.message);
});
