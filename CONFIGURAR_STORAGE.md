# 🔥 Configuración de Firebase Storage - Guía Rápida

## ⚠️ IMPORTANTE: Habilitar Firebase Storage

Si ves el error `storage/unknown`, significa que Firebase Storage no está habilitado en tu proyecto.

### 📋 Pasos para habilitar Storage:

1. **Ve a Firebase Console**
   - https://console.firebase.google.com/
   - Selecciona tu proyecto: `smallbtrucks-a2673`

2. **Navega a Storage**
   - En el menú lateral izquierdo
   - Click en **"Build"** → **"Storage"**

3. **Inicializar Storage**
   - Click en el botón **"Get Started"** (Comenzar)
   - Se abrirá un diálogo

4. **Configurar Reglas de Seguridad**
   
   Para **desarrollo** (recomendado para empezar):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   
   ⚠️ **Esto permite que cualquiera lea/escriba. Solo para pruebas.**
   
   Para **producción** (más seguro):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /backups/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

5. **Seleccionar Ubicación**
   -Elige la misma región que tu Firestore
   - Recomendado para Latinoamérica: `southamerica-east1` (São Paulo)
   - También está `us-central1` (más rápido para pruebas)

6. **Click en "Done"**
   - Storage estará listo en unos segundos

## ✅ Verificar que Storage esté funcionando

1. En Firebase Console, ve a **Storage**
2. Deberías ver una pantalla con "Files" (Archivos)
3. Si ves esto, ¡Storage está habilitado! 🎉

## 🔧 Actualizar Reglas de Storage (si ya lo habilitaste)

Si Storage ya está habilitado pero sigues teniendo errores:

1. En Firebase Console → Storage
2. Click en la pestaña **"Rules"**
3. Reemplaza el contenido con las reglas de desarrollo (arriba)
4. Click en **"Publish"**

## 📱 Probar en tu App

1. Reinicia tu app: `npx expo start`
2. Ve a la pestaña **"Respaldo"**
3. Click en **"Crear Respaldo en la Nube"**
4. Deberías ver logs en la consola:
   ```
   🔄 Iniciando creación de respaldo...
   📂 Ruta de la base de datos: ...
   ✅ Archivo encontrado, tamaño: xxx bytes
   ✅ Blob creado...
   ⬆️ Subiendo a Firebase Storage...
   ✅ Archivo subido exitosamente
   🎉 Respaldo creado exitosamente
   ```

5. Verifica en Firebase Console → Storage
   - Deberías ver una carpeta `backups/default_user/backup_xxx.db`

## 🐛 Solución de Problemas

### Error: `storage/unknown`
**Causa**: Storage no está habilitado
**Solución**: Sigue los pasos 1-6 arriba

### Error: `storage/unauthorized`
**Causa**: Las reglas de seguridad bloquean el acceso
**Solución**: Actualiza las reglas a modo desarrollo (paso 4)

### Error: `storage/invalid-url`
**Causa**: La URL del bucket es incorrecta
**Solución**: Verifica que `storageBucket` en `firebaseConfig.js` sea correcto:
```javascript
storageBucket: "smallbtrucks-a2673.appspot.com"
```

### Error: `Cannot read property 'blob' of undefined`
**Causa**: El archivo de la base de datos no existe
**Solución**: Asegúrate de que la app tenga datos (crea al menos un camión o viaje)

## 📊 Límites del Plan Gratuito (Spark)

- **Almacenamiento**: 5 GB
- **Descargas**: 1 GB/día
- **Subidas**: 1 GB/día
- **Operaciones**: 50,000/día (read) + 20,000/día (write)

Para una base de datos SQLite (~100 KB):
- Puedes tener **~50,000 respaldos** antes de llenar los 5 GB
- Puedes crear **~200 respaldos al día** antes de llegar al límite

## 🔐 Seguridad Recomendada para Producción

Una vez que todo funcione, actualiza las reglas a:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Solo el usuario autenticado puede acceder a sus propios respaldos
    match /backups/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Limitar tamaño de archivos a 10 MB
    match /backups/{userId}/{fileName} {
      allow write: if request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

⚠️ **Nota**: Esto requiere implementar Firebase Authentication en tu app.

## 📚 Referencias

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Security Rules](https://firebase.google.com/docs/storage/security)
- [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/)
