import { db } from './database';

export const entregaService = {
  // Registrar una entrega
  registrarEntrega: async (viajeId, cantidad = 1) => {
    try {
      // Obtener fecha local sin problemas de zona horaria
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const fechaHoy = `${year}-${month}-${day}`;
      
      await db.runAsync(
        'INSERT INTO EntregaViaje (viaje_id, fecha_entrega, cantidad) VALUES (?, ?, ?)',
        [viajeId, fechaHoy, cantidad]
      );
      
      console.log(`✅ Entrega registrada: Viaje ${viajeId}, Fecha: ${fechaHoy}, Cantidad: ${cantidad}`);
      
      return { success: true, fecha: fechaHoy };
    } catch (error) {
      console.error('Error registrando entrega:', error);
      throw error;
    }
  },

  // Eliminar última entrega (para el botón de restar)
  eliminarUltimaEntrega: async (viajeId) => {
    try {
      await db.runAsync(
        'DELETE FROM EntregaViaje WHERE id = (SELECT id FROM EntregaViaje WHERE viaje_id = ? ORDER BY created_at DESC LIMIT 1)',
        [viajeId]
      );
      return true;
    } catch (error) {
      console.error('Error eliminando entrega:', error);
      throw error;
    }
  },

  // Obtener entregas por viaje
  getByViaje: async (viajeId) => {
    try {
      const entregas = await db.getAllAsync(
        'SELECT * FROM EntregaViaje WHERE viaje_id = ? ORDER BY fecha_entrega DESC',
        [viajeId]
      );
      return entregas;
    } catch (error) {
      console.error('Error obteniendo entregas del viaje:', error);
      throw error;
    }
  },

  // Obtener historial agrupado por fecha
  getHistorialPorFecha: async () => {
    try {
      const historial = await db.getAllAsync(`
        SELECT 
          e.fecha_entrega,
          c.nombre as camion_nombre,
          d.nombre as destino_nombre,
          SUM(e.cantidad) as total_entregas,
          v.id as viaje_id
        FROM EntregaViaje e
        INNER JOIN Viaje v ON e.viaje_id = v.id
        INNER JOIN Camion c ON v.camion_id = c.id
        INNER JOIN Destino d ON v.destino_id = d.id
        GROUP BY e.fecha_entrega, c.id, d.id, v.id
        ORDER BY e.fecha_entrega DESC
      `);
      return historial;
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  },

  // Obtener historial de un camión específico
  getHistorialByCamion: async (camionId) => {
    try {
      const historial = await db.getAllAsync(`
        SELECT 
          e.fecha_entrega,
          d.nombre as destino_nombre,
          SUM(e.cantidad) as total_entregas,
          v.id as viaje_id
        FROM EntregaViaje e
        INNER JOIN Viaje v ON e.viaje_id = v.id
        INNER JOIN Destino d ON v.destino_id = d.id
        WHERE v.camion_id = ?
        GROUP BY e.fecha_entrega, d.id, v.id
        ORDER BY e.fecha_entrega DESC
      `, [camionId]);
      return historial;
    } catch (error) {
      console.error('Error obteniendo historial del camión:', error);
      throw error;
    }
  },
};
