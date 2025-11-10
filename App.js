import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { initDatabase } from './src/database/database';
import { colors } from './src/theme/colors';

export default function App() {
  const [isDBReady, setIsDBReady] = useState(false);
  const [error, setError] = useState(null);
  
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    initializeDB();
  }, []);

  const initializeDB = async () => {
    try {
      console.log('🚀 Inicializando aplicación...');
      await initDatabase();
      console.log('✅ Base de datos inicializada correctamente');
      setIsDBReady(true);
    } catch (err) {
      console.error('❌ Error inicializando app:', err);
      setError(err.message);
    }
  };

  if (!fontsLoaded || !isDBReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={[styles.loadingText, { fontFamily: 'system' }]}>Cargando SmallBtrucks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: colors.brand.primary,
            background: colors.background.primary,
            card: colors.background.card,
            text: colors.text.primary,
            border: colors.background.surface,
            notification: colors.brand.secondary,
          },
        }}
      >
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.text.primary,
    fontFamily: 'Poppins-Medium',
  },
  errorText: {
    fontSize: 16,
    color: colors.status.error,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: 'Poppins-Medium',
  },
  errorText: {
    fontSize: 16,
    color: colors.status.error,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginHorizontal: 32,
  },
  errorDetail: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
  },
});
