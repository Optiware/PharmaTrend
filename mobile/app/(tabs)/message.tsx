import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyConversations } from '../../services/data';

export default function MessagesListScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // useFocusEffect permet de recharger la liste à chaque fois qu'on clique sur l'onglet
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const loadConversations = async () => {
    setLoading(true);
    const data = await getMyConversations();
    setConversations(data);
    setLoading(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/chat/${item.id_user}`)} // Redirige vers le chat existant
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.company}>{item.company_name}</Text>
        <Text style={styles.subtitle}>Appuyez pour voir la discussion</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Messages</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#27ae60" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id_user.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <View style={styles.empty}>
                <Ionicons name="chatbubbles-outline" size={50} color="#ccc" />
                <Text style={{color:'gray', marginTop:10}}>Aucune conversation pour le moment.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { backgroundColor: 'white', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderColor: '#eee', elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#27ae60' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  company: { fontSize: 14, color: '#27ae60', marginBottom: 2 },
  subtitle: { fontSize: 12, color: 'gray' },
  empty: { alignItems: 'center', marginTop: 100 }
});