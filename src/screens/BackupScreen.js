import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { backupService } from '../services/backupService';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import { Card } from '../components/common';

const { width: screenWidth } = Dimensions.get('window');
const cardMargin = Math.max(16, screenWidth * 0.04);
const cardPadding = Math.max(16, screenWidth * 0.04);

export default function BackupScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingBackups, setLoadingBackups] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoadingBackups(true);
      const [backupsList, dbStats] = await Promise.all([
        backupService.listBackups(user.uid),
        backupService.getDatabaseStats(),
      ]);
      setBackups(backupsList);
      setStats(dbStats);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los respaldos');
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const result = await backupService.testConnection();
      
      if (result.success) {
        Alert.alert('✅ Conexión Exitosa', 'Firebase Storage está habilitado y funcionando correctamente.');
      } else {
        Alert.alert(
          '⚠️ Problema Detectado', 
          result.message + '\n\nConsulta el archivo CONFIGURAR_STORAGE.md para más detalles.',
          [{ text: 'Entendido' }]
        );
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo verificar la conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    Alert.alert(
      'Crear Respaldo',
      '¿Deseas crear un respaldo de la base de datos en la nube?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear',
          onPress: async () => {
            try {
              setLoading(true);
              await backupService.createBackup(user.uid);
              Alert.alert('Éxito', 'Respaldo creado correctamente');
              loadData();
            } catch (error) {
              let errorMsg = error.message;
              
              // Mensajes de error más amigables
              if (error.code === 'storage/unauthorized') {
                errorMsg = '🔒 Acceso denegado. Las reglas de Storage están bloqueando el acceso.\n\nSolución: Ve a Firebase Console → Storage → Rules y actualiza las reglas.';
              } else if (error.code === 'storage/bucket-not-found') {
                errorMsg = '📦 Storage no habilitado.\n\nSolución: Ve a Firebase Console → Build → Storage → Get Started';
              } else if (error.code === 'storage/unknown') {
                errorMsg = '⚠️ Error desconocido.\n\nPosibles causas:\n• Storage no habilitado\n• Reglas mal configuradas\n• Problema de red\n\nConsulta CONFIGURAR_STORAGE.md';
              }
              
              Alert.alert('Error al crear respaldo', errorMsg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleExportLocal = async () => {
    Alert.alert(
      'Exportar Localmente',
      '¿Deseas exportar una copia de la base de datos a tu dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: async () => {
            try {
              setLoading(true);
              await backupService.exportBackupLocally();
              Alert.alert('Éxito', 'Base de datos exportada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo exportar: ' + error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRestoreBackup = (backup) => {
    Alert.alert(
      'Restaurar Respaldo',
      `¿Estás seguro de restaurar el respaldo del ${formatDate(backup.createdAt)}?\n\n⚠️ ADVERTENCIA: Esto reemplazará todos los datos actuales.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await backupService.restoreBackup(backup.downloadURL);
              Alert.alert(
                'Éxito',
                'Respaldo restaurado correctamente. La aplicación se reiniciará.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Reiniciar la app
                      // En producción podrías usar Updates.reloadAsync() de expo-updates
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'HomeTabs' }],
                      });
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo restaurar el respaldo: ' + error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteBackup = (backup) => {
    Alert.alert(
      'Eliminar Respaldo',
      `¿Estás seguro de eliminar el respaldo del ${formatDate(backup.createdAt)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await backupService.deleteBackup(backup.fullPath);
              Alert.alert('Éxito', 'Respaldo eliminado correctamente');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el respaldo: ' + error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loadingText}>Procesando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Respaldo de Datos</Text>
          <Text style={styles.headerSubtitle}>Gestiona tus respaldos en la nube</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Cerrar Sesión',
              '¿Estás seguro de que deseas cerrar sesión?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Cerrar Sesión',
                  style: 'destructive',
                  onPress: logout,
                },
              ]
            );
          }}
        >
          <MaterialCommunityIcons name="logout" size={24} color={colors.status.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Información del Usuario */}
        <Card style={styles.userCard}>
          <View style={styles.userHeader}>
            <MaterialCommunityIcons
              name="account-circle"
              size={48}
              color={colors.brand.primary}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.displayName || 'Usuario'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </Card>

        {/* Estadísticas de la base de datos */}
        {stats && (
          <Card style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <MaterialCommunityIcons
                name="database"
                size={24}
                color={colors.brand.primary}
              />
              <Text style={styles.statsTitle}>Base de Datos Actual</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="truck" size={20} color={colors.text.secondary} />
                <Text style={styles.statValue}>{stats.camiones}</Text>
                <Text style={styles.statLabel}>Camiones</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account" size={20} color={colors.text.secondary} />
                <Text style={styles.statValue}>{stats.duenos}</Text>
                <Text style={styles.statLabel}>Dueños</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="map-marker" size={20} color={colors.text.secondary} />
                <Text style={styles.statValue}>{stats.destinos}</Text>
                <Text style={styles.statLabel}>Destinos</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="calendar" size={20} color={colors.text.secondary} />
                <Text style={styles.statValue}>{stats.viajes}</Text>
                <Text style={styles.statLabel}>Viajes</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color={colors.text.secondary} />
                <Text style={styles.statValue}>{stats.entregas}</Text>
                <Text style={styles.statLabel}>Entregas</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="file-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.statValue}>{stats.sizeFormatted}</Text>
                <Text style={styles.statLabel}>Tamaño</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          {/* Botón de diagnóstico */}
          <TouchableOpacity style={styles.diagnosticButton} onPress={handleTestConnection}>
            <MaterialCommunityIcons name="stethoscope" size={24} color={colors.info.primary} />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.diagnosticButtonTitle}>Verificar Conexión</Text>
              <Text style={styles.diagnosticButtonSubtitle}>Prueba si Storage está habilitado</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateBackup}>
            <MaterialCommunityIcons name="cloud-upload" size={24} color={colors.text.primary} />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Crear Respaldo en la Nube</Text>
              <Text style={styles.buttonSubtitle}>Guarda tu base de datos en Firebase</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleExportLocal}>
            <MaterialCommunityIcons name="download" size={24} color={colors.brand.primary} />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.secondaryButtonTitle}>Exportar Localmente</Text>
              <Text style={styles.secondaryButtonSubtitle}>Guarda una copia en tu dispositivo</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Lista de respaldos */}
        <View style={styles.backupsSection}>
          <Text style={styles.sectionTitle}>
            Respaldos Disponibles ({backups.length})
          </Text>
          
          {loadingBackups ? (
            <View style={styles.loadingBackups}>
              <ActivityIndicator size="small" color={colors.brand.primary} />
              <Text style={styles.loadingText}>Cargando respaldos...</Text>
            </View>
          ) : backups.length === 0 ? (
            <Card>
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="cloud-off-outline"
                  size={48}
                  color={colors.text.muted}
                />
                <Text style={styles.emptyText}>No hay respaldos disponibles</Text>
                <Text style={styles.emptySubtext}>
                  Crea tu primer respaldo para tener tus datos seguros en la nube
                </Text>
              </View>
            </Card>
          ) : (
            backups.map((backup, index) => (
              <Card key={index} style={styles.backupCard}>
                <View style={styles.backupHeader}>
                  <MaterialCommunityIcons
                    name="cloud-check"
                    size={24}
                    color={colors.status.success}
                  />
                  <View style={styles.backupInfo}>
                    <Text style={styles.backupDate}>{formatDate(backup.createdAt)}</Text>
                    <Text style={styles.backupSize}>{backup.sizeFormatted}</Text>
                  </View>
                </View>
                
                <View style={styles.backupActions}>
                  <TouchableOpacity
                    style={styles.backupActionButton}
                    onPress={() => handleRestoreBackup(backup)}
                  >
                    <MaterialCommunityIcons
                      name="restore"
                      size={20}
                      color={colors.brand.primary}
                    />
                    <Text style={styles.backupActionText}>Restaurar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.backupActionButton}
                    onPress={() => handleDeleteBackup(backup)}
                  >
                    <MaterialCommunityIcons
                      name="delete-outline"
                      size={20}
                      color={colors.status.error}
                    />
                    <Text style={[styles.backupActionText, { color: colors.status.error }]}>
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
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
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  userCard: {
    gap: 0,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: cardPadding,
    gap: cardMargin,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
  },
  statsCard: {
    gap: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
  },
  diagnosticButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: cardPadding,
    borderRadius: 12,
    gap: 16,
    borderWidth: 2,
    borderColor: colors.info.primary,
  },
  diagnosticButtonTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.info.primary,
  },
  diagnosticButtonSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 2,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    padding: cardPadding,
    borderRadius: 12,
    gap: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: cardPadding,
    borderRadius: 12,
    gap: 16,
    borderWidth: 2,
    borderColor: colors.brand.primary,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  buttonSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 2,
  },
  secondaryButtonTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.brand.primary,
  },
  secondaryButtonSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 2,
  },
  backupsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  loadingBackups: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.muted,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  backupCard: {
    gap: 12,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupDate: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  backupSize: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 2,
  },
  backupActions: {
    flexDirection: 'row',
    gap: 12,
  },
  backupActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    gap: 8,
  },
  backupActionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.brand.primary,
  },
});
