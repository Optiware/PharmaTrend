import { useState, useEffect } from "react";
import { getTrends, swipeProduct } from "../services/data"; // 🟢 On importe depuis ton super service !

export function useTrendsController() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. Charger les produits au démarrage
  useEffect(() => {
    loadTrends();
  }, []);

  async function loadTrends() {
    setLoading(true);
    // 🟢 On utilise ta fonction du fichier data.ts, c'est beaucoup plus propre !
    const data = await getTrends();
    setProducts(data);
    setCurrentIndex(0);
    setLoading(false);
  }

  // 2. Fonction pour gérer le swipe (gauche ou droite)
  async function handleSwipe(action: "LIKE" | "DISLIKE") {
    if (currentIndex >= products.length) return;

    const currentProduct = products[currentIndex];

    // On passe au produit suivant immédiatement pour la fluidité (Optimistic UI)
    setCurrentIndex((prev) => prev + 1);

    // 🟢 On appelle l'API via ton service data.ts
    await swipeProduct(currentProduct.id_product, action);
  }

  const currentProduct = products[currentIndex];
  const isFinished = currentIndex >= products.length;

  return {
    currentProduct,
    isFinished,
    loading,
    handleSwipe,
    reloadTrends: loadTrends,
  };
}
