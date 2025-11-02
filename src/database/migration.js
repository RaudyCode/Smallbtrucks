import { initDatabase } from './database';

export const migrateDatabase = async () => {
  try {
    await initDatabase();
    console.log('✅ Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    return false;
  }
};