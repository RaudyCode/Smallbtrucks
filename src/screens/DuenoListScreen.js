import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { duenoService } from '../database/duenoService';
import { colors } from '../theme/colors';
import { Card, ActionButton } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');
const cardPadding = Math.max(16, screenWidth * 0.04);
const cardMargin = Math.max(12, screenWidth * 0.03);

export default function DuenoListScreen({ navigation }) {
  const [duenos, setDuenos] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadDuenos();
    }, [])
  );

  const loadDuenos = async () => {
    try {
      setLoading(true);
      const data = await duenoService.getAll();
      
      // Obtener estadísticas para cada dueño
      const duenosConStats = await Promise.all(
        data.map(async (dueno) => {
          const stats = await duenoService.getStats(dueno.id);
          return { ...dueno, ...stats };
        })
      );
      
      setDuenos(duenosConStats);
    } catch (error) {
      console.error('Error cargando dueños:', error);
      Alert.alert('Error', 'No se pudieron cargar los dueños');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (dueno) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar a ${dueno.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await duenoService.delete(dueno.id);
              loadDuenos();
              Alert.alert('Éxito', 'Dueño eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderDuenoCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('DuenoDetail', { duenoId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.duenoCard}>
        <View style={styles.duenoHeader}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="account"
              size={32}
              color={colors.brand.primary}
            />
          </View>
          <View style={styles.duenoInfo}>
            <Text style={styles.duenoName}>{item.nombre}</Text>
            {item.telefono && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="phone"
                  size={16}
                  color={colors.text.secondary}
                />
                <Text style={styles.duenoDetail}>{item.telefono}</Text>
              </View>
            )}
            {item.email && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="email"
                  size={16}
                  color={colors.text.secondary}
                />
                <Text style={styles.duenoDetail}>{item.email}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="truck"
              size={20}
              color={colors.brand.secondary}
            />
            <Text style={styles.statNumber}>{item.totalCamiones}</Text>
            <Text style={styles.statLabel}>Camiones</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="truck-delivery"
              size={20}
              color={colors.success.primary}
            />
            <Text style={styles.statNumber}>{item.totalViajes}</Text>
            <Text style={styles.statLabel}>Viajes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={colors.success.primary}
            />
            <Text style={styles.statNumber}>{item.viajesCompletados}</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddCamion', { duenoId: item.id })}
          >
            <MaterialCommunityIcons name="plus" size={20} color={colors.brand.primary} />
            <Text style={styles.actionText}>Agregar Camión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <MaterialCommunityIcons name="delete" size={20} color={colors.error.primary} />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dueños</Text>
          <Text style={styles.headerSubtitle}>{duenos.length} registrados</Text>
        </View>
        <ActionButton
          icon="plus"
          variant="primary"
          onPress={() => navigation.navigate('AddDueno')}
        />
      </View>

      <FlatList
        data={duenos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDuenoCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="account-off"
                size={48}
                color={colors.text.muted}
              />
              <Text style={styles.emptyText}>No hay dueños registrados</Text>
              <ActionButton
                icon="plus"
                label="Agregar Dueño"
                onPress={() => navigation.navigate('AddDueno')}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: cardPadding,
    backgroundColor: colors.background.card,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 4,
  },
  listContainer: {
    padding: cardPadding,
    gap: cardMargin,
    paddingBottom: 100,
  },
  duenoCard: {
    padding: cardPadding,
    gap: 16,
  },
  duenoHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duenoInfo: {
    flex: 1,
    gap: 4,
  },
  duenoName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duenoDetail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  deleteButton: {
    flex: 0,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.brand.primary,
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
  },
});
