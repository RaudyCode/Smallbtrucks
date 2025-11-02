import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { duenoService } from '../database/duenoService';
import { viajeService } from '../database/viajeService';
import { colors } from '../theme/colors';
import { Card, ActionButton } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function DuenoDetailScreen({ route, navigation }) {
  const { duenoId } = route.params;
  const [dueno, setDueno] = useState(null);
  const [stats, setStats] = useState(null);
  const [camiones, setCamiones] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [duenoId])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [duenoData, statsData, camionesData] = await Promise.all([
        duenoService.getById(duenoId),
        duenoService.getStats(duenoId),
        duenoService.getCamiones(duenoId),
      ]);

      setDueno(duenoData);
      setStats(statsData);
      setCamiones(camionesData);

      // Obtener viajes de todos los camiones del dueño
      if (camionesData.length > 0) {
        const allViajes = [];
        for (const camion of camionesData) {
          const viajesCamion = await viajeService.getByCamion(camion.id);
          allViajes.push(...viajesCamion);
        }
        // Ordenar por fecha
        allViajes.sort((a, b) => new Date(b.fecha_programada) - new Date(a.fecha_programada));
        setViajes(allViajes.slice(0, 5)); // Mostrar últimos 5 viajes
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dueno) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <MaterialCommunityIcons name="loading" size={48} color={colors.brand.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Info */}
        <Card style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="account"
              size={48}
              color={colors.brand.primary}
            />
          </View>
          <Text style={styles.duenoName}>{dueno.nombre}</Text>
          {dueno.telefono && (
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="phone" size={18} color={colors.text.secondary} />
              <Text style={styles.contactText}>{dueno.telefono}</Text>
            </View>
          )}
          {dueno.email && (
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="email" size={18} color={colors.text.secondary} />
              <Text style={styles.contactText}>{dueno.email}</Text>
            </View>
          )}
          {dueno.notas && (
            <View style={styles.notasContainer}>
              <Text style={styles.notasLabel}>Notas:</Text>
              <Text style={styles.notasText}>{dueno.notas}</Text>
            </View>
          )}
        </Card>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="truck" size={32} color={colors.brand.secondary} />
              <Text style={styles.statNumber}>{stats?.totalCamiones || 0}</Text>
              <Text style={styles.statLabel}>Camiones</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="truck-delivery" size={32} color={colors.warning.primary} />
              <Text style={styles.statNumber}>{stats?.totalViajes || 0}</Text>
              <Text style={styles.statLabel}>Viajes Totales</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="check-circle" size={32} color={colors.success.primary} />
              <Text style={styles.statNumber}>{stats?.viajesCompletados || 0}</Text>
              <Text style={styles.statLabel}>Completados</Text>
            </View>
          </View>
        </Card>

        {/* Camiones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Camiones</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddCamion', { duenoId })}
            >
              <MaterialCommunityIcons name="plus" size={20} color={colors.brand.primary} />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {camiones.length === 0 ? (
            <Card>
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="truck-off" size={40} color={colors.text.muted} />
                <Text style={styles.emptyText}>No hay camiones registrados</Text>
              </View>
            </Card>
          ) : (
            camiones.map((camion) => (
              <TouchableOpacity
                key={camion.id}
                onPress={() => navigation.navigate('CamionDetail', { camionId: camion.id })}
              >
                <Card style={styles.camionCard}>
                  <View style={styles.camionHeader}>
                    <MaterialCommunityIcons name="truck" size={24} color={colors.brand.primary} />
                    <View style={styles.camionInfo}>
                      <Text style={styles.camionName}>{camion.nombre}</Text>
                      {camion.placa && <Text style={styles.camionPlaca}>Placa: {camion.placa}</Text>}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text.muted} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Últimos Viajes */}
        {viajes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimos Viajes</Text>
            </View>

            {viajes.map((viaje) => (
              <Card key={viaje.id} style={styles.viajeCard}>
                <View style={styles.viajeRow}>
                  <MaterialCommunityIcons
                    name={viaje.estado === 'Completado' ? 'check-circle' : 'clock-outline'}
                    size={24}
                    color={viaje.estado === 'Completado' ? colors.success.primary : colors.warning.primary}
                  />
                  <View style={styles.viajeInfo}>
                    <Text style={styles.viajeDestino}>{viaje.destino_nombre}</Text>
                    <Text style={styles.viajeCamion}>{viaje.camion_nombre}</Text>
                    <Text style={styles.viajeFecha}>
                      {new Date(viaje.fecha_programada).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                  <View style={styles.viajeStatus}>
                    <Text style={styles.viajeProgreso}>
                      {viaje.viajes_completados}/{viaje.cantidad_viajes}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <ActionButton
            icon="pencil"
            title="Editar Información"
            onPress={() => navigation.navigate('AddDueno', { duenoId })}
            variant="secondary"
          />
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  headerCard: {
    margin: cardPadding,
    padding: cardPadding,
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duenoName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  notasContainer: {
    width: '100%',
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  notasLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  notasText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  statsCard: {
    marginHorizontal: cardPadding,
    marginBottom: cardPadding,
    padding: cardPadding,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.primary,
  },
  section: {
    marginHorizontal: cardPadding,
    marginBottom: cardPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.brand.primary,
  },
  camionCard: {
    padding: cardPadding,
    marginBottom: 8,
  },
  camionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  camionInfo: {
    flex: 1,
  },
  camionName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  camionPlaca: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  viajeCard: {
    padding: cardPadding,
    marginBottom: 8,
  },
  viajeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viajeInfo: {
    flex: 1,
  },
  viajeDestino: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  viajeCamion: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  viajeFecha: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.text.muted,
  },
  viajeStatus: {
    alignItems: 'flex-end',
  },
  viajeProgreso: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: colors.brand.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: cardPadding * 2,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.muted,
  },
  actionsContainer: {
    marginHorizontal: cardPadding,
    gap: 12,
  },
});
