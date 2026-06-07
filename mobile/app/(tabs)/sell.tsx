import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Config from "../../constants/Config";
import { useAuth } from "../../context/AuthContext";

export default function SellScreen() {
  const router = useRouter();
  const { user } = useAuth(); // Récupération de l'utilisateur connecté

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Robotics");

  const handlePostAd = async () => {
    // 1. Validation de base
    if (!title || !price) {
      Alert.alert("Erreur", "Veuillez remplir le titre et le prix.");
      return;
    }

    // 2. Sécurité : Vérification que l'utilisateur est bien connecté
    if (!user || !user.id_user) {
      Alert.alert(
        "Erreur",
        "Vous devez être connecté pour publier une annonce.",
      );
      return;
    }

    try {
      await fetch(
        `${Config.API_URL || "http://69.62.110.32:3000"}/equipments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            price: parseFloat(price),
            status: category,
            location: "France",
            id_user: user.id_user, // Utilisation de l'ID dynamique
          }),
        },
      );
      Alert.alert("Succès !", "Votre annonce est en ligne.");

      // Réinitialisation du formulaire
      setTitle("");
      setPrice("");
      setDescription("");

      // Redirection vers la marketplace pour voir l'annonce
      router.push("/market");
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de publier l'annonce.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>Vendre un équipement</Text>

        <Text style={styles.label}>Titre de l'annonce</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Échographe Portable"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Prix (€)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 1500"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.catContainer}>
          {["Robotics", "Refrigeration", "Furniture"].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, category === cat && styles.catBtnActive]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={category === cat ? styles.catTextActive : styles.catText}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="État, année d'achat, fonctionnalités..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handlePostAd}>
          <Text style={styles.submitButtonText}>Publier l'annonce</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// 🎨 STYLES CSS
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 20 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#555" },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  catContainer: { flexDirection: "row", marginBottom: 20 },
  catBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#10b981",
    borderRadius: 20,
    marginRight: 10,
  },
  catBtnActive: { backgroundColor: "#10b981" },
  catText: { color: "#10b981" },
  catTextActive: { color: "#fff", fontWeight: "bold" },
  submitButton: {
    backgroundColor: "#10b981",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
