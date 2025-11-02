import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { destinoService } from '../database/destinoService';
import colors from '../theme/colors';
import { Card, ActionButton } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');
const cardMargin = Math.max(16, screenWidth * 0.04);
const cardPadding = Math.max(16, screenWidth * 0.04);
const REFRESH_INTERVAL = 5000; // 5 segundos

export default function DestinoListScreen({ navigation }) {
  const [destinos, setDestinos] = useState([]);
  const [destinosFiltrados, setDestinosFiltrados] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDestinos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await destinoService.getAll();
      setDestinos(data);
      // Aplicar filtro si hay búsqueda activa
      if (searchQuery.trim()) {
        filtrarDestinos(searchQuery, data);
      } else {
        setDestinosFiltrados(data);
      }
    } catch (error) {
      console.error('Error cargando destinos:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const filtrarDestinos = (query, data = destinos) => {
    if (!query.trim()) {
      setDestinosFiltrados(data);
      return;
    }
    
    const queryLower = query.toLowerCase().trim();
    const filtrados = data.filter(destino => 
      destino.nombre.toLowerCase().includes(queryLower) ||
      (destino.ubicacion && destino.ubicacion.toLowerCase().includes(queryLower))
    );
    setDestinosFiltrados(filtrados);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filtrarDestinos(text);
  };

  const limpiarBusqueda = () => {
    setSearchQuery('');
    setDestinosFiltrados(destinos);
  };

  useFocusEffect(
    useCallback(() => {
      // Cargar datos inmediatamente
      loadDestinos();

      // Configurar actualización automática
      const intervalId = setInterval(() => {
        loadDestinos();
      }, REFRESH_INTERVAL);

      // Limpiar intervalo al perder el foco
      return () => clearInterval(intervalId);
    }, [loadDestinos])
  );

  const handleDelete = (destino) => {
    Alert.alert(
      'Eliminar Destino',
      `¿Estás seguro de eliminar el destino "${destino.nombre}"?\n\nNota: No se puede eliminar si tiene pedidos asociados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await destinoService.delete(destino.id);
              loadDestinos();
              Alert.alert('Éxito', 'Destino eliminado correctamente');
            } catch (error) {
              console.error('Error eliminando destino:', error);
              if (error.message && error.message.includes('FOREIGN KEY')) {
                Alert.alert(
                  'No se puede eliminar',
                  `El destino "${destino.nombre}" tiene pedidos asociados. Primero debe eliminar todos los pedidos a este destino.`,
                  [{ text: 'Entendido' }]
                );
              } else {
                Alert.alert('Error', 'No se pudo eliminar el destino');
              }
            }
          },
        },
      ]
    );
  };

  const renderDestinoCard = ({ item }) => (
    <Card>
      <View style={styles.cardContent}>
        <View style={styles.destinoInfo}>
          <MaterialCommunityIcons 
            name="map-marker" 
            size={24} 
            color={colors.brand.primary} 
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.destinoNombre}>{item.nombre}</Text>
            {item.ubicacion && (
              <Text style={styles.ubicacion}>{item.ubicacion}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
            <MaterialCommunityIcons 
              name="delete-outline" 
              size={24} 
              color={colors.status.error} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Destinos</Text>
          <Text style={styles.headerSubtitle}>
            {destinosFiltrados.length} de {destinos.length} destinos
          </Text>
        </View>
        <ActionButton
          icon="plus"
          variant="primary"
          onPress={() => navigation.navigate('AddDestino')}
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
            placeholder="Buscar por nombre o ubicación..."
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
        data={destinosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDestinoCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name={searchQuery ? "magnify-close" : "map-marker-off"}
                size={48} 
                color={colors.text.muted} 
              />
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? `No se encontraron destinos con "${searchQuery}"`
                  : "No hay destinos registrados"
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
                  label="Agregar Destino"
                  onPress={() => navigation.navigate('AddDestino')}
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
  cardContent: {
    padding: cardPadding,
  },
  destinoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  destinoNombre: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  ubicacion: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  deleteButton: {
    padding: 4,
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