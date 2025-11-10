import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Dimensions, KeyboardAvoidingView, Platform, Modal, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { camionService } from '../database/camionService';
import { destinoService } from '../database/destinoService';
import { viajeService } from '../database/viajeService';
import { colors } from '../theme/colors';
import { Card, ActionButton } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function AddViajeScreen({ route, navigation }) {
  const preselectedCamionId = route.params?.preselectedCamionId;
  
  const [camiones, setCamiones] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [selectedDestino, setSelectedDestino] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [showCamionModal, setShowCamionModal] = useState(false);
  const [showDestinoModal, setShowDestinoModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchCamion, setSearchCamion] = useState('');
  const [searchDestino, setSearchDestino] = useState('');
  const [startLocation, setStartLocation] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [camionesData, destinosData] = await Promise.all([
        camionService.getAll(),
        destinoService.getAll(),
      ]);
      setCamiones(camionesData);
      setDestinos(destinosData);
      
      if (preselectedCamionId) {
        const camion = camionesData.find(c => c.id === preselectedCamionId);
        if (camion) setSelectedCamion(camion);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  const filteredCamiones = camiones.filter(camion => {
    const searchLower = searchCamion.toLowerCase().trim();
    if (!searchLower) return true;
    return (
      camion.nombre.toLowerCase().includes(searchLower) ||
      (camion.dueno && camion.dueno.toLowerCase().includes(searchLower))
    );
  });

  const filteredDestinos = destinos.filter(destino => {
    const searchLower = searchDestino.toLowerCase().trim();
    if (!searchLower) return true;
    return (
      destino.nombre.toLowerCase().includes(searchLower) ||
      (destino.ubicacion && destino.ubicacion.toLowerCase().includes(searchLower))
    );
  });

  const handleSubmit = async () => {
    if (!selectedCamion || !selectedDestino) {
      Alert.alert('Error', 'Completa todos los campos obligatorios');
      return;
    }

    if (!startLocation || startLocation.trim() === '') {
      Alert.alert('Error', 'Por favor, ingresa el lugar de inicio del viaje');
      return;
    }

    try {
      await viajeService.create(
        selectedCamion.id, 
        selectedDestino.id, 
        0, // Siempre empezar con 0 viajes
        fecha,
        startLocation.trim()
      );
      
      Alert.alert('Éxito', 'Pedido creado correctamente. Puedes agregar entregas cuando se realicen los viajes.', [
        { 
          text: 'OK', 
          onPress: () => {
            // Navegar a la pantalla de Viajes en lugar de solo volver atrás
            navigation.navigate('HomeTabs', { 
              screen: 'Viajes',
              params: { refresh: Date.now() }
            });
          }
        }
      ]);
    } catch (error) {
      console.error('Error guardando pedido:', error);
      Alert.alert('Error', 'No se pudo guardar el pedido: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Content Container */}
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Programar Pedido</Text>
                <Text style={styles.subtitle}>Asigna un pedido con múltiples viajes</Text>
              </View>
            
            <Card style={styles.formCard}>
              {/* Selector de Camión */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Seleccionar Camión</Text>
                <TouchableOpacity 
                  style={styles.selector}
                  onPress={() => {
                    setSearchCamion('');
                    setShowCamionModal(true);
                  }}
                >
                  <View style={styles.selectorContent}>
                    <MaterialCommunityIcons
                      name="truck-delivery"
                      size={24}
                      color={selectedCamion ? colors.brand.secondary : colors.text.muted}
                    />
                    <Text style={selectedCamion ? styles.selectedText : styles.placeholderText}>
                      {selectedCamion ? selectedCamion.nombre : 'Seleccionar camión...'}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={24}
                    color={colors.text.muted}
                  />
                </TouchableOpacity>
              </View>
              {/* Lugar de Inicio */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Lugar de Inicio del Viaje</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="map-marker-radius"
                    size={24}
                    color={startLocation ? colors.brand.secondary : colors.text.muted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Oficina principal."
                    placeholderTextColor={colors.text.muted}
                    value={startLocation}
                    onChangeText={setStartLocation}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Selector de Destino */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Seleccionar Destino</Text>
                <TouchableOpacity 
                  style={styles.selector}
                  onPress={() => {
                    setSearchDestino('');
                    setShowDestinoModal(true);
                  }}
                >
                  <View style={styles.selectorContent}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={24}
                      color={selectedDestino ? colors.brand.secondary : colors.text.muted}
                    />
                    <Text style={selectedDestino ? styles.selectedText : styles.placeholderText}>
                      {selectedDestino ? selectedDestino.nombre : 'Seleccionar destino...'}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={24}
                    color={colors.text.muted}
                  />
                </TouchableOpacity>
              </View>

              {/* Fecha */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha Programada</Text>
                <TouchableOpacity 
                  style={styles.selector}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.selectorContent}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={24}
                      color={colors.brand.secondary}
                    />
                    <Text style={styles.selectedText}>
                      {selectedDate.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="calendar-edit"
                    size={24}
                    color={colors.text.muted}
                  />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (event.type !== 'dismissed' && date) {
                      setSelectedDate(date);
                      setFecha(date.toISOString().split('T')[0]);
                    }
                  }}
                  minimumDate={new Date()}
                  textColor={colors.text.primary}
                />
              )}
            </Card>
          </View>

          {/* Button Container */}
          <View style={styles.buttonContainer}>
            <ActionButton
              icon="calendar-check"
              title="Programar Viaje"
              onPress={handleSubmit}
              variant="primary"
            />
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Modales */}
      {showCamionModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCamionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Camión</Text>
                <TouchableOpacity 
                  style={styles.modalClose}
                  onPress={() => {
                    setSearchCamion('');
                    setShowCamionModal(false);
                  }}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={24}
                  color={colors.text.secondary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por placa o dueño..."
                  placeholderTextColor={colors.text.secondary}
                  value={searchCamion}
                  onChangeText={setSearchCamion}
                  autoCapitalize="none"
                />
                {searchCamion.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchCamion('')}>
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <FlatList
                data={filteredCamiones}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedCamion(item);
                      setShowCamionModal(false);
                    }}
                  >
                    <View style={styles.modalItemIcon}>
                      <MaterialCommunityIcons
                        name="truck-delivery"
                        size={24}
                        color={colors.brand.primary}
                      />
                    </View>
                    <View style={styles.modalItemContent}>
                      <Text style={styles.modalItemText}>{item.nombre}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={[styles.modalItem, { borderBottomWidth: 0 }]}>
                    <MaterialCommunityIcons
                      name="truck-remove"
                      size={24}
                      color={colors.text.muted}
                    />
                    <Text style={[styles.modalItemDetail, { marginLeft: 12 }]}>
                      No hay camiones disponibles
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>
      )}

      {showDestinoModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDestinoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Destino</Text>
                <TouchableOpacity 
                  style={styles.modalClose}
                  onPress={() => {
                    setSearchDestino('');
                    setShowDestinoModal(false);
                  }}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={24}
                  color={colors.text.secondary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por nombre o ubicación..."
                  placeholderTextColor={colors.text.secondary}
                  value={searchDestino}
                  onChangeText={setSearchDestino}
                  autoCapitalize="none"
                />
                {searchDestino.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchDestino('')}>
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <FlatList
                data={filteredDestinos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedDestino(item);
                      setShowDestinoModal(false);
                    }}
                  >
                    <View style={styles.modalItemIcon}>
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={24}
                        color={colors.brand.primary}
                      />
                    </View>
                    <View style={styles.modalItemContent}>
                      <Text style={styles.modalItemText}>{item.nombre}</Text>
                      {item.ubicacion && (
                        <Text style={styles.modalItemDetail}>{item.ubicacion}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={[styles.modalItem, { borderBottomWidth: 0 }]}>
                    <MaterialCommunityIcons
                      name="map-marker-off"
                      size={24}
                      color={colors.text.muted}
                    />
                    <Text style={[styles.modalItemDetail, { marginLeft: 12 }]}>
                      No hay destinos disponibles
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: cardPadding,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 4,
  },
  formCard: {
    margin: cardPadding,
    padding: cardPadding,
    gap: 24,
    
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: colors.text.primary,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.primary,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.muted,
  },
  buttonContainer: {
    padding: cardPadding,
   
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: cardPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  modalClose: {
    padding: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: cardPadding,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItemContent: {
    flex: 1,
    gap: 4,
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: colors.text.primary,
  },
  modalItemDetail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.primary,
    padding: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.primary,
    padding: 0,
  },
});
