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
}

export interface Product {
  id_product: number;
  name: string;
  category: string;
  likes_count: number;
  image_url: string;
}

// --- FONCTION D'APPEL GÉNÉRIQUE (Interne) ---
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
// 🔐 AUTHENTIFICATION & SESSION (Login/Register)
// ==================================================

export const registerUser = async (userData: any) => {
  // userData contient : { name, email, password, companyName, phone, role }
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

  // Si login réussi, on sauvegarde la session dans le téléphone
  if (data.success && data.user) {
    await AsyncStorage.setItem("userId", data.user.id_user.toString());
    await AsyncStorage.setItem("userName", data.user.name);
  }

  return data.user;
};

export const logoutUser = async () => {
  await AsyncStorage.clear(); // On vide la mémoire du téléphone
};

export const getUserProfile = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("Utilisateur non connecté");
  return await fetchAPI(`/users/${userId}`);
};

// ==================================================
// 🛒 MARKETPLACE (Equipments)
// ==================================================

export const getEquipments = async (category = "Tout") => {
  try {
    // Gestion du filtre par catégorie
    // Si c'est "Tout", on appelle /equipments, sinon /equipments?category=...
    const endpoint =
      category === "Tout" ? "/equipments" : `/equipments?category=${category}`;
    const data = await fetchAPI(endpoint);
    return data || [];
  } catch (e) {
    return []; // Retourne vide si erreur pour ne pas bloquer l'app
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
    const data = await fetchAPI("/products/trends");
    return data || [];
  } catch (e) {
    return [];
  }
};

export const swipeProduct = async (
  id_product: number,
  action: "LIKE" | "DISLIKE",
) => {
  try {
    // On récupère l'ID user pour savoir qui like
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return;

    await fetch(`${API_URL}/swipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_user: userId, id_product, action }),
    });
  } catch (e) {
    console.error("Erreur silencieuse swipe", e);
  }
};

// ==================================================
// 💬 MESSAGERIE (NOUVEAU)
// ==================================================

export const getMyConversations = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return [];

    // Appelle la route que l'on vient de créer dans server.js
    return await fetchAPI(`/my-conversations/${userId}`);
  } catch (error) {
    console.log("Erreur chargement conversations", error);
    return [];
  }
};
