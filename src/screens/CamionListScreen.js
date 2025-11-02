import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { camionService } from '../database/camionService';
import colors from '../theme/colors';
import { Card, ActionButton } from '../components/common';
import { TruckCard } from '../components/cards';

const { width: screenWidth } = Dimensions.get('window');
const cardMargin = Math.max(16, screenWidth * 0.04);
const cardPadding = Math.max(16, screenWidth * 0.04);
const REFRESH_INTERVAL = 5000; // 5 segundos

export default function CamionListScreen({ navigation }) {
  const [camiones, setCamiones] = useState([]);
  const [camionesFiltrados, setCamionesFiltrados] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCamiones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await camionService.getAll();
      setCamiones(data);
      // Aplicar filtro si hay búsqueda activa
      if (searchQuery.trim()) {
        filtrarCamiones(searchQuery, data);
      } else {
        setCamionesFiltrados(data);
      }
    } catch (error) {
      console.error('Error cargando camiones:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const filtrarCamiones = (query, data = camiones) => {
    if (!query.trim()) {
      setCamionesFiltrados(data);
      return;
    }
    
    const queryLower = query.toLowerCase().trim();
    const filtrados = data.filter(camion => 
      camion.nombre.toLowerCase().includes(queryLower) ||
      (camion.placa && camion.placa.toLowerCase().includes(queryLower)) ||
      (camion.dueno && camion.dueno.toLowerCase().includes(queryLower))
    );
    setCamionesFiltrados(filtrados);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filtrarCamiones(text);
  };

  const limpiarBusqueda = () => {
    setSearchQuery('');
    setCamionesFiltrados(camiones);
  };

  useFocusEffect(
    useCallback(() => {
      // Cargar datos inmediatamente
      loadCamiones();

      // Configurar actualización automática
      const intervalId = setInterval(() => {
        loadCamiones();
      }, REFRESH_INTERVAL);

      // Limpiar intervalo al perder el foco
      return () => clearInterval(intervalId);
    }, [loadCamiones])
  );

  const handleDelete = (camion) => {
    Alert.alert(
      'Eliminar Camión',
      `¿Estás seguro de eliminar el camión "${camion.nombre}"?\n\nNota: No se puede eliminar si tiene pedidos asociados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await camionService.delete(camion.id);
              loadCamiones();
              Alert.alert('Éxito', 'Camión eliminado correctamente');
            } catch (error) {
              console.error('Error eliminando camión:', error);
              if (error.message && error.message.includes('FOREIGN KEY')) {
                Alert.alert(
                  'No se puede eliminar',
                  `El camión "${camion.nombre}" tiene pedidos asociados. Primero debe eliminar todos los pedidos de este camión.`,
                  [{ text: 'Entendido' }]
                );
              } else {
                Alert.alert('Error', 'No se pudo eliminar el camión');
              }
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Camiones</Text>
          <Text style={styles.headerSubtitle}>
            {camionesFiltrados.length} de {camiones.length} camiones
          </Text>
        </View>
        <ActionButton
          icon="plus"
          variant="primary"
          onPress={() => navigation.navigate('AddCamion')}
        />
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialCommunityIcons 
            name="magnify" 
            size={20} 
            color={colors.text.secondary} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por placa o dueño..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={limpiarBusqueda} style={styles.clearButton}>
              <MaterialCommunityIcons 
                name="close-circle" 
                size={20} 
                color={colors.text.secondary} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={camionesFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TruckCard
            truck={item}
            onPress={() => navigation.navigate('CamionDetail', { camionId: item.id })}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name={searchQuery ? "magnify-close" : "truck-remove"}
                size={48} 
                color={colors.text.muted} 
              />
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? `No se encontraron camiones con "${searchQuery}"`
                  : "No hay camiones registrados"
                }
              </Text>
              {searchQuery ? (
                <TouchableOpacity 
                  style={styles.clearSearchButton}
                  onPress={limpiarBusqueda}
                >
                  <Text style={styles.clearSearchButtonText}>Limpiar búsqueda</Text>
                </TouchableOpacity>
              ) : (
                <ActionButton
                  icon="plus"
                  label="Agregar Camión"
                  onPress={() => navigation.navigate('AddCamion')}
                  variant="primary"
                />
              )}
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
  searchContainer: {
    paddingHorizontal: cardPadding,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.background.card,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.primary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  listContainer: {
    padding: cardPadding,
    gap: cardMargin,
    paddingBottom: 100,
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
  clearSearchButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  clearSearchButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.brand.primary,
  },
});