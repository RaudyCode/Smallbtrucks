import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';

const getStatusConfig = (status) => {
  const defaultConfig = {
    backgroundColor: colors.warning.light,
    textColor: colors.warning.primary,
    icon: 'alert-circle',
    text: status || 'Desconocido',
  };

  if (!status) return defaultConfig;

  switch (status.toLowerCase()) {
    case 'completado':
      return {
        backgroundColor: colors.success.light,
        textColor: colors.success.primary,
        icon: 'check-circle',
        text: status,
      };
    case 'en proceso':
      return {
        backgroundColor: colors.info.light,
        textColor: colors.info.primary,
        icon: 'clock-outline',
        text: status,
      };
    default:
      return defaultConfig;
  }
};

export const StatusBadge = ({ status }) => {
  const config = getStatusConfig(status);

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <MaterialCommunityIcons
        name={config.icon}
        size={16}
        color={config.textColor}
      />
      <Text style={[styles.text, { color: config.textColor }]}>
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
});