import * as SQLite from 'expo-sqlite';

// Nueva API de expo-sqlite para SDK 52+
export let db;

// Inicializar la base de datos
export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('camiones.db');
    
    // Migrar la estructura de la base de datos si es necesario
    await migrateDatabaseSchema();
    
    // Crear tabla Camion
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Camion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
      );
    `);
    console.log('Tabla Camion creada');

    // Crear tabla Destino
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Destino (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        ubicacion TEXT
      );
    `);
    console.log('Tabla Destino creada');

    // Crear tabla Viaje
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Viaje (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        camion_id INTEGER,
        destino_id INTEGER,
        cantidad_viajes INTEGER NOT NULL,
        viajes_completados INTEGER DEFAULT 0,
        fecha_programada TEXT NOT NULL,
        estado TEXT DEFAULT 'En proceso' CHECK(estado IN ('En proceso', 'Completado')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (camion_id) REFERENCES Camion (id),
        FOREIGN KEY (destino_id) REFERENCES Destino (id)
      );
    `);
    console.log('Tabla Viaje creada');

    // Crear tabla EntregaViaje (para registrar cada entrega individual)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS EntregaViaje (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        viaje_id INTEGER NOT NULL,
        fecha_entrega TEXT NOT NULL,
        cantidad INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (viaje_id) REFERENCES Viaje (id) ON DELETE CASCADE
      );
    `);
    console.log('Tabla EntregaViaje creada');

    // Insertar datos de ejemplo si las tablas están vacías
    await insertSampleData();
    
    console.log('Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
    throw error;
  }
};

// Migrar la estructura de la base de datos
const migrateDatabaseSchema = async () => {
  try {
    // Migración para tabla Camion - eliminar total_viajes si existe
    const camionTableInfo = await db.getAllAsync(`PRAGMA table_info(Camion)`).catch(() => []);
    const hasTotalViajes = camionTableInfo.some(col => col.name === 'total_viajes');
    
    if (hasTotalViajes) {
      console.log('Migrando tabla Camion (eliminando total_viajes)...');
      
      // Crear tabla temporal sin total_viajes
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS Camion_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL
        );
      `);
      
      // Migrar datos existentes
      const existingCamiones = await db.getAllAsync('SELECT id, nombre FROM Camion').catch(() => []);
      
      for (const camion of existingCamiones) {
        await db.runAsync(
          'INSERT INTO Camion_new (id, nombre) VALUES (?, ?)',
          [camion.id, camion.nombre]
        );
      }
      
      // Eliminar tabla antigua y renombrar
      await db.execAsync('DROP TABLE IF EXISTS Camion;');
      await db.execAsync('ALTER TABLE Camion_new RENAME TO Camion;');
      
      console.log('Migración de tabla Camion completada');
    }
    
    // Verificar si existe la tabla Viaje
    const tableInfo = await db.getAllAsync(`PRAGMA table_info(Viaje)`).catch(() => []);
    
    if (tableInfo.length > 0) {
      const hasNewColumns = tableInfo.some(col => col.name === 'cantidad_viajes');
      const hasViajesCompletados = tableInfo.some(col => col.name === 'viajes_completados');
      
      // Migración 1: Agregar cantidad_viajes si no existe
      if (!hasNewColumns) {
        console.log('Migrando estructura de la base de datos (agregando cantidad_viajes)...');
        
        // Crear una tabla temporal con la nueva estructura
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS Viaje_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            camion_id INTEGER,
            destino_id INTEGER,
            cantidad_viajes INTEGER NOT NULL,
            viajes_completados INTEGER DEFAULT 0,
            fecha_programada TEXT NOT NULL,
            estado TEXT DEFAULT 'En proceso' CHECK(estado IN ('En proceso', 'Completado')),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (camion_id) REFERENCES Camion (id),
            FOREIGN KEY (destino_id) REFERENCES Destino (id)
          );
        `);
        
        // Migrar datos existentes si hay alguno
        const existingViajes = await db.getAllAsync('SELECT * FROM Viaje').catch(() => []);
        
        for (const viaje of existingViajes) {
          await db.runAsync(`
            INSERT INTO Viaje_new (camion_id, destino_id, cantidad_viajes, viajes_completados, fecha_programada, estado, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            viaje.camion_id,
            viaje.destino_id,
            viaje.cantidad || 1,
            0,
            viaje.fecha || new Date().toISOString().split('T')[0],
            'En proceso',
            viaje.created_at || new Date().toISOString(),
            viaje.updated_at || new Date().toISOString()
          ]);
        }
        
        // Eliminar la tabla antigua y renombrar la nueva
        await db.execAsync('DROP TABLE IF EXISTS Viaje;');
        await db.execAsync('ALTER TABLE Viaje_new RENAME TO Viaje;');
        
        console.log('Migración completada exitosamente');
      }
      // Migración 2: Agregar viajes_completados si no existe pero cantidad_viajes sí
      else if (!hasViajesCompletados) {
        console.log('Agregando columna viajes_completados...');
        await db.execAsync(`ALTER TABLE Viaje ADD COLUMN viajes_completados INTEGER DEFAULT 0;`);
        console.log('Columna viajes_completados agregada exitosamente');
      }
    }
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
};

// Insertar datos de ejemplo
const insertSampleData = async () => {
  try {
    // Verificar si ya existen datos
    const camionesCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM Camion');
    
    if (camionesCount.count === 0) {
      console.log('Insertando datos de ejemplo...');
      
      // Insertar camiones de ejemplo
      await db.runAsync('INSERT INTO Camion (nombre) VALUES (?)', ['Camión F1']);
      await db.runAsync('INSERT INTO Camion (nombre) VALUES (?)', ['Camión F2']);
      await db.runAsync('INSERT INTO Camion (nombre) VALUES (?)', ['Camión F3']);
      
      console.log('Camiones de ejemplo insertados');
    }
  } catch (error) {
    console.error('Error insertando datos de ejemplo:', error);
  }
};
