import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { io, type Socket } from "socket.io-client";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/Config";
import { useAuth } from "../../context/AuthContext";
import { getConversation, getToken, type Message } from "../../services/data";

export default function ChatScreen() {
  // 🟢 On récupère l'ID, le nom du contact et le nom du produit depuis les paramètres
  const { id, contactName, productName } = useLocalSearchParams();
  const contactId = Number(id);

  const { user } = useAuth();
  const MY_USER_ID = user?.id_user;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!MY_USER_ID || !contactId) return;

    let actif = true;
    let newSocket: Socket | null = null;

    (async () => {
      // A. Récupérer l'historique de la conversation
      getConversation(contactId)
        .then((data) => actif && setMessages(data))
        .catch((err) => console.error("Erreur historique:", err));

      // B. Connexion temps réel, avec le jeton : le serveur sait qui écrit
      const token = await getToken();
      if (!actif) return;
      newSocket = io(API_URL, { auth: { token }, transports: ["websocket"] });
      newSocket.on("connect_error", () => setErreur("Connexion au chat impossible"));
      newSocket.on("connect", () => setErreur(null));

      // C. Écouter les nouveaux messages (le serveur n'envoie que les nôtres)
      newSocket.on("receive_message", (newMessage: Message) => {
        if (
          (newMessage.sender_id === contactId &&
            newMessage.receiver_id === MY_USER_ID) ||
          (newMessage.sender_id === MY_USER_ID &&
            newMessage.receiver_id === contactId)
        ) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      });
    })();

    return () => {
      actif = false;
      newSocket?.disconnect();
    };
  }, [contactId, MY_USER_ID]);

  const sendMessage = () => {
    if (inputText.trim() === "" || !socket) return;

    // L'expéditeur est celui du jeton : on n'envoie que le destinataire et le texte.
    socket.emit(
      "send_message",
      { receiver_id: contactId, content: inputText },
      (reponse: { ok?: boolean; error?: string }) => {
        if (reponse?.error) setErreur(reponse.error);
      },
    );
    setInputText("");
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === MY_USER_ID;
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.contactMessage,
        ]}
      >
        <Text style={isMe ? styles.myMessageText : styles.contactMessageText}>
          {item.content}
        </Text>
      </View>
    );
  };

  if (!MY_USER_ID) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 50 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 🟢 EN-TÊTE DYNAMIQUE */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {contactName ? contactName : `Discussion avec le vendeur`}
        </Text>
        {productName ? (
          <Text style={styles.subHeaderText}>Au sujet de : {productName}</Text>
        ) : null}
      </View>

      {/* 🟢 REMPLACE TON KEYBOARDAVOIDINGVIEW PAR CELUI-CI */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "android" ? 90 : 90}
      >
        {erreur ? (
          <Text style={{ color: "#c0392b", textAlign: "center", padding: 8 }}>
            {erreur}
          </Text>
        ) : null}
        <FlatList
          data={messages}
          keyExtractor={(item, index) => String(item.id_message ?? index)}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Écrivez votre message..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  headerText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  subHeaderText: { fontSize: 14, color: "#10b981", marginTop: 4 }, // <-- Vert pour le produit
  chatContainer: { padding: 15, paddingBottom: 10 },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 5,
  },
  contactMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 5,
  },
  myMessageText: { color: "#FFF", fontSize: 16 },
  contactMessageText: { color: "#000", fontSize: 16 },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "black", // <-- Force le texte de frappe en noir
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  sendButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
