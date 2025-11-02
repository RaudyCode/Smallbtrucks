# 📱 Configuración de Respaldo con Google Drive

## ⚡ Inicio Rápido (5 minutos)

⚠️ **IMPORTANTE**: Para desarrollo con Expo/React Native, necesitas crear un **Client ID Web**, NO Android.

1. **Ve a [Google Cloud Console](https://console.cloud.google.com/)**
2. **Crea un proyecto** → "CamionesMobile"
3. **Habilita Drive API** → Busca "Google Drive API" y habilita
4. **Configura OAuth** → Pantalla de consentimiento → Externa
5. **Agrega ámbitos**:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive.appdata`
6. **Agrégarte como usuario de prueba** (tu email)
7. **Crea credenciales** → OAuth 2.0 → **Aplicación WEB** ⚠️
8. **URIs de redireccionamiento autorizados**, agrega AMBOS:
   ```
   com.smallbtrucks.app:/oauthredirect
   com.smallbtrucks.app:/
   ```
9. **Copia el Client ID** y reemplázalo en `src/services/googleDriveService.js` en la constante `GOOGLE_WEB_CLIENT_ID`

¡Listo! Con esto funciona en tu app.

---

## 🔧 Configuración de Google Cloud Console

Para que el respaldo funcione, necesitas configurar OAuth 2.0 en Google Cloud Console.

### Paso 1: Crear proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombra el proyecto (ej: "CamionesMobile Backup")

### Paso 2: Habilitar Google Drive API

1. En el menú lateral, ve a **APIs y servicios** > **Biblioteca**
2. Busca "Google Drive API"
3. Haz clic en "Habilitar"

### Paso 3: Configurar pantalla de consentimiento OAuth

1. Ve a **APIs y servicios** > **Pantalla de consentimiento de OAuth**
2. Selecciona **Externa** (para testing)
3. Completa la información requerida:
   - **Nombre de la aplicación**: CamionesMobile
   - **Correo de soporte al usuario**: tu-email@gmail.com
   - **Logo de la aplicación**: (opcional)
   - **Dominios autorizados**: (dejar vacío para desarrollo)
   - **Correo del desarrollador**: tu-email@gmail.com
4. Haz clic en **Guardar y continuar**
5. En "Ámbitos", haz clic en **Agregar o quitar ámbitos**
   - Busca y agrega: `https://www.googleapis.com/auth/drive.file`
   - Busca y agrega: `https://www.googleapis.com/auth/drive.appdata`
6. Continúa y en "Usuarios de prueba", agrega tu correo de Gmail
7. Guarda

### Paso 4: Crear credenciales OAuth 2.0

#### Para Android (CONFIGURACIÓN ACTUAL):

1. Ve a **APIs y servicios** > **Credenciales**
2. Haz clic en **Crear credenciales** > **ID de cliente de OAuth 2.0**
3. Selecciona **Aplicación de Android**
4. Completa:
   - **Nombre**: CamionesMobile Android
   - **Nombre del paquete**: `com.raudy.camionapp`
   - **Huella digital del certificado SHA-1**: `58:E1:C5:0D:7A:89:F8:F6:92:12:F5:24:8D:F9:95:26:A3:F6:9E:70`
5. El Client ID generado ya está configurado en el código

**Client ID actual**: `69547892797-d8e60s1s89hsuflkc6fvgntq64b7v6bt.apps.googleusercontent.com`

##### Cómo obtener tu SHA-1:

**Método 1: Generar SHA-1 con Gradle (RECOMENDADO)**

```bash
cd android
./gradlew signingReport
```

Busca la línea que dice `SHA1:` bajo `Task :app:signingReport` > `Variant: debug`

**Método 2: Usar el SHA-1 por defecto de debug**

El SHA-1 por defecto de debug en Expo es:
```
58:E1:C5:0D:7A:89:F8:F6:92:12:F5:24:8D:F9:95:26:A3:F6:9E:70
```

#### Para desarrollo con Expo Go (alternativo):

Si prefieres probar primero en Expo Go sin builds nativos:

#### Para desarrollo con Expo Go (alternativo):

Si prefieres probar primero en Expo Go sin builds nativos:

1. Crea un **segundo** Client ID tipo **Aplicación web**
2. **URIs de redireccionamiento autorizados**: 
   ```
   https://auth.expo.io/@tu-usuario/small-btrucks
   ```
3. Usa ese Client ID Web en el código cuando estés en Expo Go

##### Método 3: Extraer SHA-1 del keystore existente

Si tienes OpenSSL instalado:

```bash
cd android/app
openssl sha1 debug.keystore
```

O con el siguiente comando completo:

```bash
cd android/app
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep SHA1
```

Si `keytool` no está instalado, instálalo:

**Arch Linux:**
```bash
sudo pacman -S jdk-openjdk
```

**Ubuntu/Debian:**
```bash
sudo apt install openjdk-17-jdk
```

**macOS:**
```bash
brew install openjdk@17
```

---

### 💡 Configuración actual del proyecto

**Client ID configurado**: `69547892797-d8e60s1s89hsuflkc6fvgntq64b7v6bt.apps.googleusercontent.com`  
**Tipo**: Aplicación de Android  
**Package name**: `com.raudy.camionapp`  
**SHA-1**: `58:E1:C5:0D:7A:89:F8:F6:92:12:F5:24:8D:F9:95:26:A3:F6:9E:70`  
**Scheme**: `com.smallbtrucks.app`

Este Client ID ya está configurado en `src/services/googleDriveService.js`. Solo necesitas:

1. Asegurarte de que el Client ID en Google Cloud Console tenga el SHA-1 correcto
2. Verificar que el package name sea `com.raudy.camionapp`
3. Agregar tu email en "Usuarios de prueba"

Luego completa en Google Cloud Console:
1. Ve a **APIs y servicios** > **Credenciales**
2. Haz clic en **Crear credenciales** > **ID de cliente de OAuth 2.0**
3. Selecciona **Aplicación de Android**
4. Completa:
   - **Nombre**: CamionesMobile Android
   - **Nombre del paquete**: `com.raudy.camionapp` (del app.json)
   - **Huella digital del certificado SHA-1**: Pega el SHA-1 obtenido
5. Copia el **Client ID** generado

---

### 💡 Configuración actual del proyecto

**Client ID configurado**: `69547892797-d8e60s1s89hsuflkc6fvgntq64b7v6bt.apps.googleusercontent.com`  
**Tipo**: Aplicación de Android  
**Package name**: `com.raudy.camionapp`  
**SHA-1**: `58:E1:C5:0D:7A:89:F8:F6:92:12:F5:24:8D:F9:95:26:A3:F6:9E:70`  
**Scheme**: `com.smallbtrucks.app`

Este Client ID ya está configurado en `src/services/googleDriveService.js`. Solo necesitas:

1. Asegurarte de que el Client ID en Google Cloud Console tenga el SHA-1 correcto
2. Verificar que el package name sea `com.raudy.camionapp`
3. Agregar tu email en "Usuarios de prueba"

#### Para iOS (opcional):

1. Crea otro ID de cliente
2. Selecciona **iOS**
3. Completa con tu Bundle ID

---

### Paso 5: Verificación de la configuración

El código ya está configurado con:

```javascript
const GOOGLE_ANDROID_CLIENT_ID = '69547892797-d8e60s1s89hsuflkc6fvgntq64b7v6bt.apps.googleusercontent.com';
```

Y el `app.json` tiene:

```json
{
  "expo": {
    "scheme": "com.smallbtrucks.app",
    "android": {
      "package": "com.raudy.camionapp"
    }
  }
}
```

---

### 💡 Configuración simplificada para desarrollo

**Para empezar rápido con Expo Go, solo necesitas:**

1. **ID de cliente Web OAuth 2.0**:
   - Tipo: Aplicación web
   - URI de redirección: `https://auth.expo.io/@tu-usuario/smallbtrucks`

2. **Agregar tu email en "Usuarios de prueba"**

3. **Usar ese Client ID en el código**

Con esto funcionará en Expo Go. Para builds nativos (APK/AAB), necesitarás también el ID de Android con SHA-1.

### Paso 5: Configurar en la app

1. Abre el archivo `src/services/googleDriveService.js`
2. Reemplaza `TU_CLIENT_ID` con tu Client ID de Google:

```javascript
const GOOGLE_CLIENT_ID = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
```

3. Actualiza `app.json` con tu esquema:

```json
{
  "expo": {
    "scheme": "com.smallbtrucks.app",
    "android": {
      "package": "com.smallbtrucks.app"
    },
    "ios": {
      "bundleIdentifier": "com.smallbtrucks.app"
    }
  }
}
```

---

### Paso 6: Probar la autenticación

**Para desarrollo local con Expo:**

```bash
npx expo start
```

**Para build de Android:**

```bash
npx expo prebuild
cd android && ./gradlew assembleDebug
```

**⚠️ Importante**: Para que funcione la autenticación de Google con Android:

1. El SHA-1 debe coincidir con el keystore que estás usando
2. El package name debe ser exactamente `com.raudy.camionapp`
3. Tu email debe estar en "Usuarios de prueba" en Google Cloud Console

Si usas Expo managed workflow:
```bash
expo prebuild --clean
```

Si usas bare workflow:
```bash
cd android && ./gradlew clean
cd ios && pod install
```

---

## 🚀 Uso de la funcionalidad

### Autenticación

1. Abre la app y ve a la pestaña **"Respaldo"**
2. Presiona **"Iniciar sesión con Google"**
3. Selecciona tu cuenta de Google
4. Acepta los permisos solicitados

### Respaldo manual

1. Una vez autenticado, presiona **"Respaldar ahora"**
2. Espera a que se complete
3. Verás un mensaje de confirmación

### Restaurar datos

1. Presiona **"Restaurar datos"**
2. Confirma la acción
3. Los datos del respaldo se agregarán a tu base de datos

### Respaldo automático

1. Activa el switch **"Activar respaldo automático"**
2. Selecciona frecuencia: **Diario** o **Semanal**
3. La app respaldará automáticamente según la configuración

---

## 📋 Estructura del respaldo

El archivo de respaldo (`camiones_backup.json`) tiene esta estructura:

```json
{
  "version": "1.0",
  "timestamp": "2025-10-25T15:30:00.000Z",
  "data": {
    "camiones": [
      {
        "id": 1,
        "nombre": "Camión F1",
        "placa": "ABC123",
        "estado": "activo",
        "viajes_realizados": 25
      }
    ],
    "destinos": [
      {
        "id": 1,
        "nombre": "CEMEX",
        "ubicacion": "Santo Domingo"
      }
    ],
    "viajes": [
      {
        "id": 1,
        "camion_id": 1,
        "destino_id": 1,
        "cantidad_viajes": 10,
        "viajes_realizados": 5,
        "estado": "En progreso",
        "fecha_programada": "2025-10-25"
      }
    ],
    "entregas": [
      {
        "id": 1,
        "viaje_id": 1,
        "fecha_entrega": "2025-10-25"
      }
    ]
  },
  "metadata": {
    "totalCamiones": 1,
    "totalDestinos": 1,
    "totalViajes": 1,
    "totalEntregas": 1
  }
}
```

---

## 🔒 Seguridad

- Los datos se almacenan en la carpeta `appDataFolder` de Google Drive
- Solo la app tiene acceso a esta carpeta
- Los datos están encriptados por Google Drive
- Puedes revocar el acceso en cualquier momento desde [Google Account Permissions](https://myaccount.google.com/permissions)

---

## 🐛 Solución de problemas

### Error: "No autenticado"
- Asegúrate de haber iniciado sesión con Google
- Verifica que el token no haya expirado (cierra y abre la app)

### Error: "FOREIGN KEY constraint failed"
- Intenta restaurar en una base de datos vacía
- O modifica la lógica de restauración para hacer merge inteligente

### Error de autenticación
- Verifica que el Client ID sea correcto
- Asegúrate de que el SHA-1 coincida
- Revisa que el paquete de la app coincida con el registrado

### No se encuentra el archivo de respaldo
- Verifica que hayas creado al menos un respaldo
- Revisa los permisos en Google Cloud Console

---

## 📝 Notas importantes

1. **Usuarios de prueba**: En modo desarrollo, solo los usuarios agregados en "Usuarios de prueba" podrán autenticarse.

2. **Producción**: Para publicar la app, deberás solicitar verificación de Google y pasar el proceso de revisión.

3. **Límites de Google Drive API**:
   - 1,000 solicitudes por 100 segundos por usuario
   - Suficiente para uso normal de la app

4. **Tamaño del respaldo**: Depende de la cantidad de datos. Generalmente será menor a 1MB.

---

## 🔄 Flujo completo

```
Usuario abre app → Va a Respaldo
       ↓
¿Está autenticado? → NO → Iniciar sesión con Google
       ↓                          ↓
      SÍ                    Autoriza permisos
       ↓                          ↓
Respaldo Manual              Autenticado ✓
       ↓
Crea backup.json → Sube a Drive → Confirma
       ↓
Muestra última fecha de respaldo
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la consola de la app
2. Verifica la configuración en Google Cloud Console
3. Asegúrate de tener permisos en Drive API
4. Revisa que el token no haya expirado

---

**¡Listo! Ahora tus datos están seguros en la nube ☁️**
