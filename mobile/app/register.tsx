import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { registerUser } from "../services/data";

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ✅ On ajoute le champ 'role' dans le formulaire
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    phone: "",
    role: "PHARMACIST", // Valeur par défaut : Pharmacien (Acheteur)
  });

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Erreur", "Merci de remplir les champs obligatoires (*)");
      return;
    }

    setLoading(true);
    try {
      // On envoie tout le formulaire (y compris le rôle)
      await registerUser(form);

      Alert.alert("Compte créé !", "Vous pouvez maintenant vous connecter.", [
        { text: "SE CONNECTER", onPress: () => router.replace("/") },
      ]);
    } catch (error: any) {
      Alert.alert("Oups", error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Rejoignez la communauté PharmaTrend
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nom complet (ex: Alexis Demo) *"
            placeholderTextColor="#aaa"
            onChangeText={(t) => setForm({ ...form, name: t })}
          />

          <TextInput
            style={styles.input}
            placeholder="Nom de la Pharmacie / Entreprise"
            placeholderTextColor="#aaa"
            onChangeText={(t) => setForm({ ...form, companyName: t })}
          />

          <TextInput
            style={styles.input}
            placeholder="Email Pro *"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(t) => setForm({ ...form, email: t })}
          />

          <TextInput
            style={styles.input}
            placeholder="Téléphone mobile"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            onChangeText={(t) => setForm({ ...form, phone: t })}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe *"
            placeholderTextColor="#aaa"
            secureTextEntry
            onChangeText={(t) => setForm({ ...form, password: t })}
          />

          {/* 🔥 SÉLECTEUR DE RÔLE (NOUVEAU) */}
          <Text style={styles.labelRole}>Vous êtes :</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                form.role === "PHARMACIST" && styles.roleBtnActive,
              ]}
              onPress={() => setForm({ ...form, role: "PHARMACIST" })}
            >
              <Ionicons
                name="medkit-outline"
                size={20}
                color={form.role === "PHARMACIST" ? "white" : "#555"}
              />
              <Text
                style={[
                  styles.roleText,
                  form.role === "PHARMACIST" && styles.roleTextActive,
                ]}
              >
                Pharmacien
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                form.role === "SELLER" && styles.roleBtnActiveSeller,
              ]}
              onPress={() => setForm({ ...form, role: "SELLER" })}
            >
              <Ionicons
                name="briefcase-outline"
                size={20}
                color={form.role === "SELLER" ? "white" : "#555"}
              />
              <Text
                style={[
                  styles.roleText,
                  form.role === "SELLER" && styles.roleTextActive,
                ]}
              >
                Vendeur Pro
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>S'INSCRIRE</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    padding: 20,
    paddingTop: 60,
  },
  header: { marginBottom: 20 },
  backBtn: { marginBottom: 10 },
  title: { fontSize: 32, fontWeight: "bold", color: "#27ae60" },
  subtitle: { fontSize: 16, color: "gray", marginTop: 5 },
  form: { gap: 12 },
  input: {
    backgroundColor: "#f5f6fa",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#eee",
  },

  // Styles du sélecteur
  labelRole: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
    marginBottom: 5,
  },
  roleContainer: { flexDirection: "row", gap: 10, marginBottom: 15 },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f5f6fa",
    borderWidth: 1,
    borderColor: "#eee",
  },
  roleBtnActive: { backgroundColor: "#27ae60", borderColor: "#27ae60" }, // Vert pour Pharmacien
  roleBtnActiveSeller: { backgroundColor: "#3498db", borderColor: "#3498db" }, // Bleu pour Vendeur
  roleText: { marginLeft: 8, fontWeight: "600", color: "#555" },
  roleTextActive: { color: "white" },

  button: {
    backgroundColor: "#27ae60",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 18 },
});
