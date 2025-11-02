import { storage } from '../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, listAll, getMetadata, deleteObject } from 'firebase/storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { db } from '../database/database';

const BACKUP_FOLDER = 'backups';

export const backupService = {
  // Verificar conectividad con Firebase Storage
  testConnection: async () => {
    try {
      console.log('🔍 Verificando conexión con Firebase Storage...');
      
      // Intentar listar archivos en la raíz
      const testRef = ref(storage, '/');
      console.log('📍 Bucket:', storage.app.options.storageBucket);
      
      try {
        const result = await listAll(testRef);
        console.log('✅ Storage está habilitado y accesible');
        console.log('📂 Carpetas encontradas:', result.prefixes.length);
        console.log('📄 Archivos en raíz:', result.items.length);
        return { success: true, message: 'Storage habilitado' };
      } catch (error) {
        if (error.code === 'storage/unauthorized') {
          console.error('❌ Error de permisos: Las reglas de Storage están bloqueando el acceso');
          return { 
            success: false, 
            message: 'Reglas de Storage bloqueadas. Ve a Firebase Console → Storage → Rules y configura modo desarrollo.' 
          };
        }
        throw error;
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      if (error.code === 'storage/bucket-not-found') {
        return { 
          success: false, 
          message: 'Storage no está habilitado. Ve a Firebase Console → Build → Storage → Get Started' 
        };
      }
      return { 
        success: false, 
        message: `Error: ${error.message}` 
      };
    }
  },

  // Crear un respaldo de la base de datos
  createBackup: async (userId = 'default_user') => {
    try {
      console.log('🔄 Iniciando creación de respaldo...');
      
      // 1. Obtener la ruta de la base de datos
      const dbPath = `${FileSystem.documentDirectory}SQLite/camiones.db`;
      console.log('📂 Ruta de la base de datos:', dbPath);
      
      // 2. Verificar si el archivo existe
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      if (!fileInfo.exists) {
        throw new Error('La base de datos no existe en: ' + dbPath);
      }
      console.log('✅ Archivo encontrado, tamaño:', fileInfo.size, 'bytes');
      
      // 3. Leer el archivo y crear blob usando fetch (más confiable que base64)
      const response = await fetch(`file://${dbPath}`);
      const blob = await response.blob();
      console.log('✅ Blob creado, tipo:', blob.type, 'tamaño:', blob.size);
      
      // 4. Crear nombre del archivo con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup_${timestamp}.db`;
      console.log('📝 Nombre del archivo:', fileName);
      
      // 5. Crear referencia en Firebase Storage
      const storageRef = ref(storage, `${BACKUP_FOLDER}/${userId}/${fileName}`);
      console.log('☁️ Referencia de Storage:', storageRef.fullPath);
      
      // 6. Subir el archivo
      console.log('⬆️ Subiendo a Firebase Storage...');
      const uploadResult = await uploadBytes(storageRef, blob, {
        contentType: 'application/x-sqlite3',
      });
      console.log('✅ Archivo subido exitosamente');
      
      // 7. Obtener URL de descarga
      const downloadURL = await getDownloadURL(storageRef);
      console.log('✅ URL de descarga obtenida');
      
      console.log('🎉 Respaldo creado exitosamente:', fileName);
      
      return {
        success: true,
        fileName,
        downloadURL,
        timestamp: new Date(),
        size: fileInfo.size,
      };
    } catch (error) {
      console.error('❌ Error creando respaldo:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        code: error.code,
        serverResponse: error.serverResponse,
      });
      throw error;
    }
  },

  // Listar todos los respaldos disponibles
  listBackups: async (userId = 'default_user') => {
    try {
      console.log('Listando respaldos disponibles...');
      
      const listRef = ref(storage, `${BACKUP_FOLDER}/${userId}`);
      const result = await listAll(listRef);
      
      const backups = await Promise.all(
        result.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);
          
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            downloadURL,
            createdAt: metadata.timeCreated,
            size: metadata.size,
            sizeFormatted: formatBytes(metadata.size),
          };
        })
      );
      
      // Ordenar por fecha (más reciente primero)
      backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log(`✅ ${backups.length} respaldos encontrados`);
      return backups;
    } catch (error) {
      console.error('❌ Error listando respaldos:', error);
      throw error;
    }
  },

  // Restaurar desde un respaldo
  restoreBackup: async (backupURL) => {
    try {
      console.log('Iniciando restauración desde respaldo...');
      
      // 1. Descargar el archivo desde Firebase
      const downloadPath = `${FileSystem.cacheDirectory}temp_backup.db`;
      const downloadResult = await FileSystem.downloadAsync(backupURL, downloadPath);
      
      if (downloadResult.status !== 200) {
        throw new Error('Error descargando el respaldo');
      }
      
      // 2. Cerrar la base de datos actual (si está abierta)
      // En la nueva API de expo-sqlite no necesitamos cerrar explícitamente
      
      // 3. Ruta de la base de datos actual
      const dbPath = `${FileSystem.documentDirectory}SQLite/camiones.db`;
      
      // 4. Hacer copia de seguridad de la DB actual antes de reemplazar
      const backupCurrentPath = `${FileSystem.documentDirectory}SQLite/camiones_backup_temp.db`;
      try {
        await FileSystem.copyAsync({
          from: dbPath,
          to: backupCurrentPath,
        });
      } catch (e) {
        console.log('No hay DB actual para respaldar');
      }
      
      // 5. Reemplazar la base de datos con el respaldo
      await FileSystem.copyAsync({
        from: downloadPath,
        to: dbPath,
      });
      
      // 6. Limpiar archivos temporales
      await FileSystem.deleteAsync(downloadPath, { idempotent: true });
      
      console.log('✅ Respaldo restaurado exitosamente');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error restaurando respaldo:', error);
      throw error;
    }
  },

  // Eliminar un respaldo
  deleteBackup: async (backupPath) => {
    try {
      console.log('Eliminando respaldo:', backupPath);
      
      const fileRef = ref(storage, backupPath);
      await deleteObject(fileRef);
      
      console.log('✅ Respaldo eliminado exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando respaldo:', error);
      throw error;
    }
  },

  // Exportar respaldo localmente
  exportBackupLocally: async () => {
    try {
      console.log('Exportando respaldo localmente...');
      
      // 1. Ruta de la base de datos
      const dbPath = `${FileSystem.documentDirectory}SQLite/camiones.db`;
      
      // 2. Verificar si existe
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      if (!fileInfo.exists) {
        throw new Error('La base de datos no existe');
      }
      
      // 3. Crear nombre del archivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `camiones_backup_${timestamp}.db`;
      const exportPath = `${FileSystem.cacheDirectory}${fileName}`;
      
      // 4. Copiar el archivo
      await FileSystem.copyAsync({
        from: dbPath,
        to: exportPath,
      });
      
      // 5. Compartir el archivo
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(exportPath, {
          mimeType: 'application/x-sqlite3',
          dialogTitle: 'Exportar respaldo de la base de datos',
          UTI: 'public.database',
        });
      }
      
      console.log('✅ Respaldo exportado exitosamente');
      
      return {
        success: true,
        path: exportPath,
        fileName,
      };
    } catch (error) {
      console.error('❌ Error exportando respaldo:', error);
      throw error;
    }
  },

  // Obtener estadísticas de la base de datos
  getDatabaseStats: async () => {
    try {
      const stats = await Promise.all([
        db.getFirstAsync('SELECT COUNT(*) as count FROM Camion'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM Destino'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM Viaje'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM EntregaViaje'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM Dueno'),
      ]);
      
      const dbPath = `${FileSystem.documentDirectory}SQLite/camiones.db`;
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      
      return {
        camiones: stats[0]?.count || 0,
        destinos: stats[1]?.count || 0,
        viajes: stats[2]?.count || 0,
        entregas: stats[3]?.count || 0,
        duenos: stats[4]?.count || 0,
        size: fileInfo.exists ? fileInfo.size : 0,
        sizeFormatted: fileInfo.exists ? formatBytes(fileInfo.size) : '0 B',
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        camiones: 0,
        destinos: 0,
        viajes: 0,
        entregas: 0,
        duenos: 0,
        size: 0,
        sizeFormatted: '0 B',
      };
    }
  },
};

// Funciones auxiliares

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
