import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Dimensions, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { entregaService } from '../database/entregaService';
import { camionService } from '../database/camionService';
import { destinoService } from '../database/destinoService';
import colors from '../theme/colors';
import { Card } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');
const cardMargin = Math.max(16, screenWidth * 0.04);
const cardPadding = Math.max(16, screenWidth * 0.04);
const REFRESH_INTERVAL = 5000; // 5 segundos

export default function HistorialScreen({ navigation }) {
  const [entregas, setEntregas] = useState([]);
  const [entregasFiltradas, setEntregasFiltradas] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalFechaVisible, setModalFechaVisible] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [fechaEspecifica, setFechaEspecifica] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [data, camionesData, destinosData] = await Promise.all([
        entregaService.getHistorialPorFecha(),
        camionService.getAll(),
        destinoService.getAll()
      ]);
      
      setEntregas(data);
      
      // Re-aplicar el filtro activo si existe
      if (filtroActivo) {
        aplicarFiltroADatos(data, filtroActivo.tipo, filtroActivo.valor);
      } else {
        setEntregasFiltradas(data);
      }
      
      setCamiones(camionesData);
      setDestinos(destinosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, [filtroActivo]);

  useFocusEffect(
    useCallback(() => {
      // Cargar datos inmediatamente
      loadData();

      // Configurar actualización automática
      const intervalId = setInterval(() => {
        loadData();
      }, REFRESH_INTERVAL);

      // Limpiar intervalo al perder el foco
      return () => clearInterval(intervalId);
    }, [loadData])
  );

  const aplicarFiltroADatos = (data, tipo, valor) => {
    let resultado = data;
    
    if (tipo === 'camion') {
      resultado = data.filter(e => e.camion_nombre === valor);
    } else if (tipo === 'destino') {
      resultado = data.filter(e => e.destino_nombre === valor);
    } else if (tipo === 'hoy') {
      const hoy = new Date();
      const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
      resultado = data.filter(e => e.fecha_entrega === fechaHoy);
    } else if (tipo === 'semana') {
      const hoy = new Date();
      const hace7dias = new Date(hoy);
      hace7dias.setDate(hoy.getDate() - 7);
      resultado = data.filter(e => {
        const fechaEntrega = new Date(e.fecha_entrega + 'T00:00:00');
        return fechaEntrega >= hace7dias && fechaEntrega <= hoy;
      });
    } else if (tipo === 'mes') {
      const hoy = new Date();
      const hace30dias = new Date(hoy);
      hace30dias.setDate(hoy.getDate() - 30);
      resultado = data.filter(e => {
        const fechaEntrega = new Date(e.fecha_entrega + 'T00:00:00');
        return fechaEntrega >= hace30dias && fechaEntrega <= hoy;
      });
    } else if (tipo === 'fecha') {
      resultado = data.filter(e => e.fecha_entrega === valor);
    }
    
    setEntregasFiltradas(resultado);
  };

  const aplicarFiltro = (tipo, valor) => {
    if (tipo === 'camion') {
      setFiltroActivo({ tipo: 'camion', valor });
    } else if (tipo === 'destino') {
      setFiltroActivo({ tipo: 'destino', valor });
    } else if (tipo === 'hoy') {
      setFiltroActivo({ tipo: 'hoy', valor: 'Hoy' });
    } else if (tipo === 'semana') {
      setFiltroActivo({ tipo: 'semana', valor: 'Última semana' });
    } else if (tipo === 'mes') {
      setFiltroActivo({ tipo: 'mes', valor: 'Último mes' });
    } else if (tipo === 'fecha') {
      setFiltroActivo({ tipo: 'fecha', valor });
    }
    
    aplicarFiltroADatos(entregas, tipo, valor);
    setModalVisible(false);
  };

  const limpiarFiltro = () => {
    setEntregasFiltradas(entregas);
    setFiltroActivo(null);
  };

  const aplicarFiltroFechaEspecifica = () => {
    const fecha = `${fechaSeleccionada.getFullYear()}-${String(fechaSeleccionada.getMonth() + 1).padStart(2, '0')}-${String(fechaSeleccionada.getDate()).padStart(2, '0')}`;
    aplicarFiltro('fecha', fecha);
    setModalFechaVisible(false);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setFechaSeleccionada(selectedDate);
    }
  };

  const formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) return 'Hoy';
    if (dateOnly.getTime() === yesterdayOnly.getTime()) return 'Ayer';
    
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-ES', options);
  };

  const groupedEntregas = entregasFiltradas.reduce((groups, entrega) => {
    const fecha = entrega.fecha_entrega;
    if (!groups[fecha]) groups[fecha] = [];
    groups[fecha].push(entrega);
    return groups;
  }, {});

  // Ordenar las fechas de más reciente a más antigua
  const sortedFechas = Object.keys(groupedEntregas).sort((a, b) => {
    return new Date(b) - new Date(a); // Más reciente primero
  });

  // Calcular el total de viajes
  const totalViajes = entregasFiltradas.reduce((total, entrega) => {
    return total + (entrega.total_entregas || 0);
  }, 0);

  const FilterOption = ({ icon, label, onPress }) => (
    <TouchableOpacity 
      style={styles.filterOption}
      onPress={onPress}
    >
      <MaterialCommunityIcons name={icon} size={24} color={colors.text.primary} />
      <Text style={styles.filterOptionText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Historial de Viajes</Text>
          <View style={styles.statsRow}>
            <Text style={styles.headerSubtitle}>{entregasFiltradas.length || 0} registros</Text>
            <Text style={styles.headerDivider}>•</Text>
            <Text style={styles.headerSubtitleHighlight}>{totalViajes || 0} viajes</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {filtroActivo && (
        <View style={styles.filtroActivoContainer}>
          <View style={styles.filtroTag}>
            <MaterialCommunityIcons 
              name={
                filtroActivo.tipo === 'camion' ? 'truck' :
                filtroActivo.tipo === 'destino' ? 'map-marker' :
                'calendar'
              }
              size={20}
              color={colors.info.primary}
            />
            <Text style={styles.filtroActivoText}>
              {filtroActivo.valor || 'Sin filtro'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.limpiarFiltroButton}
            onPress={limpiarFiltro}
          >
            <MaterialCommunityIcons name="close" size={20} color={colors.error.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de filtros */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar historial</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Filtros rápidos */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Por fecha</Text>
                <FilterOption 
                  icon="calendar-today"
                  label="Hoy"
                  onPress={() => aplicarFiltro('hoy')}
                />
                <FilterOption 
                  icon="calendar-week"
                  label="Última semana"
                  onPress={() => aplicarFiltro('semana')}
                />
                <FilterOption 
                  icon="calendar-month"
                  label="Último mes"
                  onPress={() => aplicarFiltro('mes')}
                />
                <FilterOption 
                  icon="calendar-search"
                  label="Fecha específica"
                  onPress={() => {
                    setModalVisible(false);
                    setModalFechaVisible(true);
                  }}
                />
              </View>

              {/* Filtros por camión */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Por camión</Text>
                {camiones.map((camion) => (
                  <FilterOption 
                    key={camion.id}
                    icon="truck"
                    label={camion.nombre}
                    onPress={() => aplicarFiltro('camion', camion.nombre)}
                  />
                ))}
              </View>

              {/* Filtros por destino */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Por destino</Text>
                {destinos.map((destino) => (
                  <FilterOption 
                    key={destino.id}
                    icon="map-marker"
                    label={destino.nombre}
                    onPress={() => aplicarFiltro('destino', destino.nombre)}
                  />
                ))}
              </View>
            </ScrollView>
          </Card>
        </View>
      </Modal>

      {/* Modal de fecha específica */}
      <Modal
        visible={modalFechaVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalFechaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContentFecha}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buscar por fecha</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setModalFechaVisible(false);
                  setFechaEspecifica('');
                }}
              >
                <MaterialCommunityIcons name="close" size={24} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.fechaInputContainer}>
              <Text style={styles.fechaLabel}>Seleccione una fecha</Text>
              <Text style={styles.fechaEjemplo}>
                Fecha seleccionada: {formatearFecha(fechaSeleccionada)}
              </Text>
              
              {/* Botones rápidos */}
              <View style={styles.quickDateButtons}>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => {
                    setFechaSeleccionada(new Date());
                  }}
                >
                  <Text style={styles.quickDateButtonText}>Hoy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => {
                    const ayer = new Date();
                    ayer.setDate(ayer.getDate() - 1);
                    setFechaSeleccionada(ayer);
                  }}
                >
                  <Text style={styles.quickDateButtonText}>Ayer</Text>
                </TouchableOpacity>
              </View>
              
              {/* Botón para mostrar el picker */}
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={24} 
                  color={colors.brand.primary} 
                />
                <Text style={styles.datePickerButtonText}>
                  Seleccionar otra fecha
                </Text>
              </TouchableOpacity>

              {/* DateTimePicker */}
              {showDatePicker && (
                <DateTimePicker
                  value={fechaSeleccionada}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  locale="es-ES"
                />
              )}

              {/* Botón para iOS - mantener el picker visible */}
              {Platform.OS === 'ios' && showDatePicker && (
                <TouchableOpacity
                  style={styles.iosClosePicker}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.iosClosePickerText}>Cerrar selector</Text>
                </TouchableOpacity>
              )}

              <View style={styles.fechaButtonsContainer}>
                <TouchableOpacity
                  style={[styles.fechaButton, styles.fechaButtonCancel]}
                  onPress={() => {
                    setModalFechaVisible(false);
                    setShowDatePicker(false);
                    setFechaSeleccionada(new Date());
                  }}
                >
                  <Text style={styles.fechaButtonCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.fechaButton, styles.fechaButtonApply]}
                  onPress={aplicarFiltroFechaEspecifica}
                >
                  <Text style={styles.fechaButtonApplyText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>
      </Modal>
      
      <FlatList
        data={sortedFechas}
        keyExtractor={(fecha) => fecha}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item: fecha }) => (
          <View style={styles.group}>
            <Text style={styles.fechaTitle}>{formatDate(fecha)}</Text>
            {groupedEntregas[fecha].map((entrega, index) => (
              <Card key={`${entrega.viaje_id}-${index}`} style={styles.entregaCard}>
                <View style={styles.entregaHeader}>
                  <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="truck" size={24} color={colors.brand.secondary} />
                    <View style={styles.camionInfo}>
                      <Text style={styles.camion}>{entrega.camion_nombre || 'Sin nombre'}</Text>
                      {entrega.camion_dueno && String(entrega.camion_dueno).trim() !== '' && (
                        <Text style={styles.dueno}>Dueño: {entrega.camion_dueno}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.cantidad}>{entrega.total_entregas || 0}</Text>
                    <Text style={styles.cantidadLabel}>
                      {(entrega.total_entregas || 0) === 1 ? 'viaje' : 'viajes'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.destinoContainer}>
                  <MaterialCommunityIcons 
                    name="map-marker" 
                    size={20} 
                    color={colors.text.secondary}
                  />
                  <View style={styles.destinoInfo}>
                    <Text style={styles.destino}>{entrega.destino_nombre || 'Sin destino'}</Text>
                    {entrega.destino_ubicacion && (
                      <Text style={styles.destinoUbicacion}>{entrega.destino_ubicacion}</Text>
                    )}
                  </View>
                </View>

                {entrega.lugar_inicio && (
                  <View style={styles.lugarInicioContainer}>
                    <MaterialCommunityIcons 
                      name="map-marker-radius" 
                      size={20} 
                      color={colors.info.primary}
                    />
                    <Text style={styles.lugarInicio}>Inicio: {entrega.lugar_inicio}</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="calendar-blank" 
              size={48} 
              color={colors.text.muted}
            />
            <Text style={styles.emptyText}>No hay entregas registradas</Text>
            <Text style={styles.emptySubtext}>
              Los viajes completados aparecerán aquí
            </Text>
          </View>
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
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: cardPadding,
    backgroundColor: colors.background.card,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  headerDivider: {
    fontSize: 16,
    color: colors.text.muted,
  },
  headerSubtitleHighlight: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.brand.primary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: cardPadding,
    paddingBottom: 100,
  },
  filtroActivoContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginHorizontal: cardMargin,
    marginTop: 16,
  },
  filtroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  filtroActivoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.info.primary,
  },
  limpiarFiltroButton: {
    padding: 8,
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end',
  },
  modalContent: { 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalScrollView: {
    maxHeight: screenWidth * 1.2,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: cardPadding,
    paddingVertical: cardPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  filterSection: { 
    padding: cardPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  filterSectionTitle: { 
    fontSize: 14, 
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  filterOption: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    gap: 12,
  },
  filterOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.primary,
  },
  group: {
    marginBottom: 24,
  },
  fechaTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: colors.brand.primary,
    marginBottom: 12,
  },
  entregaCard: {
    gap: 12,
    marginBottom: 8,
  },
  entregaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  camionInfo: {
    flex: 1,
  },
  camion: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  dueno: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 2,
  },
  destinoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  destinoInfo: {
    flex: 1,
  },
  destino: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  destinoUbicacion: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 2,
  },
  lugarInicioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  lugarInicio: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.info.primary,
    fontStyle: 'italic',
  },
  badgeContainer: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cantidad: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  cantidadLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  modalContentFecha: {
    width: screenWidth - 48,
    maxWidth: 400,
    paddingBottom: 24,
  },
  fechaInputContainer: {
    gap: 16,
  },
  fechaLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  fechaEjemplo: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  quickDateButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickDateButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
  },
  quickDateButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.brand.primary,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    gap: 12,
  },
  datePickerButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: colors.brand.primary,
  },
  iosClosePicker: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
  },
  iosClosePickerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.brand.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 12,
    backgroundColor: colors.background.card,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  fechaInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.primary,
  },
  fechaButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  fechaButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fechaButtonCancel: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  fechaButtonCancelText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.secondary,
  },
  fechaButtonApply: {
    backgroundColor: colors.brand.primary,
  },
  fechaButtonApplyText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.inverse,
  },
});