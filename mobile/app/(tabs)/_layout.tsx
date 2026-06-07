import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10b981", // Le Vert "Emerald" des images
        tabBarInactiveTintColor: "#9ca3af",
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 0,
          elevation: 10, // Ombre Android
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: Platform.OS === "android" ? 60 + insets.bottom : 90,
          paddingBottom: Platform.OS === "android" ? insets.bottom + 5 : 30,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="market"
        options={{
          title: "Market",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "storefront" : "storefront-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="trends"
        options={{
          title: "Trends",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "flame" : "flame-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* LE GROS BOUTON "+" CENTRAL */}
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarIcon: () => (
            <View
              style={{
                top: -15,
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#10b981",
                justifyContent: "center",
                alignItems: "center",
                elevation: 5,
                shadowColor: "#10b981",
                shadowOpacity: 0.3,
                shadowRadius: 5,
              }}
            >
              <Ionicons name="add" size={30} color="white" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="message"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubble" : "chatbubble-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
