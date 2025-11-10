import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';
import { db } from '../database/database';

export const reporteService = {
  // Obtener viajes del día actual agrupados por ubicación
  getViajesDelDia: async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      // Obtener todos los viajes que tienen entregas hoy
      const viajesHoy = await db.getAllAsync(`
        SELECT 
          e.id as entrega_id,
          e.fecha_entrega,
          e.cantidad,
          v.id as viaje_id,
          v.cantidad_viajes,
          c.nombre as camion_nombre,
          c.placa as camion_placa,
          d.nombre as destino_nombre,
          d.ubicacion as destino_ubicacion
        FROM EntregaViaje e
        JOIN Viaje v ON e.viaje_id = v.id
        JOIN Camion c ON v.camion_id = c.id
        JOIN Destino d ON v.destino_id = d.id
        WHERE DATE(e.fecha_entrega) = ?
        ORDER BY d.ubicacion, c.nombre
      `, [hoy]);

      // Agrupar por ubicación
      const viajesPorUbicacion = viajesHoy.reduce((grupos, entrega) => {
        const ubicacion = entrega.destino_ubicacion || entrega.destino_nombre;
        
        if (!grupos[ubicacion]) {
          grupos[ubicacion] = {};
        }
        
        const camionKey = `${entrega.camion_nombre}${entrega.camion_placa ? ` (${entrega.camion_placa})` : ''}`;
        
        if (!grupos[ubicacion][camionKey]) {
          grupos[ubicacion][camionKey] = 0;
        }
        
        // Sumar la cantidad de entregas
        grupos[ubicacion][camionKey] += entrega.cantidad || 1;
        
        return grupos;
      }, {});

      return viajesPorUbicacion;
    } catch (error) {
      console.error('Error obteniendo viajes del día:', error);
      throw error;
    }
  },

  // Generar HTML para el reporte
  generarHTMLReporte: (viajesPorUbicacion, fecha) => {
    const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let ubicacionesHTML = '';
    
    if (Object.keys(viajesPorUbicacion).length === 0) {
      ubicacionesHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #666;">
          <div style="background-color: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 12px; padding: 30px; margin: 20px 0;">
            <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
            <h3 style="color: #495057; margin: 0 0 10px 0; font-size: 18px;">Sin registros del día</h3>
            <p style="margin: 0; font-size: 14px; color: #6c757d;">No se encontraron viajes realizados para el día de hoy.</p>
          </div>
        </div>
      `;
    } else {
      Object.entries(viajesPorUbicacion).forEach(([ubicacion, camiones]) => {
        ubicacionesHTML += `
          <div style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; page-break-inside: avoid;">
            <div style="background-color: #2196F3; color: white; padding: 10px 15px;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${ubicacion}</h3>
            </div>
            <div style="padding: 15px;">
              <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
        `;
        
        Object.entries(camiones).forEach(([camion, viajes]) => {
          ubicacionesHTML += `
            <li style="margin-bottom: 6px; font-size: 13px;">
              <strong>${camion}</strong> - ${viajes} viaje${viajes > 1 ? 's' : ''}
            </li>
          `;
        });
        
        ubicacionesHTML += `
              </ul>
            </div>
          </div>
        `;
      });
    }

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Viajes</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: #333;
            font-size: 14px;
            line-height: 1.4;
          }
          .container {
            max-width: 100%;
            margin: 0 auto;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 22px;
            font-weight: 700;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 20px;
          }
          .footer {
            text-align: center;
            padding: 15px;
            background-color: #f8f9fa;
            color: #666;
            font-size: 11px;
            border-top: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reporte de Viajes Realizados</h1>
            <p>${fechaFormateada}</p>
          </div>
          <div class="content">
            ${ubicacionesHTML}
          </div>
          <div class="footer">
            <p>Generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Generar PDF del reporte
  generarPDFReporte: async () => {
    try {
      console.log('📊 Obteniendo datos del día...');
      const fechaHoy = new Date().toISOString().split('T')[0];
      const viajesPorUbicacion = await reporteService.getViajesDelDia();
      
      console.log('📄 Generando HTML...');
      const htmlContent = reporteService.generarHTMLReporte(viajesPorUbicacion, fechaHoy);
      
      console.log('🖨️ Convirtiendo a PDF...');
      
      // Generar nombre del archivo con la fecha actual
      const fechaParaArchivo = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-'); // Cambiar / por - para compatibilidad de archivos
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        fileName: `reporte-viajes-${fechaParaArchivo}.pdf`
      });

      console.log('✅ PDF generado en:', uri);
      return uri;
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  },

  // Compartir reporte por WhatsApp
  compartirPorWhatsApp: async (pdfUri) => {
    try {
      const fechaHoy = new Date().toLocaleDateString('es-ES');
      
      if (Platform.OS === 'android') {
        // En Android podemos usar sharing directo con WhatsApp
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          await Sharing.shareAsync(pdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: `Reporte de Viajes - ${fechaHoy}`,
          });
        } else {
          throw new Error('Sharing no está disponible');
        }
      } else {
        // En iOS también usamos sharing
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Reporte de Viajes - ${fechaHoy}`,
        });
      }
    } catch (error) {
      console.error('Error compartiendo por WhatsApp:', error);
      throw error;
    }
  },

  // Función principal para generar y compartir reporte
  generarYCompartirReporte: async () => {
    try {
      console.log('🔄 Verificando datos del día...');
      const viajesPorUbicacion = await reporteService.getViajesDelDia();
      
      // Verificar si hay datos para reportar
      if (Object.keys(viajesPorUbicacion).length === 0) {
        console.log('📋 No hay registros del día');
        return { 
          success: false, 
          error: 'No hay viajes registrados para el día de hoy. El reporte estará vacío.',
          isEmpty: true 
        };
      }
      
      console.log('🔄 Generando reporte PDF...');
      const pdfUri = await reporteService.generarPDFReporte();
      
      console.log('📱 Compartiendo reporte...');
      await reporteService.compartirPorWhatsApp(pdfUri);
      
      return { success: true, uri: pdfUri };
    } catch (error) {
      console.error('❌ Error en generarYCompartirReporte:', error);
      return { success: false, error: error.message };
    }
  }
};