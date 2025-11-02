# 🔐 Cómo resolver "No permite URL de esquema personalizado"

## ❌ El problema

Google OAuth **no acepta esquemas personalizados** como:
```
com.smallbtrucks.app://
exp://192.168.1.5:8081
```

Cuando usas un **Client ID de tipo WEB**.

## ✅ La solución

Usar **Expo Proxy** (ya configurado en tu código):

```javascript
const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true, // ✅ Esto genera URLs válidas
});
```

## 📋 Pasos para configurar

### 1. Ejecutar la app y obtener la URL exacta

```bash
npx expo start
```

Luego intenta iniciar sesión con Google Drive. En la terminal verás:

```
═══════════════════════════════════════════════════
🔐 INICIANDO AUTENTICACIÓN CON GOOGLE DRIVE
═══════════════════════════════════════════════════

📋 INFORMACIÓN DE CONFIGURACIÓN:

Client ID (Web): 69547892797-le20h0g69kk2s48lvvpjjdfnsg3kh20r.apps.googleusercontent.com
Redirect URI: https://auth.expo.io/@raudy/small-btrucks  <-- ⚠️ COPIA ESTA URL
Scopes: https://www.googleapis.com/auth/drive.file, ...
```

**Copia la URL que aparece en "Redirect URI"** (será algo como `https://auth.expo.io/@raudy/...`)

### 2. Agregar la URL en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials

2. Busca tu **Client ID WEB** (NO el de Android):
   ```
   69547892797-le20h0g69kk2s48lvvpjjdfnsg3kh20r.apps.googleusercontent.com
   ```

3. Click en el **icono del lápiz** (editar) ✏️

4. En **"URIs de redireccionamiento autorizados"**, agrega la URL exacta:
   ```
   https://auth.expo.io/@raudy/small-btrucks
   ```
   
   O si es anónima:
   ```
   https://auth.expo.io/@anonymous/CamionesMobile-[id]
   ```

5. **NO agregues** esquemas personalizados como:
   - ❌ `com.smallbtrucks.app://`
   - ❌ `exp://192.168.1.5:8081`
   - ❌ `smallbtrucks://`

6. Click en **"Guardar"**

7. **Espera 5 minutos** para que los cambios se propaguen

### 3. Probar de nuevo

```bash
npx expo start
```

Abre la app → Pantalla de Backup → "Iniciar sesión con Google"

## 🔍 Verificar que todo esté bien

### En Google Cloud Console

- [ ] Client ID es de tipo **WEB** (no Android)
- [ ] Redirect URI es una URL de Expo (https://auth.expo.io/...)
- [ ] NO hay esquemas personalizados en los redirect URIs
- [ ] Pantalla de consentimiento OAuth completa (nombre, emails, etc.)
- [ ] Tu email está en "Usuarios de prueba"
- [ ] Scopes incluyen: `drive.file` y `drive.appdata`

### En el código

Tu archivo `src/services/googleDriveService.js` ya tiene la configuración correcta:

```javascript
const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true, // ✅ Correcto
});

// ...

const result = await authRequest.promptAsync(discovery, {
  useProxy: true, // ✅ Correcto
  showInRecents: true,
});
```

## 📝 Notas importantes

1. **Solo para desarrollo con Expo Go**: Este método funciona en desarrollo. Para builds de producción (APK/AAB), necesitarás configurar el Client ID de Android.

2. **URLs diferentes**: El Redirect URI puede cambiar si:
   - Publicas la app en Expo (cambia de @anonymous a @raudy)
   - Cambias el nombre del proyecto en app.json
   - Cambias el slug en app.json

3. **Múltiples redirect URIs**: Puedes agregar varias URLs en Google Cloud Console para soportar diferentes entornos.

## ❓ Si sigue sin funcionar

1. **Verifica los logs**: Busca el error exacto en la terminal
2. **Revisa el Redirect URI**: Asegúrate de que coincida exactamente
3. **Espera más tiempo**: A veces Google tarda más de 5 minutos
4. **Limpia caché**: `npx expo start --clear`
5. **Revisa la pantalla de consentimiento**: Debe estar completa

## 🆘 Errores comunes

### "redirect_uri_mismatch"
- El Redirect URI en Google Cloud Console no coincide exactamente
- Solución: Copia la URL exacta de los logs y agrégala

### "access_denied"  
- Tu email no está en "Usuarios de prueba"
- Solución: Agrégalo en la pantalla de consentimiento OAuth

### "invalid_request" (Error 400)
- Pantalla de consentimiento OAuth incompleta
- Solución: Completa todos los campos requeridos (ver SOLUCION_ERROR_400.md)

### "No permite url de esquema personalizado"
- Estás usando un esquema personalizado con Client ID WEB
- Solución: Solo usa URLs https:// de Expo (con useProxy: true)
