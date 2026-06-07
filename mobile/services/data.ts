import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Config";

// --- DÉFINITION DES TYPES ---
export interface Equipment {
  id_equip: number;
  title: string;
  description: string;
  price: number;
  status: string;
  image_url: string;
  location?: string;
  id_user?: number;
}

export interface User {
  id_user: number;
  name: string;
  email: string;
}

// --- FONCTION D'APPEL GÉNÉRIQUE ---
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    console.log(`📡 Appel vers : ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Erreur HTTP: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.log(`⚠️ ERREUR API sur ${endpoint} :`, error);
    throw error;
  }
}

// ==================================================
// 🔐 AUTHENTIFICATION & SESSION
// ==================================================

export const registerUser = async (userData: any) => {
  return await fetchAPI("/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (email: string, pass: string) => {
  const data = await fetchAPI("/login", {
    method: "POST",
    body: JSON.stringify({ email, password: pass }),
  });

  // Si login réussi, on sauvegarde l'objet complet en JSON
  if (data.success && data.user) {
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
  }

  return data.user;
};

export const logoutUser = async () => {
  await AsyncStorage.clear();
};

// Fonction utilitaire pour récupérer l'utilisateur connecté partout
export const getStoredUser = async (): Promise<User | null> => {
  const user = await AsyncStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// ==================================================
// 🛒 MARKETPLACE
// ==================================================

export const getEquipments = async (category = "Tout") => {
  try {
    const endpoint =
      category === "Tout" ? "/equipments" : `/equipments?category=${category}`;
    return await fetchAPI(endpoint);
  } catch (e) {
    return [];
  }
};

export const getEquipmentDetail = async (id: string) => {
  return await fetchAPI(`/equipments/${id}`);
};

// ==================================================
// 🔥 TRENDS (Produits & Swipes)
// ==================================================

export const getTrends = async () => {
  try {
    return await fetchAPI("/products/trends");
  } catch (e) {
    return [];
  }
};

export const swipeProduct = async (
  id_product: number,
  action: "LIKE" | "DISLIKE",
) => {
  try {
    const user = await getStoredUser();
    if (!user) return;

    await fetch(`${API_URL}/swipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_user: user.id_user, id_product, action }),
    });
  } catch (e) {
    console.error("Erreur swipe", e);
  }
};

// ==================================================
// 💬 MESSAGERIE
// ==================================================

export const getMyConversations = async () => {
  try {
    const user = await getStoredUser();
    if (!user) return [];

    return await fetchAPI(`/my-conversations/${user.id_user}`);
  } catch (error) {
    console.log("Erreur chargement conversations", error);
    return [];
  }
};
