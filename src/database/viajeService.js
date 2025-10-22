import { db } from './database';
import { entregaService } from './entregaService';

export const viajeService = {
  // Obtener todos los viajes con información de camión y destino
  getAll: async () => {
    try {
      const viajes = await db.getAllAsync(`
        SELECT 
          v.*,
          c.nombre as camion_nombre,
          d.nombre as destino_nombre,
          d.ubicacion as destino_ubicacion
        FROM Viaje v
        INNER JOIN Camion c ON v.camion_id = c.id
        INNER JOIN Destino d ON v.destino_id = d.id
        ORDER BY v.fecha_programada DESC, v.id DESC
      `);
      return viajes;
    } catch (error) {
      console.error('Error obteniendo viajes:', error);
      throw error;
    }
  },

  // Obtener viajes por camión
  getByCamion: async (camionId) => {
    try {
      const viajes = await db.getAllAsync(`
        SELECT 
          v.*,
          d.nombre as destino_nombre,
          d.ubicacion as destino_ubicacion
        FROM Viaje v
        INNER JOIN Destino d ON v.destino_id = d.id
        WHERE v.camion_id = ?
        ORDER BY v.fecha_programada DESC
      `, [camionId]);
      return viajes;
    } catch (error) {
      console.error('Error obteniendo viajes del camión:', error);
      throw error;
    }
  },

  // Obtener viajes programados (En proceso)
  getProgramados: async () => {
    try {
      const viajes = await db.getAllAsync(`
        SELECT 
          v.*,
          c.nombre as camion_nombre,
          d.nombre as destino_nombre,
          d.ubicacion as destino_ubicacion
        FROM Viaje v
        INNER JOIN Camion c ON v.camion_id = c.id
        INNER JOIN Destino d ON v.destino_id = d.id
        WHERE v.estado = 'En proceso'
        ORDER BY v.fecha_programada ASC
      `);
      return viajes;
    } catch (error) {
      console.error('Error obteniendo viajes programados:', error);
      throw error;
    }
  },

  // Crear un nuevo viaje
  create: async (camionId, destinoId, cantidadViajes, fechaProgramada) => {
    try {
      const result = await db.runAsync(`
        INSERT INTO Viaje (camion_id, destino_id, cantidad_viajes, fecha_programada, estado)
        VALUES (?, ?, ?, ?, 'En proceso')
      `, [camionId, destinoId, cantidadViajes, fechaProgramada]);
      
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creando viaje:', error);
      throw error;
    }
  },

  // Actualizar estado del viaje
  updateEstado: async (id, nuevoEstado) => {
    try {
      await db.runAsync(
        'UPDATE Viaje SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [nuevoEstado, id]
      );
      return true;
    } catch (error) {
      console.error('Error actualizando estado del viaje:', error);
      throw error;
    }
  },

  // Incrementar viajes completados
  incrementarViajeCompletado: async (id) => {
    try {
      const viaje = await db.getFirstAsync('SELECT cantidad_viajes, viajes_completados FROM Viaje WHERE id = ?', [id]);
      
      if (!viaje) throw new Error('Viaje no encontrado');
      
      const nuevosCompletados = Math.min(viaje.viajes_completados + 1, viaje.cantidad_viajes);
      const nuevoEstado = nuevosCompletados >= viaje.cantidad_viajes ? 'Completado' : 'En proceso';
      
      // Registrar la entrega individual con fecha actual
      try {
        const resultado = await entregaService.registrarEntrega(id, 1);
        console.log('✅ Entrega registrada correctamente para viaje', id, 'con fecha:', resultado.fecha);
      } catch (entregaError) {
        console.error('❌ Error al registrar entrega individual:', entregaError);
        // Continuar aunque falle el registro de entrega individual
      }
      
      await db.runAsync(
        'UPDATE Viaje SET viajes_completados = ?, estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [nuevosCompletados, nuevoEstado, id]
      );
      
      return { viajes_completados: nuevosCompletados, estado: nuevoEstado };
    } catch (error) {
      console.error('Error incrementando viaje completado:', error);
      throw error;
    }
  },

  // Decrementar viajes completados
  decrementarViajeCompletado: async (id) => {
    try {
      const viaje = await db.getFirstAsync('SELECT viajes_completados FROM Viaje WHERE id = ?', [id]);
      
      if (!viaje) throw new Error('Viaje no encontrado');
      
      const nuevosCompletados = Math.max(viaje.viajes_completados - 1, 0);
      
      // Eliminar la última entrega registrada
      await entregaService.eliminarUltimaEntrega(id);
      
      await db.runAsync(
        'UPDATE Viaje SET viajes_completados = ?, estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [nuevosCompletados, 'En proceso', id]
      );
      
      return { viajes_completados: nuevosCompletados, estado: 'En proceso' };
    } catch (error) {
      console.error('Error decrementando viaje completado:', error);
      throw error;
    }
  },

  // Eliminar un viaje
  deleteViaje: async (id) => {
    try {
      await db.runAsync('DELETE FROM Viaje WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error eliminando viaje:', error);
      throw error;
    }
  },

  // Obtener estadísticas de viajes por fecha
  getEstadisticasPorFecha: async () => {
    try {
      const stats = await db.getAllAsync(`
        SELECT 
          fecha_programada,
          COUNT(*) as total_viajes,
          SUM(cantidad_viajes) as total_cantidad,
          SUM(CASE WHEN estado = 'Completado' THEN cantidad_viajes ELSE 0 END) as completados
        FROM Viaje
        GROUP BY fecha_programada
        ORDER BY fecha_programada DESC
        LIMIT 30
      `);
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },
};
