# Sistema de Gestión de Dueños - Documentación

## 📋 Resumen de Cambios

Se ha implementado un sistema completo de gestión de dueños separado e independiente, similar a la gestión de camiones y destinos.

## 🆕 Nuevas Funcionalidades

### 1. **Entidad Dueño (Owner)**
- Tabla independiente en la base de datos
- Campos: nombre, teléfono, email, notas
- Relación con camiones mediante `dueno_id`

### 2. **Pantallas Nuevas**

#### DuenoListScreen
- Lista de todos los dueños registrados
- Estadísticas por dueño:
  * Total de camiones
  * Total de viajes
  * Viajes completados
- Acciones:
  * Ver detalle del dueño
  * Agregar nuevo camión al dueño
  * Eliminar dueño (si no tiene camiones)

#### AddDuenoScreen
- Formulario para crear/editar dueños
- Campos:
  * Nombre (obligatorio)
  * Teléfono (opcional)
  * Email (opcional)
  * Notas (opcional)

#### DuenoDetailScreen
- Información completa del dueño
- Lista de todos sus camiones
- Últimos 5 viajes de sus camiones
- Estadísticas detalladas
- Botones para:
  * Editar información del dueño
  * Agregar nuevo camión
  * Ver detalle de cada camión

### 3. **Modificaciones en Pantallas Existentes**

#### HomeScreen
- Agregado botón "Dueños" en acciones rápidas
- Acceso directo a la gestión de dueños

#### AddCamionScreen
- Ahora permite seleccionar un dueño de una lista (modal)
- Opción para crear un nuevo dueño desde la misma pantalla
- Soporte para placa adicional
- Si se llama desde DuenoDetailScreen, preselecciona el dueño automáticamente

## 📁 Archivos Nuevos

### Servicios de Base de Datos
```
src/database/duenoService.js
```
Funciones principales:
- `create()` - Crear dueño
- `getAll()` - Obtener todos los dueños
- `getById()` - Obtener dueño por ID
- `getCamiones()` - Obtener camiones de un dueño
- `getStats()` - Obtener estadísticas del dueño
- `update()` - Actualizar dueño
- `delete()` - Eliminar dueño (con validación)
- `search()` - Buscar dueños por nombre

### Pantallas
```
src/screens/DuenoListScreen.js
src/screens/AddDuenoScreen.js
src/screens/DuenoDetailScreen.js
```

## 🗄️ Cambios en la Base de Datos

### Nueva Tabla: Dueno
```sql
CREATE TABLE IF NOT EXISTS Dueno (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  notas TEXT
);
```

### Modificación Tabla Camion
```sql
ALTER TABLE Camion ADD COLUMN dueno_id INTEGER REFERENCES Dueno(id);
```

**Nota:** La columna `dueno` (texto) se mantiene por compatibilidad, pero ahora se usa `dueno_id` para la relación.

## 🔄 Flujo de Trabajo

### Crear un nuevo camión:
1. Usuario puede ir a "Dueños" → Seleccionar dueño → "Agregar Camión"
2. O ir a "Camiones" → "Agregar Camión" → Seleccionar dueño de lista
3. O crear un nuevo dueño directamente desde el formulario de camión

### Ver información de un dueño:
1. Ir a "Dueños"
2. Tocar en un dueño de la lista
3. Ver:
   - Información de contacto
   - Estadísticas
   - Lista de camiones
   - Últimos viajes

### Editar un dueño:
1. Desde DuenoDetailScreen → "Editar Información"
2. Modificar datos y guardar

### Eliminar un dueño:
1. Desde DuenoListScreen → Botón eliminar
2. Solo se permite si no tiene camiones asociados

## 🎨 Características de UI

- **Diseño consistente** con el resto de la aplicación
- **Iconografía clara**:
  * `account` - Dueño
  * `truck` - Camión
  * `truck-delivery` - Viajes
  * `check-circle` - Completados
- **Colores**:
  * Primario: Información del dueño
  * Secundario: Camiones
  * Success: Viajes completados
  * Warning: Viajes en proceso

## 📱 Navegación

```
HomeTabs
  └─ Inicio
      └─ Dueños (botón)
          ├─ DuenoList
          │   ├─ AddDueno
          │   └─ DuenoDetail
          │       ├─ AddCamion (preseleccionado)
          │       ├─ CamionDetail
          │       └─ AddDueno (editar)
          └─ AddCamion
              └─ AddDueno (crear nuevo)
```

## ✅ Ventajas del Sistema

1. **Organización mejorada**: Los dueños están centralizados
2. **Información detallada**: Ver todos los datos de un dueño en un solo lugar
3. **Trazabilidad**: Seguimiento de viajes por dueño
4. **Reutilización**: Un dueño puede tener múltiples camiones
5. **Integridad**: No se puede eliminar un dueño con camiones asociados
6. **Facilidad**: Crear camión desde el perfil del dueño

## 🔐 Validaciones

- Nombre del dueño es obligatorio
- No se puede eliminar un dueño con camiones
- Al crear camión, debe seleccionar un dueño existente o crear uno nuevo
- Relación dueño-camión mediante foreign key

## 📊 Estadísticas Disponibles

Por cada dueño se calcula automáticamente:
- Total de camiones registrados
- Total de viajes realizados (de todos sus camiones)
- Total de viajes completados
- Progreso general

## 🚀 Próximas Mejoras Sugeridas

- [ ] Exportar listado de dueños
- [ ] Filtrar/buscar dueños por nombre
- [ ] Agregar foto/avatar del dueño
- [ ] Reportes por dueño (PDF)
- [ ] Notificaciones al dueño
- [ ] Panel de control del dueño (app separada)
