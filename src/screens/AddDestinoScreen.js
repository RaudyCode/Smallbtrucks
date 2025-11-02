import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { destinoService } from '../database/destinoService';
import { colors } from '../theme/colors';
import { Card, ActionButton } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function AddDestinoScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  const handleSubmit = async () => {
    if (!nombre) {
      Alert.alert('Error', 'Ingresa el nombre del destino');
      return;
    }
    try {
      await destinoService.create(nombre, ubicacion);
      Alert.alert('Éxito', 'Destino registrado', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el destino');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Nuevo Destino</Text>
            <Text style={styles.subtitle}>Registre una nueva ubicación de entrega</Text>
          </View>

          <Card style={styles.formCard}>
            {/* Campo Nombre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Destino</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="office-building"
                  size={24}
                  color={nombre ? colors.brand.secondary : colors.text.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej: CEMEX"
                  placeholderTextColor={colors.text.muted}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              <Text style={styles.helperText}>
                Nombre de la empresa o punto de entrega
              </Text>
            </View>

            {/* Campo Ubicación */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ubicación</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color={ubicacion ? colors.brand.secondary : colors.text.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={ubicacion}
                  onChangeText={setUbicacion}
                  placeholder="Ej: Santo Domingo"
                  placeholderTextColor={colors.text.muted}
                  autoCapitalize="words"
                />
              </View>
              <Text style={styles.helperText}>
                Ciudad o referencia de ubicación
              </Text>
            </View>

            {/* Recomendaciones */}
            <View style={styles.tipsContainer}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={24}
                color={colors.brand.secondary}
              />
              <View style={styles.tipsContent}>
                <Text style={styles.tipsTitle}>Recomendaciones</Text>
                <Text style={styles.tipsText}>
                  • Use nombres cortos y fáciles de identificar{'\n'}
                  • Incluya una ubicación específica{'\n'}
                  • Evite caracteres especiales
                </Text>
              </View>
            </View>
          </Card>

          <View style={styles.buttonContainer}>
            <ActionButton
              icon="check"
              label="Guardar Destino"
              onPress={handleSubmit}
              variant="primary"
              size="large"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: cardPadding,
    gap: 4,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.primary,
  },
  helperText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.muted,
  },
  tipsContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    backgroundColor: colors.brand.secondary + '10',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.brand.secondary,
  },
  tipsContent: {
    flex: 1,
    gap: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: colors.text.primary,
  },
  tipsText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: cardPadding,
    paddingTop: 0,
  },
});
