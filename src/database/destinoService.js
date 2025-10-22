import { db } from './database';

export const destinoService = {
  // Obtener todos los destinos
  getAll: async () => {
    try {
      const destinos = await db.getAllAsync('SELECT * FROM Destino ORDER BY nombre');
      return destinos;
    } catch (error) {
      console.error('Error obteniendo destinos:', error);
      throw error;
    }
  },

  // Obtener un destino por ID
  getById: async (id) => {
    try {
      const destino = await db.getFirstAsync('SELECT * FROM Destino WHERE id = ?', [id]);
      return destino;
    } catch (error) {
      console.error('Error obteniendo destino:', error);
      throw error;
    }
  },

  // Crear un nuevo destino
  create: async (nombre, ubicacion) => {
    try {
      const result = await db.runAsync(
        'INSERT INTO Destino (nombre, ubicacion) VALUES (?, ?)',
        [nombre, ubicacion || '']
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creando destino:', error);
      throw error;
    }
  },

  // Actualizar un destino
  update: async (id, nombre, ubicacion) => {
    try {
      await db.runAsync(
        'UPDATE Destino SET nombre = ?, ubicacion = ? WHERE id = ?',
        [nombre, ubicacion || '', id]
      );
      return true;
    } catch (error) {
      console.error('Error actualizando destino:', error);
      throw error;
    }
  },

  // Eliminar un destino
  delete: async (id) => {
    try {
      await db.runAsync('DELETE FROM Destino WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error eliminando destino:', error);
      throw error;
    }
  },
};
