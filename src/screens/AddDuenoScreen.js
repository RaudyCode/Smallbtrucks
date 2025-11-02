import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { duenoService } from '../database/duenoService';
import { colors } from '../theme/colors';
import { Card, ActionButton } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function AddDuenoScreen({ route, navigation }) {
  const duenoId = route.params?.duenoId;
  const isEditing = !!duenoId;

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadDueno();
    }
  }, [duenoId]);

  const loadDueno = async () => {
    try {
      const dueno = await duenoService.getById(duenoId);
      if (dueno) {
        setNombre(dueno.nombre || '');
        setTelefono(dueno.telefono || '');
        setEmail(dueno.email || '');
        setNotas(dueno.notas || '');
      }
    } catch (error) {
      console.error('Error cargando dueño:', error);
      Alert.alert('Error', 'No se pudo cargar el dueño');
    }
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    try {
      if (isEditing) {
        await duenoService.update(duenoId, nombre.trim(), telefono.trim(), email.trim(), notas.trim());
        Alert.alert('Éxito', 'Dueño actualizado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await duenoService.create(nombre.trim(), telefono.trim(), email.trim(), notas.trim());
        Alert.alert('Éxito', 'Dueño registrado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error guardando dueño:', error);
      Alert.alert('Error', 'No se pudo guardar el dueño: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
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
              <Text style={styles.title}>{isEditing ? 'Editar Dueño' : 'Nuevo Dueño'}</Text>
              <Text style={styles.subtitle}>
                {isEditing ? 'Actualiza la información del dueño' : 'Registra un nuevo dueño de camiones'}
              </Text>
            </View>

            <Card style={styles.formCard}>
              {/* Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre Completo *</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="account"
                    size={24}
                    color={nombre ? colors.brand.secondary : colors.text.muted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Juan Pérez"
                    placeholderTextColor={colors.text.muted}
                    value={nombre}
                    onChangeText={setNombre}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Teléfono */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="phone"
                    size={24}
                    color={telefono ? colors.brand.secondary : colors.text.muted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="809-555-1234"
                    placeholderTextColor={colors.text.muted}
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="email"
                    size={24}
                    color={email ? colors.brand.secondary : colors.text.muted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor={colors.text.muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Notas */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notas</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <MaterialCommunityIcons
                    name="note-text"
                    size={24}
                    color={notas ? colors.brand.secondary : colors.text.muted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Información adicional..."
                    placeholderTextColor={colors.text.muted}
                    value={notas}
                    onChangeText={setNotas}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </Card>

            <View style={styles.buttonContainer}>
              <ActionButton
                icon={isEditing ? 'check' : 'plus'}
                title={isEditing ? 'Actualizar Dueño' : 'Registrar Dueño'}
                onPress={handleSubmit}
                variant="primary"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    gap: 20,
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
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
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
  textArea: {
    minHeight: 100,
    paddingTop: 4,
  },
  buttonContainer: {
    padding: cardPadding,
  },
});
