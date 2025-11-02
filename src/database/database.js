import * as SQLite from 'expo-sqlite';

// Nueva API de expo-sqlite para SDK 52+
let dbInstance = null;

// Getter para la base de datos que asegura que esté inicializada
export const getDb = () => {
  if (!dbInstance) {
    throw new Error('Base de datos no inicializada. Llama a initDatabase() primero.');
  }
  return dbInstance;
};

// Mantener compatibilidad con código existente
export const db = new Proxy({}, {
  get: (target, prop) => {
    const database = getDb();
    return database[prop];
  }
});

// Inicializar la base de datos
export const initDatabase = async () => {
  try {
    // En la nueva API, no necesitamos cerrar explícitamente la base de datos antes de abrirla
    dbInstance = await SQLite.openDatabaseAsync('camiones.db');
    
    // Agregar método helper getFirstAsync
    if (!dbInstance.getFirstAsync) {
      dbInstance.getFirstAsync = async (sql, params = []) => {
        const result = await dbInstance.getAllAsync(sql, params);
        return result[0] || null;
      };
    }
    
    // Crear tablas con manejo de errores
    await createTables();
    
    // Ejecutar migraciones
    await runMigrations();
    
    console.log('✅ Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    throw error;
  }
};

const createTables = async () => {
  try {
    await dbInstance.execAsync('PRAGMA foreign_keys=off;');
    await dbInstance.execAsync('BEGIN TRANSACTION;');

    // Crear tabla Dueno
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS Dueno (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT,
        email TEXT,
        notas TEXT
      );
    `);
    console.log('Tabla Dueno creada');

    // Crear tabla Camion
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS Camion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        placa TEXT,
        dueno TEXT,
        dueno_id INTEGER,
        estado TEXT DEFAULT 'activo',
        viajes_realizados INTEGER DEFAULT 0,
        FOREIGN KEY (dueno_id) REFERENCES Dueno (id)
      );
    `);
    console.log('Tabla Camion creada');

    // Crear tabla Destino
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS Destino (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        ubicacion TEXT
      );
    `);
    console.log('Tabla Destino creada');

    // Crear tabla Viaje
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS Viaje (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        camion_id INTEGER,
        destino_id INTEGER,
        cantidad_viajes INTEGER NOT NULL,
        viajes_completados INTEGER DEFAULT 0,
        fecha_programada TEXT NOT NULL,
        lugar_inicio TEXT,
        estado TEXT DEFAULT 'En proceso' CHECK(estado IN ('En proceso', 'Completado')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (camion_id) REFERENCES Camion (id),
        FOREIGN KEY (destino_id) REFERENCES Destino (id)
      );
    `);
    console.log('Tabla Viaje creada');

    // Crear tabla EntregaViaje para el historial
    await dbInstance.execAsync(`
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

    // Crear triggers para actualizar timestamps
    await dbInstance.execAsync(`
      CREATE TRIGGER IF NOT EXISTS update_viaje_timestamp 
      AFTER UPDATE ON Viaje
      BEGIN
        UPDATE Viaje 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
      END;
    `);

    // Trigger para actualizar contador de viajes en Camion
    await dbInstance.execAsync(`
      CREATE TRIGGER IF NOT EXISTS update_camion_viajes 
      AFTER UPDATE ON Viaje
      WHEN NEW.estado = 'Completado' AND OLD.estado = 'En proceso'
      BEGIN
        UPDATE Camion
        SET viajes_realizados = viajes_realizados + NEW.cantidad_viajes
        WHERE id = NEW.camion_id;
      END;
    `);

    await dbInstance.execAsync('COMMIT;');
    await dbInstance.execAsync('PRAGMA foreign_keys=on;');

  } catch (error) {
    await dbInstance.execAsync('ROLLBACK;');
    console.error('Error creando tablas:', error);
    throw error;
  }
};

const runMigrations = async () => {
  try {
    console.log('Ejecutando migraciones...');
    
    // Verificar si la columna placa existe
    const placaResult = await dbInstance.getFirstAsync(
      "SELECT COUNT(*) as count FROM pragma_table_info('Camion') WHERE name='placa'"
    );
    
    if (placaResult && placaResult.count === 0) {
      console.log('Agregando columna placa...');
      await dbInstance.execAsync('PRAGMA foreign_keys=off');
      await dbInstance.execAsync('BEGIN TRANSACTION');
      
      try {
        await dbInstance.execAsync(
          'ALTER TABLE Camion ADD COLUMN placa TEXT'
        );
        console.log('✅ Migración: Agregada columna placa a la tabla Camion');
        await dbInstance.execAsync('COMMIT');
      } catch (error) {
        console.error('Error agregando columna placa:', error);
        await dbInstance.execAsync('ROLLBACK');
      } finally {
        await dbInstance.execAsync('PRAGMA foreign_keys=on');
      }
    }
    
    // Verificar si la columna dueno existe
    const duenoResult = await dbInstance.getFirstAsync(
      "SELECT COUNT(*) as count FROM pragma_table_info('Camion') WHERE name='dueno'"
    );
    
    if (duenoResult && duenoResult.count === 0) {
      console.log('Agregando columna dueno...');
      await dbInstance.execAsync('PRAGMA foreign_keys=off');
      await dbInstance.execAsync('BEGIN TRANSACTION');
      
      try {
        await dbInstance.execAsync(
          'ALTER TABLE Camion ADD COLUMN dueno TEXT'
        );
        console.log('✅ Migración: Agregada columna dueno a la tabla Camion');
        await dbInstance.execAsync('COMMIT');
      } catch (error) {
        console.error('Error agregando columna dueno:', error);
        await dbInstance.execAsync('ROLLBACK');
      } finally {
        await dbInstance.execAsync('PRAGMA foreign_keys=on');
      }
    }
    
    // Verificar si la columna viajes_realizados existe
    const viajesResult = await dbInstance.getFirstAsync(
      "SELECT COUNT(*) as count FROM pragma_table_info('Camion') WHERE name='viajes_realizados'"
    );
    
    if (viajesResult && viajesResult.count === 0) {
      console.log('Agregando columna viajes_realizados...');
      await dbInstance.execAsync('PRAGMA foreign_keys=off');
      await dbInstance.execAsync('BEGIN TRANSACTION');
      
      try {
        await dbInstance.execAsync(
          'ALTER TABLE Camion ADD COLUMN viajes_realizados INTEGER DEFAULT 0'
        );
        console.log('✅ Migración: Agregada columna viajes_realizados a la tabla Camion');
        await dbInstance.execAsync('COMMIT');
      } catch (error) {
        console.error('Error agregando columna viajes_realizados:', error);
        await dbInstance.execAsync('ROLLBACK');
      } finally {
        await dbInstance.execAsync('PRAGMA foreign_keys=on');
      }
    }
    
    // Verificar columna viajes_completados en tabla Viaje
    const tableInfo = await dbInstance.getFirstAsync(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='Viaje'"
    );
    
    if (tableInfo && !tableInfo.sql.includes('viajes_completados')) {
      console.log('Agregando columna viajes_completados...');
      try {
        await dbInstance.execAsync(`
          ALTER TABLE Viaje
          ADD COLUMN viajes_completados INTEGER DEFAULT 0;
        `);
        console.log('✅ Migración: Agregada columna viajes_completados a la tabla Viaje');
      } catch (error) {
        console.error('Error agregando viajes_completados:', error);
      }
    }

    // Verificar y corregir registros existentes
    try {
      await dbInstance.execAsync(`
        UPDATE Viaje
        SET viajes_completados = CASE 
          WHEN estado = 'Completado' THEN cantidad_viajes 
          ELSE 0 
        END
        WHERE viajes_completados IS NULL;
      `);
      console.log('✅ Migración: Actualizado viajes_completados en registros existentes');
    } catch (error) {
      console.error('Error actualizando viajes_completados:', error);
    }

    // Verificar si la columna lugar_inicio existe en tabla Viaje
    const lugarInicioResult = await dbInstance.getFirstAsync(
      "SELECT COUNT(*) as count FROM pragma_table_info('Viaje') WHERE name='lugar_inicio'"
    );
    
    if (lugarInicioResult && lugarInicioResult.count === 0) {
      console.log('Agregando columna lugar_inicio...');
      await dbInstance.execAsync('PRAGMA foreign_keys=off');
      await dbInstance.execAsync('BEGIN TRANSACTION');
      
      try {
        await dbInstance.execAsync(
          'ALTER TABLE Viaje ADD COLUMN lugar_inicio TEXT'
        );
        console.log('✅ Migración: Agregada columna lugar_inicio a la tabla Viaje');
        await dbInstance.execAsync('COMMIT');
      } catch (error) {
        console.error('Error agregando columna lugar_inicio:', error);
        await dbInstance.execAsync('ROLLBACK');
      } finally {
        await dbInstance.execAsync('PRAGMA foreign_keys=on');
      }
    }

    // Verificar si la columna dueno_id existe en tabla Camion
    const duenoIdResult = await dbInstance.getFirstAsync(
      "SELECT COUNT(*) as count FROM pragma_table_info('Camion') WHERE name='dueno_id'"
    );
    
    if (duenoIdResult && duenoIdResult.count === 0) {
      console.log('Agregando columna dueno_id...');
      await dbInstance.execAsync('PRAGMA foreign_keys=off');
      await dbInstance.execAsync('BEGIN TRANSACTION');
      
      try {
        await dbInstance.execAsync(
          'ALTER TABLE Camion ADD COLUMN dueno_id INTEGER REFERENCES Dueno(id)'
        );
        console.log('✅ Migración: Agregada columna dueno_id a la tabla Camion');
        await dbInstance.execAsync('COMMIT');
      } catch (error) {
        console.error('Error agregando columna dueno_id:', error);
        await dbInstance.execAsync('ROLLBACK');
      } finally {
        await dbInstance.execAsync('PRAGMA foreign_keys=on');
      }
    }

    console.log('✅ Migraciones completadas exitosamente');

  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    throw error;
  }
};