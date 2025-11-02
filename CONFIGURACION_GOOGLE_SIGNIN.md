# 🔧 Configuración de Google Sign-In

## ⚠️ IMPORTANTE: Configuración Requerida

Para que Google Sign-In funcione, debes seguir estos pasos:

---

## 📱 Configuración Android

### 1. Obtener SHA-1 del keystore

```bash
# Para keystore de debug
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Para keystore de release (si ya lo tienes)
keytool -list -v -keystore android/app/release.keystore -alias <your-alias>
```

Copia el **SHA1** que aparece en el output.

### 2. Agregar SHA-1 a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services > Credentials**
4. Selecciona tu **OAuth 2.0 Client ID de Android**
5. Si no tienes uno, créalo:
   - Click en **"+ CREATE CREDENTIALS" > "OAuth client ID"**
   - Tipo: **Android**
   - Nombre del paquete: `com.raudy.camionapp` (del app.json)
   - Certificado de firma SHA-1: Pega el SHA-1 que copiaste
   - Click en **"CREATE"**

### 3. Descargar google-services.json

1. En Google Cloud Console, ve a **Project settings**
2. En la sección de **Android apps**, descarga el archivo `google-services.json`
3. Coloca el archivo en: `android/app/google-services.json`

### 4. Configurar build.gradle

Ya está configurado en tu proyecto, pero verifica que tenga:

**android/build.gradle:**
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15' // ✅ Verificar
    }
}
```

**android/app/build.gradle:**
```gradle
apply plugin: 'com.google.gms.google-services' // ✅ Al final del archivo
```

---

## 🍎 Configuración iOS

### 1. Obtener iOS Client ID

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Ve a **APIs & Services > Credentials**
3. Busca tu **iOS Client ID** o créalo:
   - Click en **"+ CREATE CREDENTIALS" > "OAuth client ID"**
   - Tipo: **iOS**
   - Bundle ID: `com.raudy.camionapp` (del app.json)
   - Click en **"CREATE"**

### 2. Descargar GoogleService-Info.plist

1. Descarga el archivo `GoogleService-Info.plist`
2. Coloca el archivo en: `ios/` (raíz del directorio ios)

### 3. Configurar URL Scheme

Abre `ios/CamionApp/Info.plist` y agrega:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.280666627883-XXXXXX</string>
    </array>
  </dict>
</array>
```

Reemplaza `280666627883-XXXXXX` con tu **REVERSED_CLIENT_ID** del GoogleService-Info.plist.

---

## 🔑 IDs Necesarios

### Web Client ID (ya configurado)
```
280666627883-1a3u1rl73cqvhph2t0ti9hm9nlpsi.apps.googleusercontent.com
```

### Android Client ID
Lo creas en Google Cloud Console con el SHA-1

### iOS Client ID  
Lo creas en Google Cloud Console con el Bundle ID

---

## 🧪 Probar la Configuración

### 1. Reinstalar la app

```bash
# Android
npm run android

# iOS
cd ios && pod install && cd ..
npm run ios
```

### 2. Probar Sign In

1. Abre la app
2. Ve a la pantalla de "Google Drive"
3. Presiona "Conectar con Google"
4. Debería abrir el navegador/modal de Google
5. Selecciona tu cuenta
6. ✅ Si todo está bien, verás "Autenticación exitosa"

---

## 🐛 Solución de Problemas

### Error: "DEVELOPER_ERROR"
**Causa**: SHA-1 no agregado o incorrecto en Google Cloud Console

**Solución**:
1. Regenera el SHA-1 con el comando de keytool
2. Agrégalo en Google Cloud Console
3. Espera 5 minutos
4. Intenta de nuevo

### Error: "SIGN_IN_CANCELLED"
**Causa**: Usuario canceló el login

**Solución**: Normal, el usuario puede cancelar

### Error: "PLAY_SERVICES_NOT_AVAILABLE"
**Causa**: Google Play Services no está instalado (solo Android)

**Solución**: Instala Google Play Services en el emulador/dispositivo

### Error: "API not enabled"
**Causa**: Google Drive API no está habilitada

**Solución**:
1. Ve a Google Cloud Console
2. **APIs & Services > Library**
3. Busca "Google Drive API"
4. Click en "ENABLE"

---

## 📋 Checklist de Configuración

### Android
- [ ] SHA-1 obtenido del keystore
- [ ] Android OAuth Client ID creado en Google Cloud Console
- [ ] SHA-1 agregado al Client ID
- [ ] google-services.json descargado
- [ ] google-services.json colocado en android/app/
- [ ] Plugin de google-services configurado en build.gradle

### iOS
- [ ] iOS OAuth Client ID creado en Google Cloud Console
- [ ] GoogleService-Info.plist descargado
- [ ] GoogleService-Info.plist colocado en ios/
- [ ] URL Scheme configurado en Info.plist
- [ ] Pod install ejecutado

### APIs Habilitadas
- [ ] Google Drive API habilitada
- [ ] Google Sign-In API habilitada (se habilita automáticamente)

---

## ✅ Verificar que Todo Funciona

```javascript
// En la consola de la app, deberías ver:
✅ Google Sign In configurado
🔐 Iniciando autenticación con Google Sign In...
✅ Autenticación exitosa
🚀 Inicializando Google Drive...
📁 Carpeta "CamionesApp_Backups" creada exitosamente
✅ Google Drive inicializado. Folder ID: xxxxx
```

---

## 📞 Necesitas Ayuda?

Si sigues teniendo problemas:
1. Revisa los logs de la consola
2. Verifica que todos los archivos de configuración estén en su lugar
3. Asegúrate de que el SHA-1 sea el correcto (debug o release)
4. Espera 5-10 minutos después de hacer cambios en Google Cloud Console

---

**Última actualización**: 28 de octubre, 2025
