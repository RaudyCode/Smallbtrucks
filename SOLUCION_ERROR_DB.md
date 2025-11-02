# ⚠️ ERROR: Base de Datos Corrupta - SOLUCIÓN RÁPIDA

## 🚨 Error Actual

```
NullPointerException: java.lang.NullPointerException
Call to function 'NativeDatabase.prepareAsync' has been rejected
```

Este error significa que la base de datos está en un estado incompatible y necesita ser recreada.

---

## ✅ SOLUCIÓN (3 minutos)

### **Paso 1: Borrar los Datos de la App**

#### **En Android:**
1. Ve a **Configuración** de tu dispositivo
2. Busca **Apps** o **Aplicaciones**
3. Busca **Expo Go**
4. Toca en **Almacenamiento**
5. Toca **Borrar datos** (NO "Borrar caché", sino "Borrar datos")
6. Confirma

#### **En iOS:**
1. Mantén presionada la app **Expo Go**
2. Toca **Eliminar app**
3. Confirma la eliminación
4. Ve a la App Store
5. Reinstala **Expo Go**

---

### **Paso 2: Reiniciar Expo**

En tu terminal donde corre `npm start` o `expo start`:

```bash
# Detén el servidor (Ctrl+C)
# Luego ejecuta:
npm start --clear

# O con Expo CLI:
expo start --clear
```

---

### **Paso 3: Abrir la App de Nuevo**

1. Abre **Expo Go**
2. Escanea el código QR de nuevo
3. La app iniciará con la base de datos nueva y limpia

---

## 🎯 ¿Por Qué Pasó Esto?

Al agregar la columna `lugar_inicio` a la tabla `Viaje`, la base de datos existente entró en conflicto con la nueva estructura. Esto es común durante el desarrollo cuando se modifican las tablas.

---

## ✅ Verificar que Funcionó

Después de seguir los pasos, deberías ver en la consola:

```
Base de datos inicializada correctamente
Tabla Camion creada
Tabla Destino creada
Tabla Viaje creada
Tabla EntregaViaje creada
✅ Migraciones completadas exitosamente
```

Y **NO** deberías ver más errores de `NullPointerException`.

---

## 🔄 Alternativa: Usar el Script de Reset (Avanzado)

Si prefieres no borrar los datos de Expo Go:

1. **Crea un botón temporal en HomeScreen.js:**

```javascript
import { resetDatabase } from '../reset-database';

// Dentro del componente:
<Button 
  title="🔄 Reset DB (PELIGRO)" 
  onPress={async () => {
    Alert.alert(
      '⚠️ Advertencia',
      '¿Eliminar TODA la base de datos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, eliminar',
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            Alert.alert('✅ Listo', 'Cierra y abre la app de nuevo');
          }
        }
      ]
    );
  }}
/>
```

2. **Presiona el botón**
3. **Cierra la app completamente** (no solo minimizar)
4. **Abre la app de nuevo**

---

## 📋 Checklist de Solución

- [ ] Borré los datos de Expo Go (o eliminé/reinstalé la app)
- [ ] Detuve el servidor de Expo (Ctrl+C)
- [ ] Reinicié con `npm start --clear`
- [ ] Abrí la app de nuevo en Expo Go
- [ ] Veo los mensajes de "Base de datos inicializada correctamente"
- [ ] NO veo errores de NullPointerException
- [ ] Puedo navegar por la app sin errores

---

## 🆘 Si Sigue sin Funcionar

1. **Verifica que borraste los DATOS, no solo la CACHÉ:**
   - En Android: debe decir "Borrar datos" (no "Borrar caché")
   - En iOS: debes desinstalar y reinstalar Expo Go

2. **Verifica que usaste `--clear`:**
   ```bash
   npm start --clear
   ```

3. **Intenta con un dispositivo diferente o emulador:**
   - A veces el problema es específico del dispositivo

4. **Última opción - Reinstalar dependencias:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   npm start --clear
   ```

---

## 💡 Prevenir Este Error en el Futuro

Cuando agregues nuevas columnas a la base de datos:

1. **Durante desarrollo:** Simplemente borra los datos de Expo Go
2. **En producción:** Usa migraciones cuidadosas (las que agregamos funcionan bien para nuevas instalaciones)

La app ahora tiene:
- ✅ Migración automática de columnas
- ✅ Manejo de errores robusto
- ✅ Compatibilidad con bases nuevas y existentes

Pero en desarrollo, lo más rápido es siempre **borrar datos y empezar limpio**.

---

## ✅ Resumen: 3 Pasos Rápidos

```
1. Borrar datos de Expo Go (Configuración → Apps → Expo Go → Almacenamiento → Borrar datos)
2. npm start --clear
3. Abrir la app de nuevo
```

**¡Listo en 3 minutos!** 🚀

---

_Si necesitas ayuda adicional, revisa los logs de la consola y busca el primer error que aparezca._
