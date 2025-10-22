import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { viajeService } from '../database/viajeService';

const { width: screenWidth } = Dimensions.get('window');
const cardMargin = Math.max(16, screenWidth * 0.04);
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function ViajesProgramadosScreen({ navigation }) {
  const [viajes, setViajes] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadViajes);
    return unsubscribe;
  }, [navigation]);

  const loadViajes = async () => {
    const data = await viajeService.getProgramados();
    setViajes(data);
  };

  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'En proceso' ? 'Completado' : 'En proceso';
    await viajeService.updateEstado(id, nuevoEstado);
    loadViajes();
  };

  const incrementarViaje = async (viajeId) => {
    try {
      await viajeService.incrementarViajeCompletado(viajeId);
      loadViajes();
    } catch (error) {
      Alert.alert('Error', 'No se pudo incrementar el viaje');
    }
  };

  const decrementarViaje = async (viajeId) => {
    try {
      await viajeService.decrementarViajeCompletado(viajeId);
      loadViajes();
    } catch (error) {
      Alert.alert('Error', 'No se pudo decrementar el viaje');
    }
  };

  const eliminarViaje = (viajeId, camionNombre, destinoNombre) => {
    Alert.alert(
      'Eliminar Viaje',
      `¿Eliminar viaje de ${camionNombre} a ${destinoNombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await viajeService.deleteViaje(viajeId);
              loadViajes();
              Alert.alert('Éxito', 'Viaje eliminado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el viaje');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Viajes Programados</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddViaje')}
        >
          <Text style={styles.addButtonText}>➕</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={viajes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.camion}>🚛 {item.camion_nombre}</Text>
              <View style={styles.statusContainer}>
                <Text style={[styles.estado, { color: item.estado === 'Completado' ? '#4CAF50' : '#FF9800' }]}>
                  {item.estado === 'Completado' ? '✅' : '🟡'}
                </Text>
                <TouchableOpacity 
                  onPress={() => eliminarViaje(item.id, item.camion_nombre, item.destino_nombre)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.destino}>📍 {item.destino_nombre}</Text>
            
            {/* Barra de progreso */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Progreso: {item.viajes_completados || 0}/{item.cantidad_viajes}
              </Text>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${((item.viajes_completados || 0) / item.cantidad_viajes) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Botones de control */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={[styles.controlButton, styles.decrementButton]}
                onPress={() => decrementarViaje(item.id)}
                disabled={(item.viajes_completados || 0) === 0}
              >
                <Text style={styles.buttonText}>− Restar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.incrementButton]}
                onPress={() => incrementarViaje(item.id)}
                disabled={(item.viajes_completados || 0) >= item.cantidad_viajes}
              >
                <Text style={styles.buttonText}>+ Entregado</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.info}>📅 {item.fecha_programada}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>📋</Text>
            <Text style={styles.emptySubtext}>No hay viajes programados</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: cardPadding, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  addButton: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8 },
  addButtonText: { color: 'white', fontSize: 20 },
  card: { backgroundColor: 'white', margin: cardMargin, marginBottom: 12, padding: cardPadding, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  camion: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  estado: { fontSize: 24 },
  deleteButton: { padding: 4 },
  deleteButtonText: { fontSize: 20 },
  destino: { fontSize: 16, color: '#666', marginBottom: 8 },
  info: { fontSize: 14, color: '#666', marginTop: 8 },
  estadoText: { fontSize: 12, fontWeight: '600', marginTop: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 64, marginBottom: 16 },
  emptySubtext: { fontSize: 16, color: '#666' },
  progressContainer: { marginVertical: 12 },
  progressText: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  progressBarBg: { 
    height: 10, 
    backgroundColor: '#E0E0E0', 
    borderRadius: 5, 
    overflow: 'hidden' 
  },
  progressBarFill: { 
    height: '100%', 
    backgroundColor: '#4CAF50', 
    borderRadius: 5 
  },
  buttonsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 12,
    gap: 10 
  },
  controlButton: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  incrementButton: { backgroundColor: '#4CAF50' },
  decrementButton: { backgroundColor: '#FF6F00' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});
