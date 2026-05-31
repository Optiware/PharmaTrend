import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router"; // <--- Import important
import { Ionicons } from "@expo/vector-icons";
import { getUserProfile, logoutUser } from "../../services/data";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setUser(data);
    } catch (error) {
      console.log("Non connecté, redirection...");

      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/"); // Retour au login après déconnexion
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#27ae60"
        style={{ marginTop: 50 }}
      />
    );

  // Si l'utilisateur est null (erreur de chargement), on affiche rien en attendant la redirection
  if (!user) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {/* ... GARDE TOUT TON CODE D'AFFICHAGE ICI ... */}
      {/* ... Header, Section, Bouton Déconnexion ... */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>{user?.company_name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes Informations</Text>
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={24} color="#27ae60" />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={24} color="#27ae60" />
          <Text style={styles.infoText}>
            {user?.phone_number || "Non renseigné"}
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="briefcase-outline" size={24} color="#27ae60" />
          <Text style={styles.infoText}>Rôle : {user?.role}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

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
  role: { fontSize: 16, color: "#e8f5e9" },
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
  },
  logoutText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
