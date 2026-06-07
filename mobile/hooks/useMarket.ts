import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { getEquipments } from "../services/data";

export function useMarketController() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("All Items");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getEquipments(
            selectedCat === "All Items" ? "Tout" : selectedCat,
          );
          if (isActive) setItems(data);
        } catch (err) {
          if (isActive) setError("Erreur lors du chargement des équipements");
        } finally {
          if (isActive) setLoading(false);
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [selectedCat]),
  );

  const filteredItems = items.filter((item: any) =>
    item.title?.toLowerCase().includes(search.toLowerCase()),
  );

  return {
    filteredItems,
    loading,
    error,
    selectedCat,
    setSelectedCat,
    search,
    setSearch,
  };
}
