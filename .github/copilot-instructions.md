// Copilot Prompt Mejorado:
// Construye una aplicación móvil completa en React Native (con Expo SDK 54+)
// para la gestión de viajes de camiones de una compañía de transporte.

// La app debe cumplir las siguientes condiciones:

// 🔧 Estructura general del proyecto:
// - React Native + Expo (SDK 54 o superior).
// - Base de datos local con SQLite (expo-sqlite).
// - Navegación con React Navigation (@react-navigation/native + stack).
// - Diseño responsivo que se ajuste automáticamente a cualquier tamaño de pantalla móvil, evitando corte de contenidos.
// - Componentes limpios y modernos: View, Text, FlatList, Button, TextInput, ScrollView.

// 🧩 Entidades principales:

// Camión:
// - id (autoincremental)
// - nombre (string)
// - placa (string opcional)
// - estado (activo/inactivo)
// - Un camión permanece en la base de datos y puede tener muchos viajes.

// Destino:
// - id (autoincremental)
// - nombre (string)
// - ubicación (string opcional)

// Viaje:
// - id (autoincremental)
// - camion_id (relación con Camión)
// - destino_id (relación con Destino)
// - fecha programada (timestamp o texto)
// - cantidad de viajes asignados
// - estado: "En progreso" o "Completado"
// - Un camión puede tener muchos viajes, cada viaje tiene un destino.

// 📝 Reglas de negocio:

// 1. Los camiones se agregan una sola vez y permanecen en el sistema.
// 2. Al crear un viaje se selecciona un camión y un destino existentes.
// 3. En el viaje se define la cantidad de viajes y la fecha de realización (puede ser futura para programar).
// 4. Estado del viaje:
//    - "En progreso" al crearlo
//    - "Completado" cuando se termina la cantidad de viajes asignada
// 5. No permitir que se registren más viajes de los planeados para ese viaje.
// 6. Mostrar el progreso del camión basado en los viajes completados.
// 7. Historial/Calendario de viajes con fecha, camión y destino.

// 📱 Pantallas principales:

// 1. Inicio:
//    - Lista de camiones con progreso (ej. "Camión F1: 2/5 viajes completados").
//    - Botón para agregar o ver detalles de un camión.

// 2. Registrar Camión:
//    - Formulario para nombre, placa y estado.

// 3. Registrar Destino:
//    - Formulario para nombre y ubicación.

// 4. Registrar Viaje:
//    - Selección de camión y destino.
//    - Definir cantidad de viajes y fecha programada.
//    - Validación de cantidad máxima de viajes.
//    - Estado inicial: "En progreso".

// 5. Detalle del viaje:
//    - Mostrar información del viaje y estado.
//    - Botón para marcar viajes completados.

// 6. Historial / Calendario:
//    - Mostrar todos los viajes por fecha, camión y destino.
//    - Ejemplo:
//      "Ayer: Camión F2 → 2 viajes a CEMEX"
//      "Hoy: Camión F3 → Cotuí, Camión F2 → Barrick"

// 🗃️ Base de datos SQLite sugerida:

// CREATE TABLE IF NOT EXISTS Camion (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   nombre TEXT NOT NULL,
//   placa TEXT,
//   estado TEXT DEFAULT 'activo'
// );

// CREATE TABLE IF NOT EXISTS Destino (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   nombre TEXT NOT NULL,
//   ubicacion TEXT
// );

// CREATE TABLE IF NOT EXISTS Viaje (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   camion_id INTEGER NOT NULL,
//   destino_id INTEGER NOT NULL,
//   fecha TEXT,
//   cantidad INTEGER NOT NULL,
//   estado TEXT DEFAULT 'En progreso',
//   FOREIGN KEY (camion_id) REFERENCES Camion(id),
//   FOREIGN KEY (destino_id) REFERENCES Destino(id)
// );

// 💅 Diseño y UI:
// - Pantallas responsivas para cualquier tamaño de teléfono.
// - Uso de ScrollView o FlatList donde sea necesario para evitar corte de contenido.
// - Colores claros, botones azules o verdes.
// - Componentes estilizados y consistentes.

// ⚙️ Extras opcionales:
// - Filtrar viajes por fecha o estado.
// - Mostrar resumen de viajes del día.
// - Guardar historial completo de viajes completados.
