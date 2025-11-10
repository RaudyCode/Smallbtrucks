# 🔧 Guía para Solucionar DEVELOPER_ERROR en Google Sign-In

## ❌ **Error Actual**
```
DEVELOPER_ERROR: Follow troubleshooting instructions at https://react-native-google-signin.github.io/docs/troubleshooting
```

## 🎯 **Causa del Error**
El error `DEVELOPER_ERROR` indica que la configuración de Google Sign-In en Firebase Console está incompleta o incorrecta.

## 🛠️ **Solución Paso a Paso**

### **1. Ir a Firebase Console**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `smallbtrucks-a2673`
3. Ve a **Authentication** > **Sign-in method**

### **2. Configurar Google Sign-In**
1. Haz clic en **Google**
2. **Habilitar** Google Sign-In si no está habilitado
3. **Agregar dominio autorizado** (si es necesario):
   - `localhost` (para desarrollo)
   - Tu dominio de producción

### **3. Obtener Web Client ID**
1. Ve a **Project Settings** (⚙️) > **General**
2. En la sección **Your apps**, busca **Web app**
3. Si no tienes una Web App:
   - Haz clic en **Add app** > **Web**
   - Nombre: `SmallBtrucks Web`
   - Registrar app
4. Copia el **Web client ID**

### **4. Configurar Android App**
1. En **Project Settings** > **General**
2. En **Your apps**, busca tu **Android app**
3. Si no la tienes, créala:
   - Haz clic en **Add app** > **Android** 
   - Package name: `com.raudy.camionapp`
   - App nickname: `SmallBtrucks Android`
   - SHA-1: (opcional por ahora)

### **5. Actualizar Configuración en el Código**

Una vez que tengas el **Web Client ID** real de Firebase Console, actualiza:

```javascript
// src/services/authService.js
GoogleSignin.configure({
  webClientId: 'TU_WEB_CLIENT_ID_REAL.apps.googleusercontent.com', // Reemplaza esto
  androidClientId: 'TU_ANDROID_CLIENT_ID.apps.googleusercontent.com', // Opcional
  scopes: ['profile', 'email'],
  offlineAccess: true,
});
```

### **6. Descargar google-services.json Actualizado**
1. En Firebase Console > **Project Settings**
2. En tu **Android app**, haz clic en **google-services.json**
3. **Descargar** el archivo actualizado
4. **Reemplazar** el archivo en: `android/app/google-services.json`

### **7. Construir Nueva APK**
```bash
# Limpiar cache
expo r -c

# Construir nueva APK con configuración actualizada
eas build --platform android --profile production
```

## 🔍 **Verificación**

Después de la configuración, los logs deberían mostrar:
```
✅ Google Play Services disponible
📱 Iniciando proceso de sign-in...
✅ UserInfo obtenido: usuario@gmail.com
✅ Sesión con Google iniciada exitosamente
```

## ⚠️ **Notas Importantes**

1. **Expo Go**: Google Sign-In puede no funcionar completamente en Expo Go
2. **APK Compilada**: Funcionamiento completo garantizado
3. **Configuración**: Debe hacerse en Firebase Console, no solo en el código
4. **google-services.json**: Debe estar actualizado con la configuración de OAuth

## 🆘 **Si el Error Persiste**

1. **Verifica** que el `webClientId` sea el correcto
2. **Confirma** que Google Sign-In esté **habilitado** en Firebase Console
3. **Asegúrate** de que el `package name` coincida: `com.raudy.camionapp`
4. **Descarga** nuevamente `google-services.json` después de los cambios
5. **Construye** nueva APK después de los cambios

## 📱 **Configuración Actual (Temporal)**
```javascript
webClientId: '687559260753-sj9k8h7l9m6n5p4q3r2t1s0.apps.googleusercontent.com' // TEMPORAL
```

**Este ID es temporal y DEBE reemplazarse con el real de Firebase Console.**