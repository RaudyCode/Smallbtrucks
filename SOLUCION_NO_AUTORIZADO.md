# ✅ CHECKLIST: Solución Definitiva "No Autorizado"

## 🎯 PASOS OBLIGATORIOS (Sigue en orden)

### ✅ Paso 1: Verifica que tienes el Client ID Web (NO Android)

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca el Client ID: `69547892797-le20h0g69kk2s48lvvpjjdfnsg3kh20r`
3. **VERIFICA QUE DIGA "Aplicación web"** ⚠️
4. Si dice "Android", ese NO funciona, necesitas uno "Web"

---

### ✅ Paso 2: Ve a la app y presiona "Conectar con Google Drive"

1. Abre la app en tu teléfono/emulador
2. Ve a la pestaña "Respaldo"
3. Presiona "Conectar con Google Drive"
4. **MIRA LA TERMINAL** donde corre `npx expo start`

Verás algo como esto:

```
═══════════════════════════════════════════════════
🔐 INICIANDO AUTENTICACIÓN CON GOOGLE DRIVE
═══════════════════════════════════════════════════

📋 INFORMACIÓN DE CONFIGURACIÓN:

Client ID (Web): 69547892797-le20h0g69kk2s48lvvpjjdfnsg3kh20r...
Redirect URI: exp://192.168.18.146:8081
                     ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
              COPIA ESTE URI EXACTO
```

---

### ✅ Paso 3: Agrega el Redirect URI en Google Cloud Console

1. **Copia el Redirect URI** de la terminal (ejemplo: `exp://192.168.18.146:8081`)
2. Ve a: https://console.cloud.google.com/apis/credentials
3. Click en el **Client ID Web** (`69547892797-le20h0g69kk2s48lvvpjjdfnsg3kh20r`)
4. Click en el **icono de lápiz** ✏️ para editar
5. Baja hasta **"URIs de redireccionamiento autorizados"**
6. Click en **"+ AGREGAR URI"**
7. **Pega el Redirect URI** exacto de la terminal
8. Agrega TAMBIÉN estos otros URIs (por si acaso):
   ```
   http://localhost:8081
   com.smallbtrucks.app:/oauthredirect
   com.smallbtrucks.app:/
   ```
9. Click en **"GUARDAR"** al final de la página

---

### ✅ Paso 4: Verifica que tu email esté en "Usuarios de prueba"

1. Ve a: https://console.cloud.google.com/apis/credentials/consent
2. Busca la sección **"Usuarios de prueba"**
3. Verifica que tu email esté en la lista
4. Si NO está, click en **"+ AGREGAR USUARIOS"**
5. Agrega tu email
6. Click en **"GUARDAR"**

---

### ✅ Paso 5: Verifica los Scopes

1. En la misma página: https://console.cloud.google.com/apis/credentials/consent
2. Click en **"EDITAR APLICACIÓN"**
3. En la sección **"Ámbitos"**, verifica que estén:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive.appdata`
4. Si no están, agrégalos:
   - Click en **"AGREGAR O QUITAR ÁMBITOS"**
   - Busca "drive.file" y "drive.appdata"
   - Selecciónalos
   - Click en **"ACTUALIZAR"**
5. Click en **"GUARDAR Y CONTINUAR"**

---

### ✅ Paso 6: Espera 5 minutos

⏱️ Google necesita propagar los cambios. **Espera 5 minutos reales.**

---

### ✅ Paso 7: Reinicia la app

```bash
# En la terminal donde corre Expo, presiona:
Ctrl + C

# Luego ejecuta:
npx expo start --clear
```

---

### ✅ Paso 8: Intenta de nuevo

1. Abre la app
2. Ve a "Respaldo"
3. Presiona "Conectar con Google Drive"
4. Deberías ver la pantalla de Google
5. Selecciona tu cuenta
6. Acepta los permisos
7. ¡Listo! ✅

---

## 🔴 SI SIGUE SIN FUNCIONAR:

### Revisa los logs en la terminal

Busca líneas que digan:

- `❌ ERROR EN AUTENTICACIÓN: ...`
- `🔴 ERROR: Redirect URI no coincide`
- `🔴 ERROR: Acceso denegado`

**Copia el error completo y compártelo.**

---

## 🐛 ERRORES COMUNES:

### Error: "redirect_uri_mismatch"
**Causa:** El URI en Google Cloud Console NO coincide exactamente  
**Solución:** Copia el URI EXACTO de la terminal (incluye el puerto y protocolo)

### Error: "access_denied" o "unauthorized_client"
**Causa:** Tu email no está en usuarios de prueba O el Client ID es incorrecto  
**Solución:** Agrega tu email en usuarios de prueba

### Error: "invalid_client"
**Causa:** El Client ID en el código no coincide con el de Google Cloud Console  
**Solución:** Verifica que sea el Client ID **Web** correcto

### Error: El navegador se cierra inmediatamente
**Causa:** Redirect URI no configurado  
**Solución:** Sigue el Paso 3 de arriba

---

## 📋 VERIFICACIÓN FINAL:

Antes de intentar de nuevo, verifica:

- [ ] Tienes un Client ID de tipo **"Aplicación web"** (NO Android)
- [ ] El Client ID es: `69547892797-le20h0g69kk2s48lvvpjjdfnsg3kh20r`
- [ ] Agregaste el Redirect URI **EXACTO** que aparece en la terminal
- [ ] Tu email está en "Usuarios de prueba"
- [ ] Los scopes `drive.file` y `drive.appdata` están configurados
- [ ] Esperaste 5 minutos después de guardar
- [ ] Reiniciaste Expo con `npx expo start --clear`

---

## 🎯 RESULTADO ESPERADO:

Cuando funcione correctamente, verás en la terminal:

```
✅ TOKEN GUARDADO EXITOSAMENTE
⏱️  Expira en: 3600 segundos
```

Y en la app verás:

```
✅ Conectado con Google Drive
📧 tu-email@gmail.com
```

---

## 📞 ¿Necesitas ayuda?

Si después de seguir TODOS los pasos sigue sin funcionar:

1. Toma captura de pantalla de la terminal con el error
2. Toma captura de la configuración del Client ID en Google Cloud Console
3. Comparte ambas para ayudarte mejor

---

**💡 TIP:** El 99% de los errores "No autorizado" se solucionan configurando correctamente el Redirect URI. Asegúrate de copiarlo EXACTAMENTE como aparece en la terminal.
