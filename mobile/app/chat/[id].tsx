import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// 🟢 Importation corrigée (sans les accolades car c'est un "export default")
import useChat from "../../hooks/useChat";

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [inputText, setInputText] = useState("");

  const { messages, sendMessage, myId } = useChat(id);

  const renderMessage = ({ item }: { item: any }) => {
    // Vérification sécurisée si on est l'expéditeur
    const isMe = item.sender_id?.toString() === myId?.toString();

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={[styles.messageText, isMe ? styles.myMessageText : null]}>
          {item.content}
        </Text>
      </View>
    );
  };

  const handleSend = () => {
    sendMessage(inputText);
    setInputText(""); // On vide la barre de texte après l'envoi
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerName}>Négociation</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* LISTE DES MESSAGES */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(item, index) =>
            item.id_message?.toString() || index.toString()
          }
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* INPUT DE SAISIE */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Écrivez votre message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", paddingTop: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "white",
  },
  backBtn: { padding: 5 },
  headerName: { fontSize: 18, fontWeight: "bold", color: "#111" },
  chatContainer: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 40 },
  messageBubble: {
    maxWidth: "80%",
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#10b981",
    borderBottomRightRadius: 5,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
    borderBottomLeftRadius: 5,
  },
  messageText: { fontSize: 16, color: "#1f2937" },
  myMessageText: { color: "white" },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#10b981",
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    elevation: 2,
  },
});
