import { db } from './database';

export const duenoService = {
  // Crear tabla de dueños
  initTable: () => {
    db.execAsync(`
      CREATE TABLE IF NOT EXISTS Dueno (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT,
        email TEXT,
        notas TEXT
      );
    `);
  },

  // Crear un nuevo dueño
  create: async (nombre, telefono = '', email = '', notas = '') => {
    try {
      const result = await db.runAsync(
        'INSERT INTO Dueno (nombre, telefono, email, notas) VALUES (?, ?, ?, ?)',
        [nombre, telefono, email, notas]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creando dueño:', error);
      throw error;
    }
  },

  // Obtener todos los dueños
  getAll: async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM Dueno ORDER BY nombre ASC');
      return result;
    } catch (error) {
      console.error('Error obteniendo dueños:', error);
      throw error;
    }
  },

  // Obtener un dueño por ID
  getById: async (id) => {
    try {
      const result = await db.getFirstAsync('SELECT * FROM Dueno WHERE id = ?', [id]);
      return result;
    } catch (error) {
      console.error('Error obteniendo dueño:', error);
      throw error;
    }
  },

  // Obtener camiones de un dueño
  getCamiones: async (duenoId) => {
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM Camion WHERE dueno_id = ? ORDER BY nombre ASC',
        [duenoId]
      );
      return result;
    } catch (error) {
      console.error('Error obteniendo camiones del dueño:', error);
      throw error;
    }
  },

  // Obtener estadísticas de un dueño (total de camiones y viajes)
  getStats: async (duenoId) => {
    try {
      // Total de camiones
      const camionesResult = await db.getFirstAsync(
        'SELECT COUNT(*) as total FROM Camion WHERE dueno_id = ?',
        [duenoId]
      );
      
      // Total de viajes de los camiones del dueño
      const viajesResult = await db.getFirstAsync(
        `SELECT COUNT(*) as total 
         FROM Viaje v 
         INNER JOIN Camion c ON v.camion_id = c.id 
         WHERE c.dueno_id = ?`,
        [duenoId]
      );

      // Viajes completados
      const completadosResult = await db.getFirstAsync(
        `SELECT COUNT(*) as total 
         FROM Viaje v 
         INNER JOIN Camion c ON v.camion_id = c.id 
         WHERE c.dueno_id = ? AND v.estado = 'Completado'`,
        [duenoId]
      );

      return {
        totalCamiones: camionesResult?.total || 0,
        totalViajes: viajesResult?.total || 0,
        viajesCompletados: completadosResult?.total || 0,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del dueño:', error);
      throw error;
    }
  },

  // Actualizar un dueño
  update: async (id, nombre, telefono = '', email = '', notas = '') => {
    try {
      await db.runAsync(
        'UPDATE Dueno SET nombre = ?, telefono = ?, email = ?, notas = ? WHERE id = ?',
        [nombre, telefono, email, notas, id]
      );
    } catch (error) {
      console.error('Error actualizando dueño:', error);
      throw error;
    }
  },

  // Eliminar un dueño (solo si no tiene camiones asociados)
  delete: async (id) => {
    try {
      // Verificar si tiene camiones
      const camionesResult = await db.getFirstAsync(
        'SELECT COUNT(*) as total FROM Camion WHERE dueno_id = ?',
        [id]
      );
      
      if (camionesResult?.total > 0) {
        throw new Error('No se puede eliminar un dueño que tiene camiones asociados');
      }

      await db.runAsync('DELETE FROM Dueno WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error eliminando dueño:', error);
      throw error;
    }
  },

  // Buscar dueños por nombre
  search: async (searchTerm) => {
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM Dueno WHERE nombre LIKE ? ORDER BY nombre ASC',
        [`%${searchTerm}%`]
      );
      return result;
    } catch (error) {
      console.error('Error buscando dueños:', error);
      throw error;
    }
  },
};
