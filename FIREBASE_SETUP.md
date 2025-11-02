# 📦 Configuración de Firebase para Respaldos

## 🔥 Paso 1: Instalar las dependencias

```bash
npm install firebase expo-file-system expo-sharing
```

## 🚀 Paso 2: Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Add project"
3. Ingresa un nombre para tu proyecto (ej: "CamionesApp")
4. Continúa con los pasos hasta crear el proyecto

## ⚙️ Paso 3: Configurar Firebase Storage

1. En el menú lateral, selecciona **"Build" → "Storage"**
2. Haz clic en "Get Started"
3. Selecciona las reglas de seguridad:
   - **Modo de prueba** (para desarrollo):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   - **Modo producción** (recomendado):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /backups/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
4. Selecciona una ubicación para el Storage (ej: us-central1)
5. Haz clic en "Done"

## 🔑 Paso 4: Obtener la configuración de Firebase

1. En Firebase Console, haz clic en el ícono de engranaje ⚙️ junto a "Project Overview"
2. Selecciona "Project settings"
3. Desplázate hacia abajo hasta "Your apps"
4. Si no has agregado una app web, haz clic en el ícono `</>` (Web)
5. Registra tu app con un nombre (ej: "CamionesWeb")
6. Copia el objeto `firebaseConfig` que aparece

## 📝 Paso 5: Configurar las credenciales en tu app

Abre el archivo `/src/config/firebaseConfig.js` y reemplaza los valores de ejemplo con los de tu proyecto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## ✅ Paso 6: Verificar la instalación

1. Ejecuta la app: `npx expo start`
2. Ve a la pestaña "Respaldo"
3. Intenta crear un respaldo
4. Verifica en Firebase Console → Storage que se haya creado la carpeta `backups/`

## 🔐 Seguridad (Opcional pero Recomendado)

### Habilitar Firebase Authentication

Para mayor seguridad, puedes habilitar la autenticación:

1. En Firebase Console, ve a **"Build" → "Authentication"**
2. Haz clic en "Get Started"
3. Habilita "Email/Password" o el método que prefieras
4. Actualiza las reglas de Storage para requerir autenticación (ver Paso 3, modo producción)

### Configurar variables de entorno

Para no exponer tus credenciales en el código, usa variables de entorno:

1. Crea un archivo `.env` en la raíz del proyecto:
```env
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_auth_domain
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_STORAGE_BUCKET=tu_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
FIREBASE_APP_ID=tu_app_id
```

2. Instala la dependencia:
```bash
npm install react-native-dotenv
```

3. Actualiza `firebaseConfig.js` para usar las variables:
```javascript
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};
```

## 📱 Funcionalidades Disponibles

### ✨ Crear Respaldo en la Nube
- Sube automáticamente la base de datos SQLite a Firebase Storage
- Incluye timestamp en el nombre del archivo
- Mantiene múltiples versiones

### 💾 Exportar Localmente
- Crea una copia de la base de datos en tu dispositivo
- Permite compartir el archivo por WhatsApp, email, etc.
- Útil para respaldos manuales

### ♻️ Restaurar Respaldo
- Descarga y restaura cualquier respaldo anterior
- Reemplaza la base de datos actual
- Requiere confirmación para evitar pérdidas accidentales

### 🗑️ Eliminar Respaldo
- Elimina respaldos antiguos de Firebase Storage
- Libera espacio en tu proyecto

### 📊 Estadísticas
- Muestra información de la base de datos actual
- Cantidad de camiones, viajes, entregas, etc.
- Tamaño total de la base de datos

## 🚨 Notas Importantes

1. **Límites de Firebase (Plan Gratuito)**:
   - 5 GB de almacenamiento
   - 1 GB de descarga al día
   - 50,000 lecturas/día
   - 20,000 escrituras/día

2. **Tamaño de la base de datos**:
   - SQLite es muy eficiente (~100 KB para miles de registros)
   - Puedes mantener cientos de respaldos sin problema

3. **Frecuencia recomendada**:
   - Crear respaldo diario automático (si implementas)
   - O crear manualmente después de cambios importantes

4. **Respaldo local**:
   - Siempre mantén copias locales adicionales
   - Exporta antes de actualizaciones importantes

## 🐛 Solución de Problemas

### Error: "Storage bucket not configured"
- Verifica que hayas habilitado Storage en Firebase Console
- Confirma que el `storageBucket` en firebaseConfig.js sea correcto

### Error: "Permission denied"
- Revisa las reglas de seguridad en Storage
- En desarrollo, usa modo de prueba (allow all)
- En producción, implementa autenticación

### Error: "Network request failed"
- Verifica tu conexión a internet
- Confirma que las credenciales de Firebase sean correctas

### La app se reinicia después de restaurar
- Esto es normal, la base de datos necesita recargarse
- La app navega automáticamente a la pantalla de inicio

## 📚 Referencias

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
