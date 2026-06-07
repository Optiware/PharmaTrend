import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Config from "../../constants/Config";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function InboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch(
      `${Config.API_URL || "http://69.62.110.32:3000"}/my-conversations/${user.id_user}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement inbox:", err);
        setLoading(false);
      });
  }, [user]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() =>
        router.push({
          pathname: `/chat/${item.contact_id}`,
          params: {
            contactName: item.contact_name, // <-- On utilise le vrai nom du Backend !
            productName: "Annonce",
          },
        })
      }
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color="#fff" />
      </View>
      <View style={styles.info}>
        {/* 🟢 Sécurité : Si le nom est vide, on affiche l'ID. On force aussi la couleur en noir ! */}
        <Text style={[styles.contactName, { color: "black" }]}>
          {item.contact_name
            ? item.contact_name
            : `Contact #${item.contact_id}`}
        </Text>
        <Text style={styles.subText}>Appuyez pour discuter</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Mes Messages</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#10b981"
          style={{ marginTop: 50 }}
        />
      ) : !user ? (
        <Text style={styles.emptyText}>
          Veuillez vous connecter pour voir vos messages.
        </Text>
      ) : conversations.length > 0 ? (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.contact_id.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.emptyText}>Aucune conversation en cours.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  headerTitle: { fontSize: 28, fontWeight: "bold", padding: 20, color: "#333" },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  info: { flex: 1 },
  contactName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  subText: { fontSize: 14, color: "#888", marginTop: 4 },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#888",
    fontSize: 16,
  },
});
