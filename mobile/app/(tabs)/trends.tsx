import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTrendsController } from "../../hooks/useTrends";

const { width, height } = Dimensions.get("window");

export default function TrendsScreen() {
  const { currentProduct, isFinished, loading, handleSwipe, reloadTrends } =
    useTrendsController();

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );

  // S'il n'y a plus de produits à voir
  if (isFinished || !currentProduct)
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={80} color="#10b981" />
        <Text style={{ marginTop: 10, color: "gray" }}>Plus de produits !</Text>
        <TouchableOpacity onPress={reloadTrends} style={styles.reload}>
          <Text style={{ color: "white" }}>Recharger</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Top Trends 🔥</Text>
        <Text style={styles.headerSubtitle}>
          Produits populaires de la semaine
        </Text>
      </View>

      {/* LA GRANDE CARTE */}
      <View style={styles.card}>
        {/* Ajout d'une couleur de fond grise au cas où l'image met du temps à charger */}
        <Image
          source={{ uri: currentProduct.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <View style={styles.tag}>
            {/* On ajoute une sécurité ?. au cas où la catégorie n'existe pas encore */}
            <Text style={styles.tagText}>
              {currentProduct.category?.toUpperCase() || "PRODUIT"}
            </Text>
          </View>
          <Text style={styles.name}>{currentProduct.name}</Text>
          <Text style={styles.desc}>
            Lot disponible immédiatement pour distribution en pharmacie.
          </Text>

          <View style={styles.likesRow}>
            <Ionicons name="heart" size={20} color="#e11d48" />
            <Text style={styles.likesText}>
              {currentProduct.likes_count || 0} Pharmaciens intéressés
            </Text>
          </View>
        </View>
      </View>

      {/* BOUTONS ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnDislike}
          onPress={() => handleSwipe("DISLIKE")}
        >
          <Ionicons name="close" size={35} color="#4b5563" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnLike}
          onPress={() => handleSwipe("LIKE")}
        >
          <Ionicons name="flame" size={35} color="#e11d48" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    paddingTop: 40,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#e11d48" },
  headerSubtitle: { fontSize: 14, color: "#6b7280" },

  card: {
    width: width * 0.9,
    height: height * 0.58,
    backgroundColor: "white",
    borderRadius: 30,
    elevation: 10,
    overflow: "hidden",
  },
  image: { width: "100%", height: "55%", backgroundColor: "#e5e7eb" },
  cardContent: { padding: 25, flex: 1 },
  tag: {
    backgroundColor: "#fce7f3",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 10,
  },
  tagText: { color: "#be185d", fontWeight: "bold", fontSize: 12 },
  name: { fontSize: 24, fontWeight: "bold", color: "#111", marginBottom: 10 },
  desc: { fontSize: 16, color: "#6b7280", lineHeight: 22, marginBottom: 15 },
  likesRow: { flexDirection: "row", alignItems: "center" },
  likesText: { marginLeft: 10, color: "#e11d48", fontWeight: "bold" },

  actions: { flexDirection: "row", marginTop: 30, gap: 40 },
  btnDislike: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  btnLike: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fbbf24",
  },
  reload: {
    marginTop: 20,
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 8,
  },
});
