import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/data';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      router.replace('/(tabs)/market');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      await loginUser(email, password);
      router.replace('/(tabs)/market');
    } catch (error: any) {
      Alert.alert("Échec", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/883/883407.png' }} 
              style={styles.logo} 
            />
            <Text style={styles.appName}>PharmaTrend</Text>
            <Text style={styles.tagline}>La plateforme des pharmaciens pro</Text>
          </View>

          <View style={styles.form}>
            <TextInput 
              style={styles.input} 
              placeholder="Email professionnel" 
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Mot de passe" 
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>SE CONNECTER</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerLink}>
              <Text style={styles.linkText}>Pas encore de compte ? <Text style={{fontWeight: 'bold'}}>Créer un compte</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center' }, // Centre le contenu verticalement
  container: { flex: 1, backgroundColor: 'white', justifyContent: 'center', padding: 20, minHeight: height },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logo: { width: 100, height: 100, marginBottom: 15 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#27ae60' },
  tagline: { fontSize: 16, color: 'gray', marginTop: 5 },
  form: { width: '100%' },
  input: { backgroundColor: '#f4f6f8', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  loginButton: { backgroundColor: '#27ae60', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10, elevation: 2 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  registerLink: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#2c3e50' }
});