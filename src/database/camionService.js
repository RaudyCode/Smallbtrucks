import { db } from './database';

export const camionService = {
  // Obtener todos los camiones con estadísticas
  getAll: async () => {
    try {
      const camiones = await db.getAllAsync(`
        SELECT 
          c.id,
          c.nombre,
          COALESCE(SUM(v.viajes_completados), 0) as viajes_realizados
        FROM Camion c
        LEFT JOIN Viaje v ON c.id = v.camion_id
        GROUP BY c.id, c.nombre
        ORDER BY c.id DESC
      `);
      return camiones;
    } catch (error) {
      console.error('Error obteniendo camiones:', error);
      throw error;
    }
  },

  // Obtener un camión por ID
  getById: async (id) => {
    try {
      const camion = await db.getFirstAsync(`
        SELECT 
          c.id,
          c.nombre,
          COALESCE(SUM(v.viajes_completados), 0) as viajes_realizados
        FROM Camion c
        LEFT JOIN Viaje v ON c.id = v.camion_id
        WHERE c.id = ?
        GROUP BY c.id, c.nombre
      `, [id]);
      return camion;
    } catch (error) {
      console.error('Error obteniendo camión:', error);
      throw error;
    }
  },

  // Crear un nuevo camión
  create: async (nombre) => {
    try {
      const result = await db.runAsync(
        'INSERT INTO Camion (nombre) VALUES (?)',
        [nombre]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creando camión:', error);
      throw error;
    }
  },

  // Actualizar un camión
  update: async (id, nombre) => {
    try {
      await db.runAsync(
        'UPDATE Camion SET nombre = ? WHERE id = ?',
        [nombre, id]
      );
      return true;
    } catch (error) {
      console.error('Error actualizando camión:', error);
      throw error;
    }
  },

  // Eliminar un camión
  delete: async (id) => {
    try {
      await db.runAsync('DELETE FROM Camion WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error eliminando camión:', error);
      throw error;
    }
  },
};
