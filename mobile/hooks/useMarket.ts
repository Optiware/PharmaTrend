import { useState, useEffect } from "react";
import { getEquipments } from "../services/data";

export function useMarketController() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("All Items");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCat]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEquipments(
        selectedCat === "All Items" ? "Tout" : selectedCat,
      );
      setItems(data);
    } catch (err) {
      setError("Erreur lors du chargement des équipements");
    } finally {
      setLoading(false);
    }
  };

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
