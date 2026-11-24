// Catégories d'annonces : la valeur est gardée en base (colonne `status`), le libellé s'affiche.
export const CATEGORIES = ["Robotics", "Refrigeration", "Furniture"] as const;

export const LIBELLES_CATEGORIE: Record<string, string> = {
  Tout: "Tout",
  Robotics: "Robotique",
  Refrigeration: "Froid",
  Furniture: "Mobilier",
};

export const libelleCategorie = (valeur: string) => LIBELLES_CATEGORIE[valeur] ?? valeur;
