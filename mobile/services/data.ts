import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/Config";

// --- TYPES ---
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
  role: string;
  company_name?: string | null;
}

export interface Message {
  id_message?: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at?: string;
}

const CLE_JETON = "token";

export const getToken = () => AsyncStorage.getItem(CLE_JETON);

// --- APPEL GÉNÉRIQUE : ajoute le jeton de connexion s'il existe ---
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const jeton = await getToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Erreur HTTP ${response.status}`);
  }
  return data;
}

// ==================================================
// AUTHENTIFICATION
// ==================================================

export const registerUser = (userData: {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  role?: string;
}) =>
  fetchAPI("/register", { method: "POST", body: JSON.stringify(userData) });

/** Connecte l'utilisateur et garde son jeton ; renvoie son profil. */
export const loginUser = async (email: string, pass: string): Promise<User> => {
  const data = await fetchAPI("/login", {
    method: "POST",
    body: JSON.stringify({ email, password: pass }),
  });
  await AsyncStorage.setItem(CLE_JETON, data.token);
  return data.user;
};

export const logoutUser = () => AsyncStorage.removeItem(CLE_JETON);

// ==================================================
// MARKETPLACE
// ==================================================

export const getEquipments = async (category = "Tout"): Promise<Equipment[]> => {
  try {
    const endpoint =
      category === "Tout"
        ? "/equipments"
        : `/equipments?category=${encodeURIComponent(category)}`;
    return await fetchAPI(endpoint);
  } catch {
    return [];
  }
};

export const getEquipmentDetail = (id: string | number): Promise<Equipment> =>
  fetchAPI(`/equipments/${id}`);

export const postEquipment = (annonce: {
  title: string;
  description: string;
  price: number;
  status: string;
}) => fetchAPI("/equipments", { method: "POST", body: JSON.stringify(annonce) });

// ==================================================
// TENDANCES
// ==================================================

export const getTrends = async () => {
  try {
    return await fetchAPI("/products/trends");
  } catch {
    return [];
  }
};

export const swipeProduct = (id_product: number, action: "LIKE" | "PASS") =>
  fetchAPI("/swipes", { method: "POST", body: JSON.stringify({ id_product, action }) });

// ==================================================
// MESSAGERIE
// ==================================================

export const getMyConversations = async (): Promise<
  { contact_id: number; contact_name: string }[]
> => {
  try {
    return await fetchAPI("/my-conversations");
  } catch {
    return [];
  }
};

export const getConversation = (contactId: number): Promise<Message[]> =>
  fetchAPI(`/messages/${contactId}`);
