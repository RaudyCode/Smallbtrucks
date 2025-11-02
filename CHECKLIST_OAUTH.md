# ✅ CHECKLIST DE CONFIGURACIÓN OAUTH 2.0

## 📋 Usa esta lista para verificar que todo esté correcto

### **1. Preparación (Antes de empezar)**

- [ ] Tengo una cuenta de Google activa
- [ ] Tengo un proyecto en Google Cloud Console
- [ ] Tengo el Client ID Web configurado
- [ ] He habilitado Google Drive API en el proyecto

**Si no has hecho esto, ve a:**
- https://console.cloud.google.com/
- Crea un proyecto nuevo (si no tienes uno)
- Activa Google Drive API
- Crea credenciales OAuth 2.0 (Client ID Web)

---

### **2. Configuración Inicial**

- [ ] Ejecuté `npm start` o `expo start`
- [ ] La app abre correctamente en Expo Go
- [ ] Puedo navegar a la pantalla "Respaldo"
- [ ] Veo el botón "Iniciar sesión con Google"

---

### **3. Obtener Redirect URI**

- [ ] Toqué "Iniciar sesión con Google"
- [ ] Abrí la terminal/consola donde corre Expo
- [ ] Vi el log con formato de líneas "═══════"
- [ ] **COPIÉ** el "Redirect URI" exacto

**Ejemplo del URI:**
```
https://auth.expo.io/@tu-usuario/tu-app
```

**✋ IMPORTANTE:** 
- NO inventes el URI
- NO modifiques el URI
- COPIA exactamente como aparece

---

### **4. Configurar en Google Cloud Console**

#### **4.1. Redirect URI**

- [ ] Fui a: https://console.cloud.google.com/apis/credentials
- [ ] Busqué mi Client ID Web en la lista
- [ ] Hice clic en el ícono de lápiz ✏️ (editar)
- [ ] Vi la sección "URIs de redireccionamiento autorizados"
- [ ] Hice clic en "+ AÑADIR URI"
- [ ] **PEGUÉ** el URI exacto (sin espacios extras)
- [ ] Hice clic en "GUARDAR" (abajo)
- [ ] Vi el mensaje de confirmación
- [ ] **ESPERÉ 5 MINUTOS** ⏱️

**⚠️ COMÚN:** Olvidar esperar 5 minutos. Los cambios NO son instantáneos.

---

#### **4.2. Pantalla de Consentimiento**

- [ ] Fui a: https://console.cloud.google.com/apis/credentials/consent
- [ ] Verifiqué que el estado sea "Testing" (no Production)
- [ ] En "Usuarios de prueba", hice clic en "+ ADD USERS"
- [ ] Agregué mi **email de Google** (el que usaré para iniciar sesión)
- [ ] Hice clic en "GUARDAR"
- [ ] Vi mi email en la lista de usuarios de prueba

**📧 Importante:** El email debe ser EXACTAMENTE el mismo que usarás para iniciar sesión.

---

#### **4.3. Scopes (Opcional - Verificar)**

- [ ] En la pantalla de consentimiento, verifiqué la sección "Scopes"
- [ ] Vi que incluye estos scopes:
  - `https://www.googleapis.com/auth/drive.file`
  - `https://www.googleapis.com/auth/drive.appdata`

**Si no están:**
- Haz clic en "ADD OR REMOVE SCOPES"
- Busca y agrega los scopes de Drive
- Guarda

---

### **5. Probar Autenticación**

- [ ] **ESPERÉ 5 MINUTOS** desde que guardé los cambios
- [ ] Volví a la app en Expo Go
- [ ] Toqué "Iniciar sesión con Google" de nuevo
- [ ] Se abrió un navegador
- [ ] Vi la pantalla de "Elige una cuenta"
- [ ] Seleccioné mi cuenta de Google
- [ ] Vi la pantalla de permisos ("... quiere acceder a tu cuenta de Google")
- [ ] Marqué las casillas de permisos (Drive)
- [ ] Hice clic en "Continuar" o "Allow"
- [ ] El navegador se cerró automáticamente
- [ ] Volví a la app
- [ ] Vi el mensaje: **"✅ Autenticación exitosa"**
- [ ] En la pantalla de respaldo ahora dice: **"✅ Conectado"**

---

### **6. Verificar Funcionamiento**

#### **Test 1: Crear Respaldo**

- [ ] Tengo algunos datos en la app (al menos 1 camión)
- [ ] Toqué "Respaldar ahora"
- [ ] Confirmé la acción
- [ ] Esperé unos segundos
- [ ] Vi el mensaje: **"✅ Respaldo guardado correctamente"**
- [ ] Ahora veo "Último respaldo" con fecha actual

---

#### **Test 2: Restaurar**

- [ ] Borré un camión o destino de la app (para probar)
- [ ] Toqué "Restaurar datos"
- [ ] Leí la advertencia y confirmé
- [ ] Esperé unos segundos
- [ ] Vi el mensaje con contador: **"✅ X camiones, Y destinos, Z viajes"**
- [ ] Los datos volvieron a aparecer

---

### **7. Solución de Problemas**

Si algo no funcionó, verifica:

#### **❌ Error: "redirect_uri_mismatch"**

- [ ] El URI en Google Cloud Console es **exactamente** el de los logs
- [ ] No tiene espacios antes o después
- [ ] Incluye `https://` al inicio
- [ ] Esperé 5 minutos después de guardarlo

#### **❌ Error: "Usuario no autorizado"**

- [ ] Mi email está en "Usuarios de prueba"
- [ ] El email es el mismo que uso para iniciar sesión
- [ ] La app está en modo "Testing"

#### **❌ Error: "invalid_client"**

- [ ] El Client ID en `googleDriveService.js` es correcto
- [ ] Uso el Client ID **Web**, no el de Android
- [ ] Copié el Client ID completo (sin cortar)

#### **❌ "Autenticación cancelada"**

- [ ] Completé TODO el proceso en el navegador
- [ ] Di permisos de acceso a Drive
- [ ] No cerré el navegador antes de tiempo

---

### **8. Verificación Final**

- [ ] Puedo crear respaldos sin errores
- [ ] Puedo restaurar datos sin errores
- [ ] Veo la fecha del último respaldo
- [ ] El botón dice "Conectado" en verde
- [ ] No necesito volver a autenticar después de cerrar/abrir la app

---

## 🎉 ¡TODO LISTO!

Si todos los checks están marcados, tu sistema de autenticación está funcionando perfectamente.

### **Beneficios que ahora tienes:**

✅ Sesión permanente (no necesitas volver a iniciar sesión)
✅ Renovación automática de tokens
✅ Respaldos seguros en tu Google Drive personal
✅ Restauración de datos cuando lo necesites

---

## 📚 Recursos Adicionales

Si necesitas más ayuda:

- **INICIO_RAPIDO_OAUTH.md** - Guía paso a paso con capturas
- **GOOGLE_OAUTH_MEJORADO.md** - Documentación técnica completa
- **test-google-auth.js** - Tests automatizados para verificar

---

## 🆘 Problemas No Resueltos

Si seguiste todos los pasos y aún tienes problemas:

1. **Revisa los logs** en la terminal donde corre Expo
2. **Lee el mensaje de error completo** - suele tener la solución
3. **Verifica en Google Cloud Console:**
   - Estado del proyecto (debe estar activo)
   - Google Drive API está habilitada
   - Client ID correcto
   - Redirect URI correcto
   - Email en usuarios de prueba

4. **Prueba cerrar sesión y volver a autenticar**
   - A veces ayuda "empezar de cero"

5. **Intenta en modo incógnito del navegador**
   - Descarta problemas de caché

---

## 💡 Tips Finales

### **Durante Desarrollo:**
- Los cambios en Google Cloud Console tardan ~5 minutos
- Revisa SIEMPRE los logs de consola
- El navegador debe completar el flujo (no cerrar antes)

### **Para Producción:**
- Considera publicar la app en Google (proceso de verificación)
- Agrega política de privacidad
- Agrega términos de servicio
- Completa toda la información de la pantalla de consentimiento

---

**✨ ¡Disfruta de tu sistema de respaldo automático!**

---

_Última actualización: Octubre 2025_
_Versión de la guía: 1.0_
