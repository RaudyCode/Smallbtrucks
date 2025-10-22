import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { entregaService } from '../database/entregaService';
import { camionService } from '../database/camionService';
import { destinoService } from '../database/destinoService';

const { width: screenWidth } = Dimensions.get('window');
const cardMargin = Math.max(16, screenWidth * 0.04);
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function HistorialScreen({ navigation }) {
  const [entregas, setEntregas] = useState([]);
  const [entregasFiltradas, setEntregasFiltradas] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    await Promise.all([loadEntregas(), loadCamiones(), loadDestinos()]);
  };

  const loadEntregas = async () => {
    try {
      const data = await entregaService.getHistorialPorFecha();
      console.log('Entregas cargadas:', data.length);
      setEntregas(data);
      setEntregasFiltradas(data);
    } catch (error) {
      console.error('Error cargando historial:', error);
      setEntregas([]);
      setEntregasFiltradas([]);
    }
  };

  const loadCamiones = async () => {
    try {
      const data = await camionService.getAll();
      setCamiones(data);
    } catch (error) {
      console.error('Error cargando camiones:', error);
    }
  };

  const loadDestinos = async () => {
    try {
      const data = await destinoService.getAll();
      setDestinos(data);
    } catch (error) {
      console.error('Error cargando destinos:', error);
    }
  };

  const aplicarFiltro = (tipo, valor) => {
    let resultado = entregas;
    
    if (tipo === 'camion') {
      resultado = entregas.filter(e => e.camion_nombre === valor);
      setFiltroActivo({ tipo: 'camion', valor });
    } else if (tipo === 'destino') {
      resultado = entregas.filter(e => e.destino_nombre === valor);
      setFiltroActivo({ tipo: 'destino', valor });
    } else if (tipo === 'hoy') {
      const hoy = new Date();
      const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
      resultado = entregas.filter(e => e.fecha_entrega === fechaHoy);
      setFiltroActivo({ tipo: 'hoy', valor: 'Hoy' });
    } else if (tipo === 'semana') {
      const hoy = new Date();
      const hace7dias = new Date(hoy);
      hace7dias.setDate(hoy.getDate() - 7);
      resultado = entregas.filter(e => {
        const fechaEntrega = new Date(e.fecha_entrega + 'T00:00:00');
        return fechaEntrega >= hace7dias && fechaEntrega <= hoy;
      });
      setFiltroActivo({ tipo: 'semana', valor: 'Última semana' });
    }
    
    setEntregasFiltradas(resultado);
    setModalVisible(false);
  };

  const limpiarFiltro = () => {
    setEntregasFiltradas(entregas);
    setFiltroActivo(null);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 Historial de Viajes</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>🔍 Filtrar</Text>
        </TouchableOpacity>
      </View>

      {filtroActivo && (
        <View style={styles.filtroActivoContainer}>
          <Text style={styles.filtroActivoText}>
            Filtro: {filtroActivo.valor}
          </Text>
          <TouchableOpacity onPress={limpiarFiltro}>
            <Text style={styles.limpiarFiltroText}>✕ Limpiar</Text>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar historial</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Filtros rápidos */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Por fecha</Text>
              <TouchableOpacity 
                style={styles.filterOption}
                onPress={() => aplicarFiltro('hoy')}
              >
                <Text style={styles.filterOptionText}>📅 Hoy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.filterOption}
                onPress={() => aplicarFiltro('semana')}
              >
                <Text style={styles.filterOptionText}>📆 Última semana</Text>
              </TouchableOpacity>
            </View>

            {/* Filtros por camión */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Por camión</Text>
              {camiones.map((camion) => (
                <TouchableOpacity 
                  key={camion.id}
                  style={styles.filterOption}
                  onPress={() => aplicarFiltro('camion', camion.nombre)}
                >
                  <Text style={styles.filterOptionText}>🚛 {camion.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filtros por destino */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Por destino</Text>
              {destinos.map((destino) => (
                <TouchableOpacity 
                  key={destino.id}
                  style={styles.filterOption}
                  onPress={() => aplicarFiltro('destino', destino.nombre)}
                >
                  <Text style={styles.filterOptionText}>📍 {destino.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
      
      <FlatList
        data={Object.keys(groupedEntregas).sort().reverse()}
        keyExtractor={(fecha) => fecha}
        renderItem={({ item: fecha }) => (
          <View style={styles.group}>
            <Text style={styles.fechaTitle}>{formatDate(fecha)}</Text>
            {groupedEntregas[fecha].map((entrega, index) => (
              <View key={`${entrega.viaje_id}-${index}`} style={styles.entregaCard}>
                <View style={styles.entregaHeader}>
                  <Text style={styles.camion}>🚛 {entrega.camion_nombre}</Text>
                  <Text style={styles.cantidad}>{entrega.total_entregas} {entrega.total_entregas === 1 ? 'viaje' : 'viajes'}</Text>
                </View>
                <Text style={styles.destino}>→ {entrega.destino_nombre}</Text>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>📋</Text>
            <Text style={styles.emptySubtext}>No hay entregas registradas</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: cardPadding, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e0e0e0' 
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  filterButton: { 
    backgroundColor: '#2196F3', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 6 
  },
  filterButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  filtroActivoContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#E3F2FD', 
    padding: 12, 
    marginHorizontal: cardMargin,
    marginTop: 12,
    borderRadius: 8 
  },
  filtroActivoText: { fontSize: 14, color: '#1976D2', fontWeight: '600' },
  limpiarFiltroText: { fontSize: 14, color: '#F44336', fontWeight: '600' },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  closeButton: { fontSize: 24, color: '#999' },
  filterSection: { 
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  filterSectionTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#666', 
    marginBottom: 12,
    textTransform: 'uppercase'
  },
  filterOption: { 
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4
  },
  filterOptionText: { fontSize: 16, color: '#333' },
  group: { margin: cardMargin, marginBottom: 24 },
  fechaTitle: { fontSize: 18, fontWeight: 'bold', color: '#2196F3', marginBottom: 12 },
  entregaCard: { backgroundColor: 'white', padding: cardPadding, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  entregaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' },
  camion: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  destino: { fontSize: 14, color: '#666', marginTop: 4 },
  cantidad: { fontSize: 14, color: '#4CAF50', fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 64, marginBottom: 16 },
  emptySubtext: { fontSize: 16, color: '#666' },
});
