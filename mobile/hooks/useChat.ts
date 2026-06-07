import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { socket } from "../services/api"; // L'import de notre connexion Socket.IO

// 1. On adapte ton interface pour correspondre à notre base de données
export interface IMessage {
  id_message?: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export default function useChat(receiverId: string) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);

  // 2. Initialisation et écoute des messages en direct
  useEffect(() => {
    // On récupère notre propre ID stocké dans le téléphone
    AsyncStorage.getItem("userId").then((id) => setMyId(id));

    // On écoute le canal "receive_message" de Socket.IO
    socket.on("receive_message", (newMessage: IMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receive_message"); // On coupe l'écoute quand on quitte l'écran
    };
  }, []);

  // 3. La fonction pour envoyer un message (Adaptée pour le Mobile)
  // On ne passe plus un événement HTML, mais directement le texte (string)
  const sendMessage = (textContent: string) => {
    if (!textContent.trim() || !myId) return;

    const msg: IMessage = {
      sender_id: myId,
      receiver_id: receiverId,
      content: textContent,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);

    // On l'envoie au serveur pour que l'autre personne le reçoive !
    socket.emit("send_message", msg);
  };

  return { messages, loading, sendMessage, myId };
}
