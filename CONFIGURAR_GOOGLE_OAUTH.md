# 🔧 SOLUCIÓN: Error "No autorizado" en Google Drive

## ⚠️ ERROR ACTUAL: "Error 400: invalid_request"

Si ves este error:
```
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy
Error 400: invalid_request
```

**Causa:** La pantalla de consentimiento OAuth está incompleta.

**Solución:** Sigue la sección "Completar Pantalla de Consentimiento" más abajo ⬇️

---

## ✅ SOLUCIÓN PASO A PASO

### 1️⃣ Completar Pantalla de Consentimiento (OBLIGATORIO)

🔗 Ve a: [https://console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent)

Click en **"EDITAR APLICACIÓN"** y completa:

#### **Página 1 - Información de la app:**

| Campo | Valor | ¿Obligatorio? |
|-------|-------|---------------|
| Nombre de la aplicación | `SmallBtrucks` | ✅ SÍ |
| Correo de soporte al usuario | `tu-email@gmail.com` | ✅ SÍ |
| Logo de la aplicación | (opcional) | ❌ NO |
| Dominios autorizados | (vacío en modo prueba) | ❌ NO |
| **Página de inicio** | `https://github.com/RaudyCode/Smallbtrucks` | ✅ SÍ |
| **Política de privacidad** | `https://github.com/RaudyCode/Smallbtrucks/blob/main/README.md` | ✅ SÍ |
| **Términos del servicio** | `https://github.com/RaudyCode/Smallbtrucks/blob/main/README.md` | ✅ SÍ |
| Correo del desarrollador | `tu-email@gmail.com` | ✅ SÍ |

> 💡 **NOTA**: Las URLs pueden ser de GitHub. Google NO las verifica en modo prueba, pero DEBEN existir.

Click en **"GUARDAR Y CONTINUAR"**

#### **Página 2 - Ámbitos (Scopes):**

1. Click en **"AGREGAR O QUITAR ÁMBITOS"**
2. Busca y selecciona:
   - ✅ `.../auth/drive.file`
   - ✅ `.../auth/drive.appdata`
3. Click en **"ACTUALIZAR"**
4. Click en **"GUARDAR Y CONTINUAR"**

#### **Página 3 - Usuarios de prueba:**

1. Click en **"+ AGREGAR USUARIOS"**
2. Agrega tu email: `tu-email@gmail.com`
3. Click en **"AGREGAR"**
4. Click en **"GUARDAR Y CONTINUAR"**

#### **Página 4 - Resumen:**

1. Revisa que todo esté correcto
2. Click en **"VOLVER AL PANEL"**

---

## ⚠️ PROBLEMA ANTERIOR
Google rechaza la autenticación porque el **Redirect URI** no está configurado correctamente en Google Cloud Console.

---

## ✅ SOLUCIÓN PASO A PASO

### 1️⃣ Ve a Google Cloud Console
Abre: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

### 2️⃣ Encuentra tu Client ID Web
Busca el Client ID: `69547892797-le20h0g69kk2s48lvvpjjdfnsg3kh20r.apps.googleusercontent.com`

Click en el **icono de lápiz** (editar) ✏️

### 3️⃣ Agrega TODOS estos Redirect URIs

En la sección **"URIs de redireccionamiento autorizados"**, agrega **UNO POR UNO** estos URIs:

```
exp://192.168.18.146:8081
```

```
http://localhost:8081
```

```
com.smallbtrucks.app:/oauthredirect
```

```
com.smallbtrucks.app:/
```

```
exp://localhost:8081
```

### 4️⃣ Guarda los cambios
Click en **"GUARDAR"** en la parte inferior.

### 5️⃣ Espera 5 minutos
Google necesita propagar los cambios. Espera unos minutos antes de probar de nuevo.

---

## 🎯 VERIFICACIÓN

Después de agregar los URIs:

1. **Cierra completamente la app** (no solo minimizar)
2. **Reinicia Expo**:
   ```bash
   # Presiona Ctrl+C en la terminal
   # Luego ejecuta:
   npx expo start --clear
   ```
3. **Abre la app de nuevo**
4. Ve a la pestaña **"Respaldo"**
5. Presiona **"Conectar con Google Drive"**

---

## 📋 CHECKLIST - Verifica que tengas todo:

- [ ] Client ID Web creado (NO Android)
- [ ] Los 5 redirect URIs agregados en Google Cloud Console
- [ ] Cambios guardados en Google Cloud Console
- [ ] Esperaste 5 minutos después de guardar
- [ ] Tu email está en "Usuarios de prueba"
- [ ] Drive API está habilitada
- [ ] Los ámbitos están configurados:
  - `https://www.googleapis.com/auth/drive.file`
  - `https://www.googleapis.com/auth/drive.appdata`

---

## 🐛 Si sigue sin funcionar:

### Opción 1: Verifica el redirect URI real
1. Ve a la pestaña "Respaldo" en la app
2. Presiona "Conectar con Google Drive"
3. Mira los logs en la terminal de Expo
4. Busca la línea que dice: `Redirect URI: ...`
5. Copia ese URI exacto y agrégalo en Google Cloud Console

### Opción 2: Revisa que sea Client ID Web
1. En Google Cloud Console
2. El tipo debe decir **"Aplicación web"**
3. Si dice "Android", crea uno nuevo de tipo "Web"

### Opción 3: Verifica usuarios de prueba
1. Ve a: [https://console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent)
2. En la sección "Usuarios de prueba"
3. Asegúrate de que tu email esté agregado
4. Click en "Guardar y continuar"

---

## 📞 Notas importantes:

- **NO uses el Client ID de Android** (`69547892797-d8e60s1s89hsuflkc6fvgntq64b7v6bt`) - ese NO funciona con Expo
- **USA el Client ID Web** (`69547892797-le20h0g69kk2s48lvvpjjdfnsg3kh20r`) - ese sí funciona
- Los redirect URIs deben estar exactamente como se muestran arriba (sin espacios extras)
- Google puede tardar hasta 5 minutos en aplicar los cambios

---

## ✅ ¿Listo?

Después de seguir todos los pasos:
1. Reinicia la app
2. Intenta conectar con Google Drive
3. Deberías ver la pantalla de consentimiento de Google
4. Acepta los permisos
5. ¡Listo! Ya estás autenticado

---

**Si después de esto sigue sin funcionar, comparte los logs de la terminal para ayudarte mejor.** 🚀
