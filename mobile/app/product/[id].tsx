import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/Config"; // On utilise ta config !

export default function EquipmentDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipmentDetail();
  }, [id]);

  const fetchEquipmentDetail = async () => {
    try {
      const response = await fetch(`${API_URL}/equipments/${id}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
      }
    } catch (error) {
      console.error("Erreur détail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#27ae60"
        style={{ marginTop: 50 }}
      />
    );
  if (!item)
    return (
      <Text style={{ textAlign: "center", marginTop: 50 }}>
        Produit introuvable 😕
      </Text>
    );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Bouton Retour */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Image source={{ uri: item.image_url }} style={styles.image} />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>{item.price} €</Text>
          </View>

          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>{item.status}</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>

          <Text style={styles.sectionTitle}>Localisation</Text>
          <View style={styles.locationBox}>
            <Ionicons name="map" size={20} color="#27ae60" />
            <Text style={{ marginLeft: 10, color: "gray" }}>
              Visible sur la carte (GPS intégré)
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Barre d'action en bas */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactText}>Contacter le vendeur</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    elevation: 5,
  },
  image: { width: "100%", height: 300, resizeMode: "cover" },
  content: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 24, fontWeight: "bold", flex: 1 },
  price: { fontSize: 24, fontWeight: "bold", color: "#27ae60" },
  badgeContainer: { flexDirection: "row", marginBottom: 20 },
  badge: {
    backgroundColor: "#e1f5fe",
    color: "#0288d1",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  description: { fontSize: 16, color: "#555", lineHeight: 24 },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "white",
  },
  contactButton: {
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  contactText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
