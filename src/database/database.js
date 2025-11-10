import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export const initDatabase = async () => {
  try {
    console.log('🔄 Inicializando base de datos...');
    
    // Usar la API moderna
    dbInstance = await SQLite.openDatabaseAsync('camiones.db');
    
    console.log('✅ Base de datos abierta correctamente');
    
    await createTablesModern();
    
    console.log('✅ Base de datos inicializada completamente');
    return dbInstance;
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    throw new Error('Error en la inicialización de la base de datos');
  }
};

export const getDb = () => {
  if (!dbInstance) {
    throw new Error('Base de datos no inicializada. Llama a initDatabase() primero.');
  }
  return dbInstance;
};

export const db = new Proxy({}, {
  get: (target, prop) => {
    const database = getDb();
    return database[prop];
  }
});

const createTablesModern = async () => {
  try {
    console.log('🔄 Creando tablas...');
    
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

    // Crear tabla Camion
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS Camion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        placa TEXT,
        estado TEXT DEFAULT 'activo',
        viajes_realizados INTEGER DEFAULT 0,
        dueno_id INTEGER
      );
    `);

    // Crear tabla Destino
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS Destino (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        ubicacion TEXT
      );
    `);

    // Crear tabla Viaje
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS Viaje (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        camion_id INTEGER NOT NULL,
        destino_id INTEGER NOT NULL,
        fecha_programada TEXT,
        cantidad_viajes INTEGER NOT NULL,
        viajes_realizados INTEGER DEFAULT 0,
        estado TEXT DEFAULT 'En progreso'
      );
    `);

    // Crear tabla EntregaViaje
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS EntregaViaje (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        viaje_id INTEGER NOT NULL,
        fecha_entrega TEXT NOT NULL
      );
    `);

    console.log('✅ Todas las tablas creadas correctamente');
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    throw error;
  }
};

// Funciones helper usando API moderna
export const execAsync = async (sql, params = []) => {
  const db = getDb();
  return await db.runAsync(sql, params);
};

export const getAllAsync = async (sql, params = []) => {
  const db = getDb();
  return await db.getAllAsync(sql, params);
};

export const getFirstAsync = async (sql, params = []) => {
  const results = await getAllAsync(sql, params);
  return results[0] || null;
};
