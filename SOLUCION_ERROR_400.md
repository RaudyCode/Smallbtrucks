# 🔴 Solución: Error 400 - OAuth 2.0 Policy Violation

## ❌ Error actual:
```
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy
Error 400: invalid_request
```

## 🎯 Causas comunes:

1. ✅ Pantalla de consentimiento incompleta
2. ✅ Falta información obligatoria
3. ✅ El app está en modo prueba pero mal configurado

---

## ✅ SOLUCIÓN PASO A PASO:

### **Paso 1: Completar Pantalla de Consentimiento**

1. Ve a: https://console.cloud.google.com/apis/credentials/consent

2. Click en **"EDITAR APLICACIÓN"**

3. **Página 1 - Información de la app:**
   
   Completa TODOS estos campos:
   
   - ✅ **Nombre de la aplicación**: `SmallBtrucks`
   - ✅ **Correo de soporte al usuario**: `tu-email@gmail.com`
   - ✅ **Logo de la aplicación**: (OPCIONAL - puedes dejarlo vacío por ahora)
   - ⚠️ **Dominios autorizados**: (Déjalo vacío en modo prueba)
   - ✅ **Página de inicio de la aplicación**: `https://github.com/RaudyCode/Smallbtrucks` (o cualquier URL)
   - ✅ **Política de privacidad**: `https://github.com/RaudyCode/Smallbtrucks/privacy` (o cualquier URL)
   - ✅ **Términos del servicio**: `https://github.com/RaudyCode/Smallbtrucks/terms` (o cualquier URL)
   - ✅ **Correo del desarrollador**: `tu-email@gmail.com`
   
   > 💡 **IMPORTANTE**: En modo prueba, Google NO verifica las URLs, pero DEBEN existir. Puedes usar URLs de GitHub.

4. Click en **"GUARDAR Y CONTINUAR"**

---

### **Paso 2: Configurar Ámbitos (Scopes)**

1. En la página de "Ámbitos":

2. Click en **"AGREGAR O QUITAR ÁMBITOS"**

3. **Busca y selecciona estos ámbitos:**
   
   - ✅ `../auth/drive.file` → Acceso a archivos creados por la app
   - ✅ `../auth/drive.appdata` → Acceso a carpeta de datos de la app

4. Click en **"ACTUALIZAR"**

5. Click en **"GUARDAR Y CONTINUAR"**

---

### **Paso 3: Agregar Usuarios de Prueba**

1. En la página "Usuarios de prueba":

2. Click en **"+ AGREGAR USUARIOS"**

3. **Agrega tu email** (el que usarás para probar): `tu-email@gmail.com`

4. Click en **"AGREGAR"**

5. Click en **"GUARDAR Y CONTINUAR"**

---

### **Paso 4: Revisar y Confirmar**

1. Revisa que todo esté correcto

2. Click en **"VOLVER AL PANEL"**

3. **Verifica el estado**: Debe decir **"Prueba"** o **"Testing"**

---

### **Paso 5: Verificar Client ID Web**

1. Ve a: https://console.cloud.google.com/apis/credentials

2. Verifica que tu Client ID Web tenga estos redirect URIs:

   ```
   https://auth.expo.io/@raudy/small-btrucks
   https://auth.expo.io/@anonymous/small-btrucks
   ```

3. Si no están, agrégalos y guarda

---

## 🔧 Configuración Rápida (Valores sugeridos):

Si quieres copiar y pegar:

| Campo | Valor |
|-------|-------|
| Nombre de la app | SmallBtrucks |
| Tipo de usuario | Externo |
| Estado | Prueba (Testing) |
| Correo de soporte | tu-email@gmail.com |
| Correo del desarrollador | tu-email@gmail.com |
| Página de inicio | https://github.com/RaudyCode/Smallbtrucks |
| Política de privacidad | https://github.com/RaudyCode/Smallbtrucks/blob/main/README.md |
| Términos del servicio | https://github.com/RaudyCode/Smallbtrucks/blob/main/README.md |
| Scopes | drive.file, drive.appdata |
| Usuarios de prueba | tu-email@gmail.com |

---

## 📋 Checklist Final:

Antes de intentar de nuevo, verifica:

- [ ] Nombre de la aplicación está completo
- [ ] Correo de soporte agregado
- [ ] Correo del desarrollador agregado
- [ ] Página de inicio agregada (puede ser cualquier URL)
- [ ] Política de privacidad agregada (puede ser cualquier URL)
- [ ] Términos de servicio agregados (puede ser cualquier URL)
- [ ] Scopes `drive.file` y `drive.appdata` configurados
- [ ] Tu email está en "Usuarios de prueba"
- [ ] Estado es "Prueba" o "Testing" (NO "En producción")
- [ ] Client ID Web tiene los redirect URIs correctos

---

## 🚀 Después de Configurar:

1. **Espera 5 minutos** para que Google propague los cambios

2. **Reinicia la app:**
   ```bash
   npx expo start --clear
   ```

3. **Intenta conectar de nuevo**

4. Deberías ver la pantalla de consentimiento de Google con:
   - Logo (si lo agregaste)
   - Nombre "SmallBtrucks"
   - Lista de permisos (acceso a Drive)

5. **Acepta los permisos** y listo ✅

---

## 🐛 Si sigue fallando:

### Error: "Access blocked: This app's request is invalid"

**Solución:**
- Verifica que TODAS las URLs (página de inicio, privacidad, términos) estén completas
- Aunque Google no las verifica en modo prueba, DEBEN existir

### Error: "invalid_request"

**Solución:**
- Asegúrate de que el redirect URI en Google Cloud Console sea EXACTAMENTE:
  ```
  https://auth.expo.io/@raudy/small-btrucks
  ```
- Mira la terminal de Expo para ver el redirect URI exacto que está usando tu app

### Error: "unauthorized_client"

**Solución:**
- Verifica que estés usando el **Client ID Web** (NO el de Android)
- El Client ID debe ser: `69547892797-le20h0g69kk2s48lvvpjjdfnsg3kh20r`

---

## 💡 IMPORTANTE:

- **En modo "Prueba"**, solo los emails en "Usuarios de prueba" pueden iniciar sesión
- **Las URLs** pueden ser de GitHub, no necesitan ser páginas reales
- **Los scopes** deben ser exactamente `drive.file` y `drive.appdata`
- **El Client ID** debe ser de tipo "Web", NO "Android"

---

## ✅ Configuración Mínima que Funciona:

```
✅ Nombre: SmallBtrucks
✅ Correo soporte: tu-email@gmail.com
✅ Correo dev: tu-email@gmail.com
✅ Página inicio: https://github.com/RaudyCode/Smallbtrucks
✅ Privacidad: https://github.com/RaudyCode/Smallbtrucks/blob/main/README.md
✅ Términos: https://github.com/RaudyCode/Smallbtrucks/blob/main/README.md
✅ Scopes: drive.file, drive.appdata
✅ Usuario prueba: tu-email@gmail.com
✅ Estado: Testing
✅ Redirect URI: https://auth.expo.io/@raudy/small-btrucks
```

---

**Sigue estos pasos y el error 400 desaparecerá.** 🎯
