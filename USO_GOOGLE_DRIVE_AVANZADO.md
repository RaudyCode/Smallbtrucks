# 📚 Guía de Uso: Google Drive Service Mejorado

##  Funcionalidades Implementadas

He creado `googleDriveAdvancedService.js` con las siguientes funcionalidades:

### ✅ 1. Subir Archivos
```javascript
import googleDriveAdvanced from './services/googleDriveAdvancedService';

// Subir un archivo con progreso
const result = await googleDriveAdvanced.uploadFile(
  fileUri,           // URI local del archivo
  'backup.json',     // Nombre en Drive
  'application/json', // Tipo MIME
  (progress) => {    // Callback de progreso (0-100)
    console.log(`Progreso: ${progress}%`);
  }
);

if (result.success) {
  console.log('Archivo subido:', result.fileId);
}
```

### ✅ 2. Descargar Archivos
```javascript
const result = await googleDriveAdvanced.downloadFile(
  'file-id-123',       // ID del archivo en Drive
  'backup_local.json', // Nombre local
  (progress) => {
    console.log(`Descargando: ${progress}%`);
  }
);

if (result.success) {
  console.log('Guardado en:', result.uri);
}
```

### ✅ 3. Listar Archivos
```javascript
const result = await googleDriveAdvanced.listFiles(20); // Últimos 20 archivos

if (result.success) {
  result.files.forEach(file => {
    console.log(`📄 ${file.name} - ${file.size} bytes`);
  });
}
```

### ✅ 4. Selector de Archivos
```javascript
// Abrir el selector del dispositivo
const result = await googleDriveAdvanced.pickFile(['application/json', 'text/plain']);

if (result.success && !result.canceled) {
  console.log('Archivo seleccionado:', result.name);
  console.log('URI:', result.uri);
  console.log('Tamaño:', result.size);
}
```

### ✅ 5. Compartir Archivos
```javascript
const result = await googleDriveAdvanced.shareFile(
  fileUri, // URI local del archivo
  'Compartir backup'
);

if (result.success) {
  console.log('Archivo compartido');
}
```

### ✅ 6. Eliminar Archivos
```javascript
const result = await googleDriveAdvanced.deleteFile('file-id-123');

if (result.success) {
  console.log('Archivo eliminado de Drive');
}
```

### ✅ 7. Obtener Metadata
```javascript
const result = await googleDriveAdvanced.getFileMetadata('file-id-123');

if (result.success) {
  console.log('Nombre:', result.metadata.name);
  console.log('Tamaño:', result.metadata.size);
  console.log('Creado:', result.metadata.createdTime);
}
```

---

## 🎯 Ejemplos de Uso Completos

### Ejemplo 1: Subir Backup con Selector de Archivos

```javascript
import { Alert } from 'react-native';
import googleDriveAdvanced from './services/googleDriveAdvancedService';

async function subirBackupPersonalizado() {
  try {
    // 1. Seleccionar archivo del dispositivo
    const fileResult = await googleDriveAdvanced.pickFile([
      'application/json',
      'text/plain',
    ]);
    
    if (fileResult.canceled) {
      Alert.alert('Cancelado', 'No seleccionaste ningún archivo');
      return;
    }
    
    if (!fileResult.success) {
      Alert.alert('Error', fileResult.error);
      return;
    }
    
    // 2. Subir a Drive con progreso
    Alert.alert('Subiendo', 'Subiendo archivo a Google Drive...');
    
    const uploadResult = await googleDriveAdvanced.uploadFile(
      fileResult.uri,
      fileResult.name,
      fileResult.mimeType || 'application/octet-stream',
      (progress) => {
        console.log(`Progreso de subida: ${progress}%`);
      }
    );
    
    if (uploadResult.success) {
      Alert.alert(
        'Éxito',
        `Archivo "${uploadResult.fileName}" subido correctamente`
      );
    } else {
      Alert.alert('Error', uploadResult.error);
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
}
```

### Ejemplo 2: Descargar y Compartir Backup

```javascript
async function descargarYCompartir(fileId, fileName) {
  try {
    // 1. Descargar de Drive
    Alert.alert('Descargando', 'Descargando backup...');
    
    const downloadResult = await googleDriveAdvanced.downloadFile(
      fileId,
      fileName,
      (progress) => {
        console.log(`Descarga: ${progress}%`);
      }
    );
    
    if (!downloadResult.success) {
      Alert.alert('Error', downloadResult.error);
      return;
    }
    
    // 2. Compartir archivo descargado
    const shareResult = await googleDriveAdvanced.shareFile(
      downloadResult.uri,
      `Compartir ${fileName}`
    );
    
    if (shareResult.success) {
      Alert.alert('Éxito', 'Archivo compartido correctamente');
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
}
```

### Ejemplo 3: Mostrar Lista de Backups

```javascript
import { FlatList, Text, TouchableOpacity } from 'react-native';

function BackupListScreen() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const cargarBackups = async () => {
    setLoading(true);
    const result = await googleDriveAdvanced.listFiles(50);
    setLoading(false);
    
    if (result.success) {
      setBackups(result.files);
    } else {
      Alert.alert('Error', result.error);
    }
  };
  
  useEffect(() => {
    cargarBackups();
  }, []);
  
  const renderBackup = ({ item }) => (
    <TouchableOpacity
      style={styles.backupItem}
      onPress={() => descargarYCompartir(item.id, item.name)}
    >
      <Text style={styles.backupName}>{item.name}</Text>
      <Text style={styles.backupSize}>
        {(item.size / 1024).toFixed(2)} KB
      </Text>
      <Text style={styles.backupDate}>
        {new Date(item.modifiedTime).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <FlatList
      data={backups}
      renderItem={renderBackup}
      keyExtractor={(item) => item.id}
      refreshing={loading}
      onRefresh={cargarBackups}
    />
  );
}
```

---

## 🔧 Integración con el Servicio Existente

Puedes usar el servicio avanzado junto con el existente:

```javascript
import googleDriveService from './services/googleDriveService';
import googleDriveAdvanced from './services/googleDriveAdvancedService';
import backupService from './services/backupService';

async function backupCompleto() {
  try {
    // 1. Autenticarse (servicio existente)
    const authResult = await googleDriveService.authenticate();
    if (!authResult.success) {
      Alert.alert('Error', 'No se pudo autenticar');
      return;
    }
    
    // 2. Crear backup (servicio existente)
    const backup = await backupService.createBackup();
    
    // 3. Guardar como archivo temporal
    const tempUri = `${FileSystem.documentDirectory}temp_backup.json`;
    await FileSystem.writeAsStringAsync(
      tempUri,
      JSON.stringify(backup, null, 2)
    );
    
    // 4. Subir con servicio avanzado (con progreso)
    const uploadResult = await googleDriveAdvanced.uploadFile(
      tempUri,
      `backup_${Date.now()}.json`,
      'application/json',
      (progress) => {
        console.log(`Subida: ${progress}%`);
      }
    );
    
    // 5. Limpiar archivo temporal
    await FileSystem.deleteAsync(tempUri, { idempotent: true });
    
    if (uploadResult.success) {
      Alert.alert('Éxito', 'Backup completado y subido a Drive');
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
}
```

---

## 📦 Tipos MIME Comunes

```javascript
const mimeTypes = {
  json: 'application/json',
  txt: 'text/plain',
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  png: 'image/png',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
  zip: 'application/zip',
  csv: 'text/csv',
  xml: 'application/xml',
};
```

---

## ⚡ Ventajas de esta Implementación

1. **✅ Compatible con Expo** - No requiere eject
2. **✅ Progreso en tiempo real** - Callbacks para mostrar barras de progreso
3. **✅ Selector nativo** - Usa DocumentPicker de Expo
4. **✅ Compartir archivos** - Integración con el menú de compartir del SO
5. **✅ Manejo robusto de errores** - Todos los métodos retornan `{success, error}`
6. **✅ TypeScript ready** - Fácil de tipar si migras a TS
7. **✅ appDataFolder** - Los archivos están protegidos y no visibles al usuario
8. **✅ No requiere permisos extra** - Usa el almacenamiento de Expo

---

## 🚀 Próximos Pasos

1. **Instala las dependencias:**
   ```bash
   npx expo install expo-file-system expo-document-picker expo-sharing
   ```

2. **Importa el servicio en tus pantallas:**
   ```javascript
   import googleDriveAdvanced from '../services/googleDriveAdvancedService';
   ```

3. **Úsalo en BackupScreen para:**
   - Mostrar lista de backups existentes
   - Descargar backups antiguos
   - Compartir backups
   - Seleccionar y subir archivos personalizados

---

**💡 Nota:** Todos los archivos se guardan en `appDataFolder` de Google Drive, que es privado para la app y no aparece en "Mi unidad" del usuario.
