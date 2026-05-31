import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SellScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
        <Ionicons name="close" size={30} color="#333" />
      </TouchableOpacity>
      
      <Ionicons name="add-circle" size={80} color="#10b981" />
      <Text style={styles.title}>Vendre un équipement</Text>
      <Text style={styles.subtitle}>
        Cette fonctionnalité sera disponible dans la prochaine version.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 20 },
  closeBtn: { position: 'absolute', top: 50, right: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 20, color: '#333' },
  subtitle: { fontSize: 16, color: 'gray', textAlign: 'center', marginTop: 10 }
});