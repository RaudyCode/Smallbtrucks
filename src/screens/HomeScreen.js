import React, { useState, useCallback } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { camionService } from '../database/camionService';
import { viajeService } from '../database/viajeService';
import { colors } from '../theme/colors';
import { Card, ActionButton } from '../components/common';
import { TruckCard } from '../components/cards';
import { useAuth } from '../context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const cardPadding = Math.max(16, screenWidth * 0.04);
const REFRESH_INTERVAL = 5000; // 5 segundos

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [camiones, setCamiones] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    enProceso: 0,
    completados: 0,
    camionesActivos: 0,
    viajesSemana: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  const updateCurrentDate = useCallback(() => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const formattedDate = now.toLocaleDateString('es-ES', options);
    setCurrentDate(formattedDate);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [camionesData, statsData] = await Promise.all([
        camionService.getAll(),
        viajeService.getStats()
      ]);
      
      console.log('Estadísticas actualizadas:', statsData); // Debug
      
      setCamiones(camionesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Mantener los valores por defecto en caso de error
      setStats({
        total: 0,
        enProceso: 0,
        completados: 0,
        camionesActivos: 0,
        viajesSemana: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Cargar datos inmediatamente al enfocar la pantalla
      loadData();
      updateCurrentDate();

      // Configurar intervalo de actualización
      const intervalId = setInterval(() => {
        loadData();
      }, REFRESH_INTERVAL);

      // Limpiar el intervalo cuando la pantalla pierde el foco
      return () => {
        clearInterval(intervalId);
      };
    }, [loadData, updateCurrentDate])
  );

  const renderStatCard = useCallback((icon, number, label, color) => (
    <Card style={[styles.statCard, { borderLeftWidth: 4, borderLeftColor: color }]}>
      <MaterialCommunityIcons 
        name={icon} 
        size={32} 
        color={color} 
      />
      <View style={styles.statInfo}>
        <Text style={styles.statNumber}>{number || 0}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Card>
  ), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={camiones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TruckCard
            truck={item}
            onPress={() => navigation.navigate('CamionDetail', { camionId: item.id })}
          />
        )}
        ListHeaderComponent={
          <>
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.userGreeting}>
                  <MaterialCommunityIcons 
                    name="account-circle" 
                    size={40} 
                    color={colors.brand.primary} 
                  />
                  <View style={styles.greetingText}>
                    <Text style={styles.greetingHello}>Hola, 👋</Text>
                    <Text style={styles.greetingName}>
                      {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.dateSmall}>{currentDate}</Text>
                <Text style={styles.subtitle}>Gestiona tus viajes y camiones</Text>
              </View>
            </View>

            {/* Stats Cards */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.statsScroll}
              contentContainerStyle={styles.statsContainer}
            >
              {renderStatCard(
                "truck-check",
                stats.total,
                "Total Pedidos",
                colors.brand.primary
              )}
              
              {renderStatCard(
                "calendar-week",
                stats.viajesSemana,
                "Viajes Semana",
                colors.brand.accent
              )}
              
              {renderStatCard(
                "truck-delivery",
                stats.enProceso,
                "Pedidos En Proceso",
                colors.brand.secondary
              )}
              
              {renderStatCard(
                "check-circle",
                stats.completados,
                "Pedidos Completados",
                colors.status.success
              )}
            </ScrollView>

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
              <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
              <View style={styles.actionsGrid}>
            <ActionButton
              icon="truck-fast"
              label="Nuevo Pedido"
              onPress={() => navigation.navigate('AddViaje')}
              variant="primary"
              size="large"
            />                
                <ActionButton
                  icon="truck-plus"
                  label="Camiones"
                  onPress={() => navigation.navigate('CamionList')}
                  variant="secondary"
                  size="large"
                />

                <ActionButton
                  icon="account-group"
                  label="Dueños"
                  onPress={() => navigation.navigate('DuenoList')}
                  variant="secondary"
                  size="large"
                />

                <ActionButton
                  icon="map-marker-plus"
                  label="Destinos"
                  onPress={() => navigation.navigate('DestinoList')}
                  variant="secondary"
                  size="large"
                />

                <ActionButton
                  icon="history"
                  label="Historial"
                  onPress={() => navigation.navigate('Historial')}
                  variant="secondary"
                  size="large"
                />
              </View>
            </View>

            {/* Active Trucks Section Header */}
            <View style={styles.camionesHeader}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Camiones Activos</Text>
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('CamionList')}
                >
                  <MaterialCommunityIcons name="truck-delivery" size={24} color={colors.brand.primary} />
                  <Text style={styles.viewAllText}>Ver todos</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="truck-remove" 
                size={48} 
                color={colors.text.muted} 
              />
              <Text style={styles.emptyText}>No hay camiones registrados</Text>
              <ActionButton
                icon="plus"
                label="Agregar Camión"
                onPress={() => navigation.navigate('CamionList')}
                variant="primary"
              />
            </View>
          </Card>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.camionesListContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: cardPadding,
    paddingBottom: cardPadding * 1.5,
  },
  headerContent: {
    gap: 4,
  },
  userGreeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  greetingText: {
    flex: 1,
  },
  greetingHello: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  greetingName: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  dateSmall: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.brand.secondary,
    textTransform: 'capitalize',
  },
  welcome: {
    fontSize: 32,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  statsScroll: {
    marginBottom: cardPadding,
  },
  statsContainer: {
    paddingHorizontal: cardPadding,
    gap: cardPadding,
    paddingBottom: 100,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    width: screenWidth * 0.75,
    maxWidth: 300,
  },
  statInfo: {
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  actionsContainer: {
    padding: cardPadding,
    gap: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: isTablet ? 'flex-start' : 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  camionesHeader: {
    paddingHorizontal: cardPadding,
    paddingTop: cardPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.brand.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: cardPadding,
    gap: 16,
    marginHorizontal: cardPadding,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  camionesListContent: {
    paddingHorizontal: cardPadding,
    gap: 12,
    paddingBottom: 100,
  },
});