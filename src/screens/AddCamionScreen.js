import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { camionService } from '../database/camionService';

const { width: screenWidth } = Dimensions.get('window');
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function AddCamionScreen({ navigation }) {
  const [nombre, setNombre] = useState('');

  const handleSubmit = async () => {
    if (!nombre) {
      Alert.alert('Error', 'Ingresa el nombre del camión');
      return;
    }
    try {
      await camionService.create(nombre);
      Alert.alert('Éxito', 'Camión registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error guardando camión:', error);
      Alert.alert('Error', 'No se pudo guardar el camión');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          <Text style={styles.label}>Nombre del Camión *</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Camión F1"
            autoCapitalize="words"
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>💾 Guardar Camión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { flex: 1 },
  form: { padding: cardPadding },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: 'white', padding: 16, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#2196F3', padding: 18, borderRadius: 8, marginTop: 24 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
