import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { camionService } from '../database/camionService';
import { destinoService } from '../database/destinoService';
import { viajeService } from '../database/viajeService';

const { width: screenWidth } = Dimensions.get('window');
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function AddViajeScreen({ route, navigation }) {
  const preselectedCamionId = route.params?.preselectedCamionId;
  
  const [camiones, setCamiones] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [selectedDestino, setSelectedDestino] = useState(null);
  const [cantidadViajes, setCantidadViajes] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [showCamionModal, setShowCamionModal] = useState(false);
  const [showDestinoModal, setShowDestinoModal] = useState(false);

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
      
      // Preseleccionar camión si viene de CamionDetail
      if (preselectedCamionId) {
        const camion = camionesData.find(c => c.id === preselectedCamionId);
        if (camion) setSelectedCamion(camion);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  const handleSubmit = async () => {
    if (!selectedCamion || !selectedDestino || !cantidadViajes) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    try {
      await viajeService.create(selectedCamion.id, selectedDestino.id, parseInt(cantidadViajes), fecha);
      Alert.alert('Éxito', 'Viaje registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error guardando viaje:', error);
      Alert.alert('Error', 'No se pudo guardar el viaje: ' + error.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll}>
        <View style={styles.form}>
          {/* Selector de Camión */}
          <Text style={styles.label}>Camión *</Text>
          <TouchableOpacity 
            style={styles.selector}
            onPress={() => setShowCamionModal(true)}
          >
            <Text style={selectedCamion ? styles.selectedText : styles.placeholderText}>
              {selectedCamion ? `🚛 ${selectedCamion.nombre}` : 'Seleccionar camión...'}
            </Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
          
          {/* Selector de Destino */}
          <Text style={styles.label}>Destino *</Text>
          <TouchableOpacity 
            style={styles.selector}
            onPress={() => setShowDestinoModal(true)}
          >
            <Text style={selectedDestino ? styles.selectedText : styles.placeholderText}>
              {selectedDestino ? `📍 ${selectedDestino.nombre}` : 'Seleccionar destino...'}
            </Text>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Cantidad de Viajes *</Text>
          <TextInput
            style={styles.input}
            value={cantidadViajes}
            onChangeText={setCantidadViajes}
            placeholder="Ej: 5"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Fecha Programada *</Text>
          <TextInput
            style={styles.input}
            value={fecha}
            onChangeText={setFecha}
            placeholder="YYYY-MM-DD"
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>💾 Registrar Viaje</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Camiones */}
      <Modal
        visible={showCamionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCamionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Camión</Text>
              <TouchableOpacity onPress={() => setShowCamionModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={camiones}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCamion(item);
                    setShowCamionModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>🚛 {item.nombre}</Text>
                  <Text style={styles.modalItemDetail}>
                    {item.viajes_realizados}/{item.total_viajes} viajes
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hay camiones disponibles</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Destinos */}
      <Modal
        visible={showDestinoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDestinoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Destino</Text>
              <TouchableOpacity onPress={() => setShowDestinoModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={destinos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDestino(item);
                    setShowDestinoModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>📍 {item.nombre}</Text>
                  <Text style={styles.modalItemDetail}>{item.ubicacion}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hay destinos disponibles</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { flex: 1 },
  form: { padding: cardPadding },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
  selector: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  input: { backgroundColor: 'white', padding: 16, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#2196F3', padding: 18, borderRadius: 8, marginTop: 24, marginBottom: 40 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalItemDetail: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
});
