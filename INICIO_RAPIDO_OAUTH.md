# 🚀 INICIO RÁPIDO: Autenticación OAuth 2.0 Mejorada

## ✅ Mejoras Implementadas

### **1. Flujo de Autenticación más Seguro**
- ✅ Cambió de **Implicit Flow** a **Authorization Code Flow con PKCE**
- ✅ Ahora obtiene **refresh token** para renovación automática
- ✅ Sesión persistente sin necesidad de reautenticar constantemente

### **2. Gestión Automática de Tokens**
- ✅ Detección automática cuando el token está por expirar
- ✅ Renovación automática usando refresh token
- ✅ Verificación antes de cada petición a Google Drive

### **3. Manejo Mejorado de Errores**
- ✅ Mensajes claros y específicos para cada tipo de error
- ✅ Instrucciones detalladas en logs de consola
- ✅ Guías en la UI para solucionar problemas comunes

---

## 📝 Pasos para Usar

### **Paso 1: Ejecutar la App** 

```bash
npm start
# o
expo start
```

### **Paso 2: Ir a Pantalla de Respaldo**

En la app, navega a la pantalla **"Respaldo y Restauración"**

### **Paso 3: Intentar Iniciar Sesión**

1. Toca el botón **"Iniciar sesión con Google"**
2. Se abrirá la consola con información importante
3. **COPIA** el "Redirect URI" que aparece en los logs

**Ejemplo del log:**
```
═══════════════════════════════════════════════════════════════
🚀 INICIANDO AUTENTICACIÓN CON GOOGLE DRIVE
═══════════════════════════════════════════════════════════════

📋 CONFIGURACIÓN ACTUAL:
  • Client ID: 69547892797-le20h0g69kk2s48lvvpjjdfnsg3kh20r...
  • Redirect URI: https://auth.expo.io/@raudy/smallbtrucks  ← ¡COPIA ESTO!
  • Scopes: drive.file, drive.appdata
```

### **Paso 4: Configurar Google Cloud Console**

#### **4.1. Agregar Redirect URI**

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca tu **Client ID Web** (termina en ...apps.googleusercontent.com)
3. Haz clic en el ícono de **lápiz ✏️** (editar)
4. En **"URIs de redireccionamiento autorizados"**, haz clic en **"+ AÑADIR URI"**
5. **PEGA** el Redirect URI que copiaste en el Paso 3
6. Haz clic en **"GUARDAR"**
7. ⏱️ **ESPERA 5 MINUTOS**

#### **4.2. Agregar Usuario de Prueba**

1. Ve a: https://console.cloud.google.com/apis/credentials/consent
2. En **"Usuarios de prueba"**, haz clic en **"+ ADD USERS"**
3. Agrega tu **email de Google** (con el que iniciarás sesión)
4. Haz clic en **"GUARDAR"**

### **Paso 5: Volver a Intentar**

1. Espera 5 minutos después de configurar
2. En la app, toca **"Iniciar sesión con Google"** de nuevo
3. Se abrirá un navegador para iniciar sesión
4. **Selecciona tu cuenta de Google**
5. **Acepta los permisos** que solicita la app
6. Deberías ver el mensaje: **"✅ Autenticación exitosa"**

---

## 🎯 Verificar que Funciona

### **Test 1: Estado de Autenticación**

Una vez autenticado, deberías ver en la pantalla:

```
┌─────────────────────────────────────┐
│ Google Drive                        │
│ ✅ Conectado                        │
│ [ Desconectar ]                     │
└─────────────────────────────────────┘
```

### **Test 2: Crear Respaldo**

1. Toca **"Respaldar ahora"**
2. Confirma la acción
3. Espera unos segundos
4. Deberías ver: **"✅ Respaldo guardado correctamente en Google Drive"**

### **Test 3: Verificar en Google Drive**

Los respaldos se guardan en una carpeta especial llamada **"appDataFolder"** que solo tu app puede acceder. No la verás en tu Drive normal, pero puedes verificar que funciona:

1. Crea un respaldo
2. Elimina algunos datos de la app
3. Usa **"Restaurar datos"**
4. Los datos deberían volver

---

## ❓ Problemas Comunes

### **Error: "redirect_uri_mismatch"**

**Causa:** El Redirect URI no está agregado en Google Cloud Console

**Solución:**
1. Copia el URI exacto de los logs de consola
2. Ve a Google Cloud Console > Credenciales
3. Edita tu Client ID Web
4. Agrega el URI
5. Espera 5 minutos
6. Intenta de nuevo

---

### **Error: "Usuario no autorizado" o "access_denied"**

**Causa:** Tu email no está en la lista de usuarios de prueba

**Solución:**
1. Ve a: Google Cloud Console > Pantalla de consentimiento
2. En "Usuarios de prueba", agrega tu email
3. Intenta de nuevo

---

### **Error: "Sesión expirada"**

**No debería pasar con el nuevo sistema**, pero si pasa:

**Solución:**
1. Cierra sesión en la app
2. Vuelve a iniciar sesión
3. El sistema obtendrá un nuevo refresh token

---

## 📚 Documentación Detallada

- **GOOGLE_OAUTH_MEJORADO.md** - Guía completa con explicaciones técnicas
- **test-google-auth.js** - Suite de tests para verificar el servicio
- **CONFIGURAR_GOOGLE_OAUTH.md** - Guía original de configuración

---

## 🧪 Testing (Opcional)

Si eres desarrollador y quieres probar el servicio:

```javascript
// Importa los tests
import { runAllTests, testLogin } from './test-google-auth';

// Ejecuta todos los tests
await runAllTests();

// O prueba solo el login
await testLogin();
```

---

## 🎉 ¡Listo!

Una vez configurado correctamente:
- ✅ La sesión se mantiene activa automáticamente
- ✅ El token se renueva solo cuando es necesario
- ✅ Puedes respaldar y restaurar sin problemas
- ✅ Los errores se manejan de forma clara

Si sigues teniendo problemas, revisa los **logs de la consola** - el servicio te dará instrucciones específicas para cada error.

---

## 🆘 ¿Necesitas Ayuda?

1. **Revisa los logs** - El servicio muestra instrucciones detalladas
2. **Lee GOOGLE_OAUTH_MEJORADO.md** - Guía completa con todas las soluciones
3. **Verifica la configuración** en Google Cloud Console
4. **Espera 5 minutos** después de cada cambio en Google Console

---

**🎊 ¡Disfruta de respaldos automáticos y seguros con Google Drive!**
