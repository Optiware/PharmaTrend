import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1. Création du contexte
const AuthContext = createContext<any>(null);

// 2. Le "Provider" qui va englober toute l'application
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Au démarrage de l'app, on vérifie si l'utilisateur est déjà connecté en mémoire
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("@user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Erreur de chargement de la session", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Fonction pour se connecter (sauvegarde en mémoire)
  const login = async (userData: any) => {
    setUser(userData);
    await AsyncStorage.setItem("@user", JSON.stringify(userData));
  };

  // Fonction pour se déconnecter (efface la mémoire)
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("@user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Petit Hook personnalisé pour l'utiliser facilement n'importe où
export const useAuth = () => useContext(AuthContext);
