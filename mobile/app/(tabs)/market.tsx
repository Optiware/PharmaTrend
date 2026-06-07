import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMarketController } from "../../hooks/useMarket";

const CATEGORIES = ["All Items", "Robotics", "Refrigeration", "Furniture"];

export default function MarketScreen() {
  const router = useRouter();

  const {
    filteredItems,
    loading,
    selectedCat,
    setSelectedCat,
    search,
    setSearch,
  } = useMarketController();

  const renderItem = ({ item }: { item: any }) => {
    const isAvailable = item.status === "Neuf" || item.status === "Bon état";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/equipment/${item.id_equip}`)}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.price}>{item.price} €</Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isAvailable ? "#10b981" : "#f59e0b" },
                ]}
              />
              <Text style={styles.statusText}>
                {isAvailable ? "Available" : "Pending"}
              </Text>
            </View>
            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={14} color="#666" />
              {/* CORRECTION ICI : le "s" a été retiré */}
              <Text style={styles.distanceText}>See map</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.topBar}>
          <Text style={styles.appName}>PharmaTrend 💊</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proText}>MARKETPLACE PRO</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#10b981"
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search equipment..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catBtn,
                selectedCat === cat && styles.catBtnActive,
              ]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text
                style={[
                  styles.catText,
                  selectedCat === cat && styles.catTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_equip.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListFooterComponent={
            <View style={styles.premiumBanner}>
              <Text style={styles.bannerTitle}>Sell faster</Text>
              <Text style={styles.bannerSubtitle}>
                Reach 5,000+ pharmacies.
              </Text>
              <TouchableOpacity style={styles.bannerButton}>
                <Text style={styles.bannerBtnText}>Post Ad</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", paddingTop: 40 },
  headerContainer: { paddingHorizontal: 20, marginBottom: 10 },
  topBar: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  appName: { fontSize: 22, fontWeight: "800", color: "#111" },
  proBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  proText: { color: "#10b981", fontSize: 10, fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "black", // <-- Ajout pour le mode sombre
  },
  catScroll: { marginBottom: 10 },
  catBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  catBtnActive: { backgroundColor: "#10b981", borderColor: "#10b981" },
  catText: { color: "#6b7280", fontWeight: "600" },
  catTextActive: { color: "white" },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    padding: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#10b981",
    elevation: 3,
  },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "bold", flex: 1 },
  price: { fontSize: 18, color: "#10b981", fontWeight: "bold" },
  description: { fontSize: 14, color: "#6b7280", marginBottom: 15 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  locationContainer: { flexDirection: "row", alignItems: "center" },
  distanceText: { fontSize: 12, color: "#6b7280", marginLeft: 4 },
  premiumBanner: {
    backgroundColor: "#10b981",
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  bannerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  bannerSubtitle: { color: "white", fontSize: 14, marginBottom: 10 },
  bannerButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  bannerBtnText: { color: "#10b981", fontWeight: "bold" },
});
