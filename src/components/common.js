import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'En proceso':
        return colors.status.warning;
      case 'Completado':
        return colors.status.success;
      default:
        return colors.status.info;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'En proceso':
        return 'clock-outline';
      case 'Completado':
        return 'check-circle';
      default:
        return 'information';
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
      <MaterialCommunityIcons name={getStatusIcon()} size={16} color="white" />
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};

export const ActionButton = ({ icon, label, onPress, variant = 'primary' }) => {
  const buttonStyles = {
    primary: {
      backgroundColor: colors.brand.primary,
    },
    secondary: {
      backgroundColor: colors.brand.secondary,
    },
  };

  return (
    <TouchableOpacity
      style={[styles.actionButton, buttonStyles[variant]]}
      onPress={onPress}
    >
      <MaterialCommunityIcons name={icon} size={24} color="white" />
      <Text style={styles.actionButtonText}>{label}</Text>
    </TouchableOpacity>
  );
};

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});