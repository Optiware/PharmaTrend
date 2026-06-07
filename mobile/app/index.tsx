import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/data";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Erreur", "Champs requis");

    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const userData = await loginUser(cleanEmail, password);

      await login(userData);
      router.replace("/(tabs)/market");
    } catch (error: any) {
      Alert.alert("Échec", error.message);
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
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/883/883407.png",
          }}
          style={styles.logo}
        />
        <Text style={styles.appName}>PharmaTrend</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9ca3af" // <-- Force le texte d'indication en gris
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Mot de passe"
            placeholderTextColor="#9ca3af" // <-- Force le texte d'indication en gris
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>SE CONNECTER</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={styles.registerLink}
        >
          <Text style={styles.linkText}>
            Pas encore de compte ?{" "}
            <Text style={{ fontWeight: "bold" }}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
  },
  logo: { width: 100, height: 100, alignSelf: "center", marginBottom: 20 },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#27ae60",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#f4f6f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "black", // <-- Force le texte tapé en noir
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: "black", // <-- Force le texte tapé en noir
  },
  eyeIcon: { padding: 15 },
  loginButton: {
    backgroundColor: "#27ae60",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold" },
  registerLink: { marginTop: 25, alignItems: "center" },
  linkText: { color: "#2c3e50", fontSize: 16 },
});
