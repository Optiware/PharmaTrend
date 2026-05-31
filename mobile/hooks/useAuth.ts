import { useState } from "react";
import { loginUser, registerUser } from "../services/data";

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      setUser(data);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (
    name: string,
    companyName: string, // Remplacé company_name par companyName (camelCase)
    email: string,
    password: string,
    role: string = "PHARMACIST", // J'ai ajouté le rôle par défaut
  ) => {
    setLoading(true);
    setError(null);
    try {
      // 🟢 On envoie bien un OBJET comme attendu par ta fonction registerUser dans data.ts
      const userData = { name, companyName, email, password, role };
      const data = await registerUser(userData);

      setUser(data);
    } catch (err: any) {
      setError(err.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, user, handleLogin, handleRegister };
}
