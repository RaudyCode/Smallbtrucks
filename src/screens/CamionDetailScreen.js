import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { camionService } from '../database/camionService';
import { viajeService } from '../database/viajeService';
import { colors } from '../theme/colors';
import { Card, ActionButton, StatusBadge } from '../components/common';

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

  if (!camion) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <MaterialCommunityIcons 
                name="truck" 
                size={32} 
                color={colors.text.primary} 
              />
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{camion.nombre}</Text>
                {camion.dueno && camion.dueno.trim() !== '' && (
                  <Text style={styles.ownerSubtitle}>Dueño: {camion.dueno}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons 
                  name="routes" 
                  size={20} 
                  color={colors.brand.secondary} 
                />
                <Text style={styles.stats}>{camion.viajes_realizados} viajes realizados</Text>
              </View>
              
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <ActionButton
            icon="plus"
            label="Programar Nuevo Pedido"
            onPress={() => navigation.navigate('AddViaje', { preselectedCamionId: camionId })}
            variant="primary"
            size="large"
          />

          <View style={styles.viajesSection}>
            <Text style={styles.sectionTitle}>Pedidos Programados ({viajes.length})</Text>
            {viajes.map((viaje) => (
              <Card key={viaje.id} style={styles.viajeCard}>
                <View style={styles.viajeHeader}>
                  <View style={styles.viajeTitle}>
                    <MaterialCommunityIcons 
                      name="map-marker" 
                      size={24} 
                      color={colors.brand.secondary} 
                    />
                    <View style={styles.destinoContainer}>
                      <Text style={styles.destino}>{viaje.destino_nombre}</Text>
                      {viaje.destino_ubicacion && (
                        <Text style={styles.destinoUbicacion}>{viaje.destino_ubicacion}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    <StatusBadge status={viaje.estado} />
                    <TouchableOpacity 
                      onPress={() => eliminarViaje(viaje.id, viaje.destino_nombre)}
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
                      Progreso: {viaje.viajes_completados || 0}/{viaje.cantidad_viajes}
                    </Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round(((viaje.viajes_completados || 0) / viaje.cantidad_viajes) * 100)}%
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${((viaje.viajes_completados || 0) / viaje.cantidad_viajes) * 100}%` }
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
                  <Text style={styles.viajeInfoText}>{viaje.fecha_programada}</Text>
                </View>

                {viaje.lugar_inicio && (
                  <View style={styles.viajeInfo}>
                    <MaterialCommunityIcons 
                      name="map-marker-radius" 
                      size={20} 
                      color={colors.text.secondary} 
                    />
                    <Text style={styles.viajeInfoText}>Inicio: {viaje.lugar_inicio}</Text>
                  </View>
                )}

                {/* Botones de control */}
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.controlButton, 
                      styles.decrementButton,
                      (viaje.viajes_completados || 0) === 0 && styles.disabledButton
                    ]}
                    onPress={() => decrementarViaje(viaje.id)}
                    disabled={(viaje.viajes_completados || 0) === 0}
                  >
                    <MaterialCommunityIcons name="minus" size={20} color={colors.text.primary} />
                    <Text style={styles.buttonText}>Restar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.controlButton, 
                      styles.incrementButton,
                      (viaje.viajes_completados || 0) >= viaje.cantidad_viajes && styles.disabledButton
                    ]}
                    onPress={() => incrementarViaje(viaje.id)}
                    disabled={(viaje.viajes_completados || 0) >= viaje.cantidad_viajes}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={colors.text.primary} />
                    <Text style={styles.buttonText}>Entregado</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
            
            {viajes.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons 
                  name="calendar-blank" 
                  size={48} 
                  color={colors.text.muted} 
                />
                <Text style={styles.emptyText}>No hay pedidos programados</Text>
                <ActionButton
                  icon="plus"
                  label="Programar Pedido"
                  onPress={() => navigation.navigate('AddViaje', { preselectedCamionId: camionId })}
                  variant="primary"
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loading: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  header: { 
    backgroundColor: colors.background.card,
    padding: cardPadding,
  },
  headerContent: {
    gap: 16,
  },
  headerTop: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  ownerSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 4,
  },
  infoSection: {
    gap: 8,
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: colors.text.secondary,
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: colors.text.primary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stats: { 
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: colors.text.secondary,
  },
  content: {
    padding: cardPadding,
    gap: cardPadding,
  },
  viajesSection: {
    gap: 12,
    marginTop: 8,
  },
  sectionTitle: { 
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  viajeCard: { 
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
    gap: 8,
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
    gap: 12,
  },
  deleteButton: {
    padding: 4,
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
  buttonsContainer: { 
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: { 
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
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
    color: colors.text.primary,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: cardPadding * 2,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
});
