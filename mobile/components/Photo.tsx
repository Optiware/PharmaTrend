import React, { useState } from "react";
import { Image, View, type ImageStyle, type StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/** Photo d'une annonce ou d'un produit ; une illustration la remplace si elle manque ou ne charge pas. */
export default function Photo({
  uri,
  style,
  icone = "medkit-outline",
}: {
  uri?: string | null;
  style: StyleProp<ImageStyle>;
  icone?: keyof typeof Ionicons.glyphMap;
}) {
  const [erreur, setErreur] = useState(false);
  if (uri && !erreur) {
    return <Image source={{ uri }} style={style} onError={() => setErreur(true)} />;
  }
  return (
    <View
      style={[
        style as object,
        { backgroundColor: "#e8f8ef", alignItems: "center", justifyContent: "center" },
      ]}
    >
      <Ionicons name={icone} size={72} color="#27ae60" />
    </View>
  );
}
