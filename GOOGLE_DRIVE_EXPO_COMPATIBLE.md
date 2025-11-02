# ✅ Google Drive con Expo - Solución Compatible

## ⚠️ Problema Encontrado

`@react-native-google-signin/google-signin` **NO es compatible con Expo Go** porque requiere código nativo compilado.

## ✅ Solución Implementada

Se revirtió a usar **expo-auth-session** con **Implicit Flow**, que es compatible con Expo Go y no requiere configuración nativa adicional.

---

## 🚀 Cómo Funciona Ahora

### OAuth 2.0 Implicit Flow

1. Usuario presiona "Conectar con Google"
2. Se abre el navegador del dispositivo
3. Usuario inicia sesión con Google
4. Google redirige de vuelta a la app con el `access_token` en la URL
5. La app extrae el token y lo guarda
6. ✅ Autenticado

---

## 🔧 Configuración Requerida en Google Cloud Console

### 1. Agregar URI de Redirección

Ve a [Google Cloud Console](https://console.cloud.google.com/):

1. **APIs & Services > Credentials**
2. Edita tu **OAuth 2.0 Client ID (Web)**
3. En **"Authorized redirect URIs"** agrega:

```
https://auth.expo.io/@raudycode/CamionesApp
exp://192.168.x.x:8081  (tu IP local, se muestra en los logs)
```

4. Guarda los cambios
5. **Espera 5-10 minutos** para que los cambios se propaguen

### 2. Habilitar Google Drive API

1. **APIs & Services > Library**
2. Busca "Google Drive API"
3. Click en **"ENABLE"**

---

## 📱 Uso

```javascript
import { googleDriveV2 } from '../services/googleDriveV2Service';

// Autenticar
const result = await googleDriveV2.authenticate();
// Se abre el navegador, usuario inicia sesión, regresa a la app

// Verificar sesión
const hasSession = await googleDriveV2.hasValidSession();

// Obtener estado
const status = googleDriveV2.getStatus();
console.log(status.userInfo); // { name, email, picture }

// Cerrar sesión
await googleDriveV2.logout();
```

---

## 🔍 Diferencias con la Versión Anterior

| Característica | @react-native-google-signin | Expo Auth Session (Actual) |
|----------------|----------------------------|----------------------------|
| Compatible con Expo Go | ❌ No | ✅ Sí |
| Configuración nativa | ✅ Requerida | ❌ No requerida |
| Refresh tokens | ✅ Sí | ❌ No (tokens duran 1 hora) |
| Complejidad | Alta | Baja |
| Flujo | Authorization Code | Implicit Flow |

---

## ⚠️ Limitaciones del Implicit Flow

1. **Token expira en 1 hora**: Después de 1 hora, el usuario debe volver a autenticarse
2. **No hay refresh token**: No se puede renovar automáticamente
3. **Menos seguro**: El token se expone en la URL (pero es aceptable para apps móviles)

### Solución para la Expiración

Cuando el token expire (error 401), simplemente pide al usuario que vuelva a autenticarse:

```javascript
try {
  await backupV2Service.createBackup();
} catch (error) {
  if (error.message.includes('401')) {
    Alert.alert(
      'Sesión Expirada',
      'Por favor, vuelve a iniciar sesión',
      [{ text: 'OK', onPress: () => googleDriveV2.authenticate() }]
    );
  }
}
```

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa**: El URI de redirección no está agregado en Google Cloud Console

**Solución**:
1. Revisa los logs para ver el URI exacto
2. Agrégalo en Google Cloud Console
3. Espera 5-10 minutos
4. Intenta de nuevo

### Error: "access_denied"

**Causa**: Usuario canceló el login o no otorgó permisos

**Solución**: Normal, el usuario puede cancelar

### Token expira muy rápido

**Solución**: Es normal con Implicit Flow. El usuario debe volver a autenticarse cada hora.

---

## 📋 Checklist

- [x] Código actualizado a usar expo-auth-session
- [x] Desinstalado @react-native-google-signin/google-signin
- [x] Implicit Flow implementado
- [ ] URI de redirección agregado en Google Cloud Console
- [ ] Google Drive API habilitada
- [ ] Probado en dispositivo/emulador

---

## 🎯 Ventajas de Esta Solución

✅ **Compatible con Expo Go** - No requiere build nativo
✅ **Fácil de configurar** - Solo URIs en Google Cloud Console
✅ **Funciona inmediatamente** - No hay archivos nativos que configurar
✅ **Menos dependencias** - Usa solo lo que Expo ya tiene

---

## 🚀 Alternativa Futura (Opcional)

Si necesitas refresh tokens y mejor seguridad:

1. **Crear un build de desarrollo** con `eas build --profile development`
2. **Usar Authorization Code Flow + PKCE** (requiere servidor)
3. **O migrar a Bare Workflow** y usar @react-native-google-signin

Pero para la mayoría de casos, **Implicit Flow es suficiente**.

---

**Última actualización**: 28 de octubre, 2025
**Estado**: ✅ Compatible con Expo Go
