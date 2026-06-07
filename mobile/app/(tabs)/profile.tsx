import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={{ marginTop: 10 }}>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        {/* On affiche le nom de l'entreprise ou un texte par défaut */}
        <Text style={styles.role}>{user.company_name || "Pharmacien"}</Text>
      </View>

      {/* INFORMATIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Informations</Text>

        <View style={styles.row}>
          <Ionicons name="mail-outline" size={24} color="#27ae60" />
          <Text style={styles.infoText}>{user.email}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="call-outline" size={24} color="#27ae60" />
          <Text style={styles.infoText}>
            {user.phone_number || "Non renseigné"}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="briefcase-outline" size={24} color="#27ae60" />
          <Text style={styles.infoText}>
            Rôle : {user.role || "Utilisateur"}
          </Text>
        </View>
      </View>

      {/* BOUTON DÉCONNEXION */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

// ==========================================
// 🎨 STYLES CSS
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  header: {
    backgroundColor: "#27ae60",
    paddingVertical: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  name: { fontSize: 22, fontWeight: "bold", color: "white" },
  role: { fontSize: 16, color: "#e8f5e9", marginTop: 5 },
  section: { padding: 20, marginTop: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  infoText: { marginLeft: 15, fontSize: 16, color: "#555" },
  logoutButton: {
    margin: 20,
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  logoutText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
