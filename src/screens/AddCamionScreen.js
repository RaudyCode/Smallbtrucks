import React, { useState, useEffect } from 'react';
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
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { camionService } from '../database/camionService';
import { duenoService } from '../database/duenoService';
import { colors } from '../theme/colors';
import { Card, ActionButton } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function AddCamionScreen({ route, navigation }) {
  const preselectedDuenoId = route.params?.duenoId;
  
  const [nombre, setNombre] = useState('');
  const [placa, setPlaca] = useState('');
  const [selectedDueno, setSelectedDueno] = useState(null);
  const [duenos, setDuenos] = useState([]);
  const [showDuenoModal, setShowDuenoModal] = useState(false);

  useEffect(() => {
    loadDuenos();
  }, []);

  useEffect(() => {
    if (preselectedDuenoId && duenos.length > 0) {
      const dueno = duenos.find(d => d.id === preselectedDuenoId);
      if (dueno) setSelectedDueno(dueno);
    }
  }, [preselectedDuenoId, duenos]);

  const loadDuenos = async () => {
    try {
      const data = await duenoService.getAll();
      setDuenos(data);
    } catch (error) {
      console.error('Error cargando dueños:', error);
    }
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Ingresa la placa del camión');
      return;
    }
    if (!selectedDueno) {
      Alert.alert('Error', 'Selecciona un dueño');
      return;
    }
    try {
      await camionService.create(nombre.trim(), placa.trim() || null, selectedDueno.nombre, selectedDueno.id);
      Alert.alert('Éxito', 'Camión registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error guardando camión:', error);
      Alert.alert('Error', 'No se pudo guardar el camión');
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
            <Text style={styles.title}>Agregar Camión</Text>
            <Text style={styles.subtitle}>Registra un nuevo camión</Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Placa del Camión *</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="card-text"
                  size={24}
                  color={nombre ? colors.brand.secondary : colors.text.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej: F1, ABC-1234"
                  placeholderTextColor={colors.text.muted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
            </View>


            <View style={styles.inputGroup}>
              <Text style={styles.label}>Seleccionar Dueño *</Text>
              <TouchableOpacity 
                style={styles.selector}
                onPress={() => setShowDuenoModal(true)}
              >
                <View style={styles.selectorContent}>
                  <MaterialCommunityIcons
                    name="account"
                    size={24}
                    color={selectedDueno ? colors.brand.secondary : colors.text.muted}
                  />
                  <Text style={selectedDueno ? styles.selectedText : styles.placeholderText}>
                    {selectedDueno ? selectedDueno.nombre : 'Seleccionar dueño...'}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={24}
                  color={colors.text.muted}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => navigation.navigate('AddDueno')}
              >
                <MaterialCommunityIcons name="plus" size={16} color={colors.brand.primary} />
                <Text style={styles.linkText}>Crear nuevo dueño</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <View style={styles.buttonContainer}>
            <ActionButton
              icon="plus"
              title="Registrar Camión"
              onPress={handleSubmit}
              variant="primary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Dueños */}
      {showDuenoModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDuenoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Dueño</Text>
                <TouchableOpacity 
                  style={styles.modalClose}
                  onPress={() => setShowDuenoModal(false)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              <FlatList
                data={duenos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedDueno(item);
                      setShowDuenoModal(false);
                    }}
                  >
                    <View style={styles.modalItemIcon}>
                      <MaterialCommunityIcons
                        name="account"
                        size={24}
                        color={colors.brand.primary}
                      />
                    </View>
                    <View style={styles.modalItemContent}>
                      <Text style={styles.modalItemText}>{item.nombre}</Text>
                      {item.telefono && (
                        <Text style={styles.modalItemDetail}>{item.telefono}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={[styles.modalItem, { borderBottomWidth: 0 }]}>
                    <MaterialCommunityIcons
                      name="account-off"
                      size={24}
                      color={colors.text.muted}
                    />
                    <Text style={[styles.modalItemDetail, { marginLeft: 12 }]}>
                      No hay dueños registrados
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>
      )}
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
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.primary,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.muted,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.brand.primary,
  },
  buttonContainer: {
    padding: cardPadding,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: cardPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  modalClose: {
    padding: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: cardPadding,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItemContent: {
    flex: 1,
    gap: 4,
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: colors.text.primary,
  },
  modalItemDetail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
});
