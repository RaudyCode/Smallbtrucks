import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { camionService } from '../database/camionService';

const { width: screenWidth } = Dimensions.get('window');
const cardMargin = Math.max(16, screenWidth * 0.04);
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function CamionListScreen({ navigation }) {
  const [camiones, setCamiones] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCamiones);
    return unsubscribe;
  }, [navigation]);

  const loadCamiones = async () => {
    const data = await camionService.getAll();
    setCamiones(data);
  };

  const handleDelete = (id, nombre) => {
    Alert.alert('Eliminar', `¿Eliminar ${nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', onPress: async () => {
        await camionService.delete(id);
        loadCamiones();
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCamion')}
      >
        <Text style={styles.addButtonText}>➕ Agregar Camión</Text>
      </TouchableOpacity>
      <FlatList
        data={camiones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.cardContent}
              onPress={() => navigation.navigate('CamionDetail', { camionId: item.id })}
            >
              <Text style={styles.nombre}>🚛 {item.nombre}</Text>
              <Text style={styles.stats}>{item.viajes_realizados} viajes realizados</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id, item.nombre)}>
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: cardPadding },
  addButton: { backgroundColor: '#2196F3', padding: 16, borderRadius: 8, marginBottom: 16 },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  card: { backgroundColor: 'white', padding: cardPadding, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardContent: { flex: 1 },
  nombre: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  stats: { fontSize: 14, color: '#666', marginTop: 4 },
  deleteText: { fontSize: 20 },
});
