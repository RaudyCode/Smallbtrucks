import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { camionService } from '../database/camionService';
import { viajeService } from '../database/viajeService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const cardMargin = Math.max(16, screenWidth * 0.04);
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function HomeScreen({ navigation }) {
  const [camiones, setCamiones] = useState([]);
  const [stats, setStats] = useState({ total: 0, enProceso: 0, completados: 0 });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Actualizar fecha
    updateCurrentDate();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
      updateCurrentDate();
    });
    return unsubscribe;
  }, [navigation]);

  const updateCurrentDate = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const formattedDate = now.toLocaleDateString('es-ES', options);
    setCurrentDate(formattedDate);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [camionesData, viajesData] = await Promise.all([
        camionService.getAll(),
        viajeService.getAll(),
      ]);
      
      setCamiones(camionesData);
      
      const enProceso = viajesData.filter(v => v.estado === 'En proceso').length;
      const completados = viajesData.filter(v => v.estado === 'Completado').length;
      
      setStats({
        total: viajesData.length,
        enProceso,
        completados,
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCamionItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.camionCard}
        onPress={() => navigation.navigate('CamionDetail', { camionId: item.id })}
      >
        <View style={styles.camionHeader}>
          <Text style={styles.camionNombre}>🚛 {item.nombre}</Text>
          <Text style={styles.camionViajes}>{item.viajes_realizados}</Text>
        </View>
        <Text style={styles.camionStats}>
          Viajes realizados
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Camiones</Text>
          <Text style={styles.subtitle}>Panel de Control</Text>
          <Text style={styles.dateText}>📅 {currentDate}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Viajes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.enProceso}</Text>
            <Text style={styles.statLabel}>En Proceso</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.completados}</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddViaje')}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Nuevo Viaje</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CamionList')}
          >
            <Text style={styles.actionIcon}>🚛</Text>
            <Text style={styles.actionText}>Camiones</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('DestinoList')}
          >
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>Destinos</Text>
          </TouchableOpacity>
        </View>

        {/* Camiones List */}
        <View style={styles.camionesSection}>
          <Text style={styles.sectionTitle}>Camiones ({camiones.length})</Text>
          <FlatList
            data={camiones}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCamionItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay camiones registrados</Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: cardPadding + 4,
    paddingBottom: cardPadding + 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  dateText: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 8,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: -20,
    marginHorizontal: cardMargin,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: cardMargin,
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  camionesSection: {
    margin: cardMargin,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  camionCard: {
    backgroundColor: 'white',
    padding: cardPadding,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  camionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  camionNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  camionNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  camionViajes: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  camionStats: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
});
