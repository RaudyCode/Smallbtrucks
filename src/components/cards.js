import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Card } from './common';

export const TruckCard = ({ truck, onPress, onDelete }) => (
  <TouchableOpacity onPress={onPress} onLongPress={onDelete}>
    <Card>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <MaterialCommunityIcons name="truck" size={24} color={colors.brand.secondary} />
          <View style={styles.truckInfo}>
            <Text style={styles.truckName}>{truck.nombre}</Text>
            {truck.dueno && truck.dueno.trim() !== '' && (
              <Text style={styles.ownerText}>Dueño: {truck.dueno}</Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.tripsContainer}>
            <MaterialCommunityIcons name="routes" size={20} color={colors.brand.primary} />
            <Text style={styles.tripsCount}>{truck.viajes_realizados || 0}</Text>
          </View>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteIconButton}>
              <MaterialCommunityIcons name="delete-outline" size={22} color={colors.status.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="calendar-check" size={16} color={colors.text.secondary} />
          <Text style={styles.statText}>Viajes completados</Text>
        </View>
      </View>
    </Card>
  </TouchableOpacity>
);

export const DestinationCard = ({ destination, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Card>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <MaterialCommunityIcons name="map-marker" size={24} color={colors.brand.secondary} />
          <Text style={styles.destinationName}>{destination.nombre}</Text>
        </View>
      </View>
      {destination.ubicacion && (
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map" size={16} color={colors.text.secondary} />
          <Text style={styles.locationText}>{destination.ubicacion}</Text>
        </View>
      )}
    </Card>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  truckInfo: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteIconButton: {
    padding: 4,
  },
  truckName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  ownerText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
  },
  tripsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tripsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brand.primary,
  },
  infoSection: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});