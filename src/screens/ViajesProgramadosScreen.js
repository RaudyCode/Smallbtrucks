import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { viajeService } from '../database/viajeService';
import colors from '../theme/colors';
import { Card, ActionButton, StatusBadge } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');
const cardMargin = Math.max(16, screenWidth * 0.04);
const cardPadding = Math.max(16, screenWidth * 0.04);
const REFRESH_INTERVAL = 5000; // 5 segundos

export default function ViajesProgramadosScreen({ navigation }) {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadViajes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await viajeService.getByEstado('En proceso');
      setViajes(data);
    } catch (error) {
      console.error('Error cargando viajes:', error);
      Alert.alert('Error', 'No se pudieron cargar los viajes programados');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadViajes();
      const intervalId = setInterval(loadViajes, REFRESH_INTERVAL);
      return () => clearInterval(intervalId);
    }, [loadViajes])
  );

  const handleComplete = async (viajeId) => {
    try {
      const viaje = viajes.find(v => v.id === viajeId);
      if (!viaje) return;

      // Actualizar estado a completado
      await viajeService.update(viajeId, {
        ...viaje,
        estado: 'Completado'
      });

      loadViajes();
      Alert.alert('Éxito', 'Viaje marcado como completado');
    } catch (error) {
      console.error('Error completando viaje:', error);
      Alert.alert('Error', 'No se pudo completar el viaje');
    }
  };

  const handleIncrement = async (viajeId) => {
    try {
      await viajeService.incrementarViajeCompletado(viajeId);
      loadViajes();
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo incrementar el viaje');
    }
  };

  const handleDecrement = async (viajeId) => {
    try {
      await viajeService.decrementarViajeCompletado(viajeId);
      loadViajes();
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo decrementar el viaje');
    }
  };

  const handleDelete = (viajeId, destinoNombre) => {
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
              loadViajes();
              Alert.alert('Éxito', 'Viaje eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el viaje');
            }
          },
        },
      ]
    );
  };

  const renderViajeCard = ({ item }) => (
    <Card key={item.id} style={styles.viajeCard}>
      <View style={styles.viajeHeader}>
        <View style={styles.viajeTitle}>
          <MaterialCommunityIcons 
            name="map-marker" 
            size={24} 
            color={colors.brand.secondary} 
          />
          <View style={styles.destinoContainer}>
            <Text style={styles.destino}>{item.destino_nombre}</Text>
            {item.destino_ubicacion && (
              <Text style={styles.destinoUbicacion}>{item.destino_ubicacion}</Text>
            )}
          </View>
        </View>
        <View style={styles.statusContainer}>
          <StatusBadge status={item.estado} />
          <TouchableOpacity 
            onPress={() => handleDelete(item.id, item.destino_nombre)}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons 
              name="delete-outline" 
              size={24} 
              color={colors.status.error} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Barra de progreso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Progreso: {item.viajes_completados || 0}/{item.cantidad_viajes}
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(((item.viajes_completados || 0) / item.cantidad_viajes) * 100)}%
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${((item.viajes_completados || 0) / item.cantidad_viajes) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <View style={styles.viajeInfo}>
        <MaterialCommunityIcons 
          name="calendar" 
          size={20} 
          color={colors.text.secondary} 
        />
        <Text style={styles.viajeInfoText}>{item.fecha_programada}</Text>
      </View>

      {item.lugar_inicio && (
        <View style={styles.viajeInfo}>
          <MaterialCommunityIcons 
            name="map-marker-radius" 
            size={20} 
            color={colors.text.secondary} 
          />
          <Text style={styles.viajeInfoText}>Inicio: {item.lugar_inicio}</Text>
        </View>
      )}

      {/* Botones de control */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[
            styles.controlButton, 
            styles.decrementButton,
            (item.viajes_completados || 0) === 0 && styles.disabledButton
          ]}
          onPress={() => handleDecrement(item.id)}
          disabled={(item.viajes_completados || 0) === 0}
        >
          <MaterialCommunityIcons name="minus" size={20} color={colors.text.primary} />
          <Text style={styles.buttonText}>Restar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.controlButton, 
            styles.incrementButton,
            (item.viajes_completados || 0) >= item.cantidad_viajes && styles.disabledButton
          ]}
          onPress={() => handleIncrement(item.id)}
          disabled={(item.viajes_completados || 0) >= item.cantidad_viajes}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.text.primary} />
          <Text style={styles.buttonText}>Entregado</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { fontSize: 24 }, { paddingRight: 10 }]}>Pedidos Programados</Text>
          <Text style={styles.headerSubtitle}>{viajes.length} pedidos en proceso</Text>
        </View>
        <ActionButton
          icon="plus"
          variant="primary"
          onPress={() => navigation.navigate('AddViaje')}
        />
      </View>

      <FlatList
        data={viajes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderViajeCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="truck-check" 
                size={48} 
                color={colors.text.muted} 
              />
              <Text style={styles.emptyText}>No hay pedidos en proceso</Text>
              <ActionButton
                icon="plus"
                label="Programar Pedido"
                onPress={() => navigation.navigate('AddViaje')}
                variant="primary"
              />
            </View>
          </Card>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  viajeCard: {
    marginHorizontal: cardMargin,
    marginBottom: cardMargin,
    padding: cardPadding,
    gap: 16,
  },
  viajeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viajeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  destinoContainer: {
    flex: 1,
  },
  destino: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  destinoUbicacion: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  destinoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  destinoNombre: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: colors.text.secondary,
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.text.primary,
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: colors.brand.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.background.primary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 4,
  },
  viajeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viajeInfoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  incrementButton: {
    backgroundColor: colors.brand.primary,
  },
  decrementButton: {
    backgroundColor: colors.brand.secondary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.text.primary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: cardPadding,
    backgroundColor: colors.background.card,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  listContainer: {
    padding: cardPadding,
    gap: cardMargin,
    paddingBottom: 100,
  },
  viajeCard: {
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  camionNombre: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  cardBody: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
    borderRadius: 8,
    backgroundColor: colors.status.successLight,
  },
  completeButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: colors.status.success,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
  },
  counterButton: {
    padding: 8,
  },
  counterInfo: {
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  counterLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: cardPadding,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    minWidth: 100,
  },
});