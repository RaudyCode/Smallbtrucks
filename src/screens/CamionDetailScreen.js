import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { camionService } from '../database/camionService';
import { viajeService } from '../database/viajeService';

const { width: screenWidth } = Dimensions.get('window');
const cardMargin = Math.max(16, screenWidth * 0.04);
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function CamionDetailScreen({ route, navigation }) {
  const { camionId } = route.params;
  const [camion, setCamion] = useState(null);
  const [viajes, setViajes] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [camionData, viajesData] = await Promise.all([
      camionService.getById(camionId),
      viajeService.getByCamion(camionId),
    ]);
    setCamion(camionData);
    setViajes(viajesData);
  };

  const toggleEstado = async (viajeId, estadoActual) => {
    const nuevoEstado = estadoActual === 'En proceso' ? 'Completado' : 'En proceso';
    await viajeService.updateEstado(viajeId, nuevoEstado);
    loadData();
  };

  const incrementarViaje = async (viajeId) => {
    try {
      await viajeService.incrementarViajeCompletado(viajeId);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'No se pudo incrementar el viaje');
    }
  };

  const decrementarViaje = async (viajeId) => {
    try {
      await viajeService.decrementarViajeCompletado(viajeId);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'No se pudo decrementar el viaje');
    }
  };

  const eliminarViaje = (viajeId, destinoNombre) => {
    Alert.alert(
      'Eliminar Viaje',
      `¿Estás seguro de eliminar el viaje a ${destinoNombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await viajeService.deleteViaje(viajeId);
              loadData();
              Alert.alert('Éxito', 'Viaje eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el viaje');
            }
          },
        },
      ]
    );
  };

  if (!camion) return <View style={styles.loading}><Text>Cargando...</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>🚛 {camion.nombre}</Text>
          <Text style={styles.stats}>{camion.viajes_realizados} viajes realizados</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddViaje', { preselectedCamionId: camionId })}
        >
          <Text style={styles.addButtonText}>➕ Agregar Viaje</Text>
        </TouchableOpacity>

        <View style={styles.viajes}>
          <Text style={styles.sectionTitle}>Viajes ({viajes.length})</Text>
          {viajes.map((viaje) => (
            <View key={viaje.id} style={styles.viajeCard}>
              <View style={styles.viajeHeader}>
                <Text style={styles.destino}>📍 {viaje.destino_nombre}</Text>
                <View style={styles.statusContainer}>
                  <Text style={[styles.estado, { color: viaje.estado === 'Completado' ? '#4CAF50' : '#FF9800' }]}>
                    {viaje.estado === 'Completado' ? '✅' : '🟡'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => eliminarViaje(viaje.id, viaje.destino_nombre)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Barra de progreso */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Progreso: {viaje.viajes_completados || 0}/{viaje.cantidad_viajes}
                </Text>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${((viaje.viajes_completados || 0) / viaje.cantidad_viajes) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              {/* Botones de control */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                  style={[styles.controlButton, styles.decrementButton]}
                  onPress={() => decrementarViaje(viaje.id)}
                  disabled={(viaje.viajes_completados || 0) === 0}
                >
                  <Text style={styles.buttonText}>− Restar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.controlButton, styles.incrementButton]}
                  onPress={() => incrementarViaje(viaje.id)}
                  disabled={(viaje.viajes_completados || 0) >= viaje.cantidad_viajes}
                >
                  <Text style={styles.buttonText}>+ Entregado</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.viajeInfo}>Fecha: {viaje.fecha_programada}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#2196F3', padding: cardPadding + 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  stats: { fontSize: 18, color: '#E3F2FD', fontWeight: '600' },
  addButton: { backgroundColor: '#4CAF50', margin: cardMargin, padding: 16, borderRadius: 8 },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  viajes: { margin: cardMargin },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  viajeCard: { backgroundColor: 'white', padding: cardPadding, borderRadius: 12, marginBottom: 12 },
  viajeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  destino: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  estado: { fontSize: 20 },
  deleteButton: { padding: 4 },
  deleteButtonText: { fontSize: 20 },
  viajeInfo: { fontSize: 14, color: '#666', marginTop: 4 },
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
