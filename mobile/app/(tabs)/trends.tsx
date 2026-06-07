import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import Swiper from "react-native-deck-swiper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Config from "../../constants/Config";
import { useAuth } from "../../context/AuthContext"; // 🟢 Import du contexte

interface Product {
  id_product: number;
  name: string;
  image_url: string;
  likes_count: number;
}

export default function TrendsScreen() {
  const { user } = useAuth(); // 🟢 Récupération dynamique
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${Config.API_URL || "http://69.62.110.32:3000"}/products/trends`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => console.error("Erreur chargement trends:", err));
  }, []);

  const handleSwipe = async (index: number, action: string) => {
    const product = products[index];

    // 🟢 Sécurité
    if (!user || !user.id_user) return;

    try {
      await fetch(`${Config.API_URL || "http://69.62.110.32:3000"}/swipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_user: user.id_user, // 🟢 ID Dynamique
          id_product: product.id_product,
          action: action,
        }),
      });
    } catch (e) {
      console.error("Erreur lors du swipe:", e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Chargement des équipements...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>PharmaTrends</Text>
      <Text style={styles.subtitle}>Glisse à droite pour liker !</Text>

      {products.length > 0 ? (
        <Swiper
          cards={products}
          renderCard={(card) => (
            <View style={styles.card}>
              <Image source={{ uri: card.image_url }} style={styles.image} />
              <View style={styles.cardInfo}>
                <Text style={styles.title}>{card.name}</Text>
                <Text style={styles.likes}>❤️ {card.likes_count} favoris</Text>
              </View>
            </View>
          )}
          onSwipedRight={(cardIndex) => handleSwipe(cardIndex, "LIKE")}
          onSwipedLeft={(cardIndex) => handleSwipe(cardIndex, "PASS")}
          cardIndex={0}
          backgroundColor={"transparent"}
          stackSize={3}
          cardVerticalMargin={20}
          animateCardOpacity
          overlayLabels={{
            left: {
              title: "NOPE",
              style: {
                label: {
                  backgroundColor: "red",
                  color: "white",
                  fontSize: 24,
                  borderRadius: 10,
                },
              },
            },
            right: {
              title: "LIKE",
              style: {
                label: {
                  backgroundColor: "green",
                  color: "white",
                  fontSize: 24,
                  borderRadius: 10,
                },
              },
            },
          }}
        />
      ) : (
        <Text style={styles.emptyText}>
          Plus de produits à découvrir aujourd'hui !
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#888",
    marginBottom: 10,
  },
  card: { flex: 0.75, borderRadius: 20, backgroundColor: "#fff", elevation: 8 },
  image: {
    width: "100%",
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardInfo: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "white",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 5 },
  likes: { fontSize: 16, color: "#e74c3c", fontWeight: "600" },
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: "#999",
  },
});
