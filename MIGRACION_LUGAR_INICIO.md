# 🔄 Migración: Campo "Lugar de Inicio"

## ✅ Cambios Realizados

Se agregó el campo **"lugar_inicio"** a la tabla `Viaje` para almacenar el punto de partida de cada viaje.

---

## 📋 Archivos Modificados

### **1. Base de Datos** (`src/database/database.js`)
- ✅ Agregada columna `lugar_inicio TEXT` a la tabla `Viaje`
- ✅ Migración automática para bases de datos existentes

### **2. Servicio de Viajes** (`src/database/viajeService.js`)
- ✅ Método `create()` ahora acepta parámetro `lugar_inicio`
- ✅ Método `update()` actualizado para incluir `lugar_inicio`

### **3. Pantallas**
- ✅ `AddViajeScreen.js` - Campo obligatorio para capturar lugar de inicio
- ✅ `CamionDetailScreen.js` - Muestra lugar de inicio en tarjetas de viaje
- ✅ `ViajesProgramadosScreen.js` - Muestra lugar de inicio en lista de viajes

---

## 🚀 ¿Qué Hacer Ahora?

### **Opción A: App Nueva o Sin Datos** ✨
Si apenas estás empezando o no tienes datos importantes:

1. **Borra los datos de Expo Go:**
   - Android: Configuración → Apps → Expo Go → Almacenamiento → Borrar datos
   - iOS: Mantén presionada la app Expo Go → Eliminar app → Reinstalar

2. **Reinicia la app**
   ```bash
   npm start
   ```

3. ¡Listo! La base de datos se creará con la nueva columna automáticamente.

---

### **Opción B: Tienes Datos Existentes** 💾
Si ya tienes viajes registrados y quieres mantenerlos:

1. **La migración es automática** 🎉
   - Al abrir la app, se ejecutará automáticamente
   - La columna `lugar_inicio` se agregará sin perder datos
   - Los viajes existentes tendrán `lugar_inicio` como `null` (vacío)

2. **Verifica en la consola:**
   ```
   ✅ Migración: Agregada columna lugar_inicio a la tabla Viaje
   ```

3. **Los viajes nuevos** requerirán el campo "Lugar de Inicio"

4. **Los viajes antiguos** se mostrarán sin lugar de inicio (es opcional en la visualización)

---

## 📱 Uso del Nuevo Campo

### **Al Crear un Viaje:**
```
┌──────────────────────────────────┐
│ Seleccionar Camión               │
├──────────────────────────────────┤
│ Seleccionar Destino              │
├──────────────────────────────────┤
│ Cantidad de Viajes               │
├──────────────────────────────────┤
│ Lugar de Inicio del Viaje ⭐     │
│ [Ej: Oficina principal]          │
├──────────────────────────────────┤
│ Fecha Programada                 │
└──────────────────────────────────┘
```

### **Al Ver un Viaje:**
```
📍 Destino: CEMEX
📅 Fecha: 2025-10-27
🎯 Inicio: Oficina principal    ← NUEVO
Progreso: 3/5 viajes (60%)
```

---

## 🔍 Verificar la Migración

Si quieres confirmar que la migración funcionó:

1. **Abre la consola de Expo**
2. **Busca este mensaje:**
   ```
   ✅ Migración: Agregada columna lugar_inicio a la tabla Viaje
   ```

3. **Si no aparece:**
   - La columna ya existía
   - O es una instalación nueva (ya viene con la columna)

---

## ⚠️ Notas Importantes

### **Retrocompatibilidad:**
- ✅ Los viajes antiguos siguen funcionando
- ✅ El campo es opcional al visualizar (solo se muestra si existe)
- ✅ Los nuevos viajes REQUIEREN el campo

### **Validación:**
- ❌ No se puede crear un viaje sin lugar de inicio
- ✅ El campo se valida antes de guardar
- ✅ Se muestra mensaje de error si está vacío

---

## 🎯 Estructura de la Tabla `Viaje`

```sql
CREATE TABLE Viaje (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  camion_id INTEGER,
  destino_id INTEGER,
  cantidad_viajes INTEGER NOT NULL,
  viajes_completados INTEGER DEFAULT 0,
  fecha_programada TEXT NOT NULL,
  lugar_inicio TEXT,                    ← NUEVO CAMPO
  estado TEXT DEFAULT 'En proceso',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (camion_id) REFERENCES Camion (id),
  FOREIGN KEY (destino_id) REFERENCES Destino (id)
);
```

---

## 💡 Ejemplos de Uso

### **Lugares de Inicio Comunes:**
- "Oficina principal"
- "Almacén central"
- "Planta Santo Domingo"
- "Depósito norte"
- "Garage empresarial"

### **Beneficios:**
- 🎯 Mejor trazabilidad de los viajes
- 📊 Análisis de rutas más completo
- 📝 Historial detallado de operaciones
- 🚚 Optimización de logística

---

## ✅ Checklist de Migración

- [ ] Ejecuté `npm start` después de actualizar el código
- [ ] Vi el mensaje de migración en la consola
- [ ] Puedo crear nuevos viajes con lugar de inicio
- [ ] Los viajes antiguos se muestran correctamente
- [ ] El campo aparece en todas las pantallas de viajes

---

**🎉 ¡Migración completada! Tu app ahora tiene mejor control de logística.**
