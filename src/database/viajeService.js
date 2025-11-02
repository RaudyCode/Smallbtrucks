import { db } from './database';
import { entregaService } from './entregaService';

export const viajeService = {
  // Crear un nuevo viaje
  create: async (camion_id, destino_id, cantidad_viajes, fecha_programada, lugar_inicio = null) => {
    try {
      const result = await db.runAsync(
        `INSERT INTO Viaje (
          camion_id, 
          destino_id, 
          fecha_programada,
          lugar_inicio,
          cantidad_viajes, 
          estado,
          viajes_completados
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          camion_id,
          destino_id,
          fecha_programada,
          lugar_inicio,
          cantidad_viajes,
          'En proceso',
          0
        ]
      );
      return result.lastID;
    } catch (error) {
      console.error('Error creando viaje:', error);
      throw error;
    }
  },

  // Incrementar viajes completados
  incrementarViajeCompletado: async (id) => {
    try {
      const viaje = await db.getFirstAsync(
        `SELECT cantidad_viajes, viajes_completados FROM Viaje WHERE id = ?`,
        [id]
      );
      
      if (!viaje) throw new Error('Viaje no encontrado');
      if (viaje.viajes_completados >= viaje.cantidad_viajes) {
        throw new Error('Ya se completaron todos los viajes programados');
      }

      await db.runAsync(
        `UPDATE Viaje 
         SET viajes_completados = viajes_completados + 1,
             estado = CASE 
               WHEN viajes_completados + 1 >= cantidad_viajes THEN 'Completado'
               ELSE 'En proceso'
             END
         WHERE id = ?`,
        [id]
      );

      // Registrar la entrega en el historial
      await entregaService.registrarEntrega(id, 1);
      
      console.log(`✅ Viaje incrementado y entrega registrada para viaje ID: ${id}`);
      return true;
    } catch (error) {
      console.error('Error incrementando viaje:', error);
      throw error;
    }
  },

  // Decrementar viajes completados
  decrementarViajeCompletado: async (id) => {
    try {
      const viaje = await db.getFirstAsync(
        `SELECT viajes_completados FROM Viaje WHERE id = ?`,
        [id]
      );
      
      if (!viaje) throw new Error('Viaje no encontrado');
      if (viaje.viajes_completados <= 0) {
        throw new Error('No hay viajes completados para decrementar');
      }

      await db.runAsync(
        `UPDATE Viaje 
         SET viajes_completados = viajes_completados - 1,
             estado = 'En proceso'
         WHERE id = ?`,
        [id]
      );

      // Eliminar la última entrega del historial
      await entregaService.eliminarUltimaEntrega(id);
      
      console.log(`✅ Viaje decrementado y última entrega eliminada para viaje ID: ${id}`);
      return true;
    } catch (error) {
      console.error('Error decrementando viaje:', error);
      throw error;
    }
  },

  // Actualizar estado
  updateEstado: async (id, estado) => {
    try {
      await db.runAsync(
        `UPDATE Viaje SET estado = ? WHERE id = ?`,
        [estado, id]
      );
      return true;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    }
  },

  // Obtener todos los viajes
  getAll: async () => {
    try {
      return await db.getAllAsync(`
        SELECT 
          v.*,
          c.nombre as camion_nombre,
          d.nombre as destino_nombre,
          d.ubicacion as destino_ubicacion
        FROM Viaje v
        JOIN Camion c ON v.camion_id = c.id
        JOIN Destino d ON v.destino_id = d.id
        ORDER BY v.fecha_programada DESC
      `);
    } catch (error) {
      console.error('Error obteniendo viajes:', error);
      throw error;
    }
  },

  // Obtener viajes por estado
  getByEstado: async (estado) => {
    try {
      return await db.getAllAsync(
        `SELECT 
          v.*,
          c.nombre as camion_nombre,
          d.nombre as destino_nombre,
          d.ubicacion as destino_ubicacion
        FROM Viaje v
        JOIN Camion c ON v.camion_id = c.id
        JOIN Destino d ON v.destino_id = d.id
        WHERE v.estado = ?
        ORDER BY v.fecha_programada DESC`,
        [estado]
      );
    } catch (error) {
      console.error('Error obteniendo viajes por estado:', error);
      throw error;
    }
  },

  // Obtener viajes por camión
  getByCamion: async (camionId) => {
    try {
      return await db.getAllAsync(
        `SELECT 
          v.*,
          c.nombre as camion_nombre,
          d.nombre as destino_nombre,
          d.ubicacion as destino_ubicacion
        FROM Viaje v
        JOIN Camion c ON v.camion_id = c.id
        JOIN Destino d ON v.destino_id = d.id
        WHERE v.camion_id = ?
        ORDER BY v.fecha_programada DESC`,
        [camionId]
      );
    } catch (error) {
      console.error('Error obteniendo viajes por camión:', error);
      throw error;
    }
  },

  // Obtener un viaje por ID
  getById: async (id) => {
    try {
      return await db.getFirstAsync(
        `SELECT 
          v.*,
          c.nombre as camion_nombre,
          d.nombre as destino_nombre,
          d.ubicacion as destino_ubicacion
        FROM Viaje v
        JOIN Camion c ON v.camion_id = c.id
        JOIN Destino d ON v.destino_id = d.id
        WHERE v.id = ?`,
        [id]
      );
    } catch (error) {
      console.error('Error obteniendo viaje:', error);
      throw error;
    }
  },

  // Actualizar un viaje
  update: async (id, viaje) => {
    try {
      await db.runAsync(
        `UPDATE Viaje 
        SET camion_id = ?, 
            destino_id = ?, 
            fecha_programada = ?,
            lugar_inicio = ?,
            cantidad_viajes = ?,
            estado = ?
        WHERE id = ?`,
        [
          viaje.camion_id,
          viaje.destino_id,
          viaje.fecha_programada,
          viaje.lugar_inicio || null,
          viaje.cantidad_viajes,
          viaje.estado,
          id
        ]
      );
      return true;
    } catch (error) {
      console.error('Error actualizando viaje:', error);
      throw error;
    }
  },

  // Eliminar un viaje
  delete: async (id) => {
    try {
      await db.runAsync('DELETE FROM Viaje WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error eliminando viaje:', error);
      throw error;
    }
  },

  // Alias para deleteViaje
  deleteViaje: async (id) => {
    return await viajeService.delete(id);
  },

  // Obtener estadísticas generales
  getStats: async () => {
    try {
      // Calcular la fecha de hace 7 días
      const hoy = new Date();
      const hace7dias = new Date(hoy);
      hace7dias.setDate(hoy.getDate() - 7);
      const fechaInicio = hace7dias.toISOString().split('T')[0];
      
      const stats = await db.getFirstAsync(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'En proceso' THEN 1 ELSE 0 END) as enProceso,
          SUM(CASE WHEN estado = 'Completado' THEN 1 ELSE 0 END) as completados,
          COUNT(DISTINCT camion_id) as camionesActivos
        FROM Viaje
      `);
      
      // Obtener viajes completados de la semana
      const viajesSemana = await db.getFirstAsync(`
        SELECT 
          COALESCE(SUM(viajes_completados), 0) as viajesSemana
        FROM Viaje
        WHERE fecha_programada >= ?
      `, [fechaInicio]);
      
      return {
        total: stats.total || 0,
        enProceso: stats.enProceso || 0,
        completados: stats.completados || 0,
        camionesActivos: stats.camionesActivos || 0,
        viajesSemana: viajesSemana.viajesSemana || 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // Obtener historial de entregas por fecha
  getHistorialPorFecha: async () => {
    try {
      return await db.getAllAsync(`
        SELECT 
          v.fecha_programada as fecha_entrega,
          c.nombre as camion_nombre,
          d.nombre as destino_nombre,
          v.id as viaje_id,
          COUNT(*) as total_entregas
        FROM Viaje v
        JOIN Camion c ON v.camion_id = c.id
        JOIN Destino d ON v.destino_id = d.id
        WHERE v.estado = 'Completado'
        GROUP BY v.fecha_programada, v.camion_id, v.destino_id
        ORDER BY v.fecha_programada DESC
      `);
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  }
};