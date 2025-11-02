/**
 * 🧪 TEST DE AUTENTICACIÓN CON GOOGLE DRIVE
 * 
 * Este script te ayuda a probar el flujo de autenticación paso a paso
 * y verificar que todo esté configurado correctamente.
 */

import googleDriveService from '../src/services/googleDriveService';

// ═══════════════════════════════════════════════════════════════
// 🧪 TESTS
// ═══════════════════════════════════════════════════════════════

/**
 * Test 1: Verificar inicialización
 */
export async function testInitialization() {
  console.log('\n🧪 TEST 1: Inicialización del servicio\n');
  
  try {
    const result = await googleDriveService.initialize();
    
    if (result) {
      console.log('✅ Servicio inicializado - Token guardado encontrado');
      return true;
    } else {
      console.log('ℹ️  Servicio inicializado - Sin token guardado (primera vez)');
      return false;
    }
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    return false;
  }
}

/**
 * Test 2: Verificar autenticación
 */
export async function testAuthentication() {
  console.log('\n🧪 TEST 2: Estado de autenticación\n');
  
  try {
    const isAuth = await googleDriveService.isAuthenticated();
    
    if (isAuth) {
      console.log('✅ Usuario autenticado');
      return true;
    } else {
      console.log('⚠️  Usuario NO autenticado - Necesita iniciar sesión');
      return false;
    }
  } catch (error) {
    console.error('❌ Error al verificar autenticación:', error);
    return false;
  }
}

/**
 * Test 3: Intentar autenticar
 */
export async function testLogin() {
  console.log('\n🧪 TEST 3: Proceso de autenticación\n');
  console.log('IMPORTANTE: Este test abrirá un navegador para iniciar sesión\n');
  
  try {
    console.log('🔐 Iniciando proceso de autenticación...');
    console.log('📱 Se abrirá el navegador en unos segundos...\n');
    
    const result = await googleDriveService.authenticate();
    
    if (result.success) {
      console.log('\n✅ AUTENTICACIÓN EXITOSA');
      console.log('Token guardado correctamente\n');
      return true;
    } else {
      console.log('\n❌ AUTENTICACIÓN FALLIDA');
      console.log('Error:', result.error);
      console.log('\n📝 Revisa las instrucciones en los logs anteriores\n');
      return false;
    }
  } catch (error) {
    console.error('\n❌ Error durante autenticación:', error);
    return false;
  }
}

/**
 * Test 4: Buscar archivo de respaldo
 */
export async function testFindBackupFile() {
  console.log('\n🧪 TEST 4: Buscar archivo de respaldo en Drive\n');
  
  try {
    const fileInfo = await googleDriveService.findBackupFile();
    
    if (fileInfo) {
      console.log('✅ Archivo de respaldo encontrado:');
      console.log('  • ID:', fileInfo.id);
      console.log('  • Nombre:', fileInfo.name);
      console.log('  • Modificado:', new Date(fileInfo.modifiedTime).toLocaleString());
      console.log('  • Tamaño:', fileInfo.size, 'bytes\n');
      return true;
    } else {
      console.log('ℹ️  No se encontró archivo de respaldo (primera vez)\n');
      return false;
    }
  } catch (error) {
    if (error.message.includes('autenticado')) {
      console.log('⚠️  Usuario no autenticado - Ejecuta testLogin() primero\n');
    } else {
      console.error('❌ Error al buscar archivo:', error.message);
    }
    return false;
  }
}

/**
 * Test 5: Subir respaldo de prueba
 */
export async function testUploadBackup() {
  console.log('\n🧪 TEST 5: Subir respaldo de prueba\n');
  
  const testData = {
    timestamp: new Date().toISOString(),
    test: true,
    camiones: [
      { id: 1, nombre: 'F1-TEST', dueno: 'Test Owner' }
    ],
    destinos: [
      { id: 1, nombre: 'Test Destination', ubicacion: 'Test Location' }
    ],
    viajes: []
  };
  
  try {
    console.log('☁️  Subiendo respaldo de prueba...');
    
    const result = await googleDriveService.uploadBackup(testData);
    
    if (result.success) {
      console.log('\n✅ RESPALDO SUBIDO EXITOSAMENTE');
      console.log('  • File ID:', result.fileId);
      console.log('  • Mensaje:', result.message);
      console.log('  • Nuevo archivo:', result.isNew ? 'Sí' : 'No (actualizado)');
      console.log('');
      return true;
    } else {
      console.log('\n❌ ERROR AL SUBIR RESPALDO');
      console.log('  • Error:', result.error);
      if (result.needsAuth) {
        console.log('  • Necesita reautenticar: Sí');
      }
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('\n❌ Error al subir respaldo:', error.message);
    return false;
  }
}

/**
 * Test 6: Descargar respaldo
 */
export async function testDownloadBackup() {
  console.log('\n🧪 TEST 6: Descargar respaldo desde Drive\n');
  
  try {
    console.log('📥 Descargando respaldo...');
    
    const result = await googleDriveService.downloadBackup();
    
    if (result.success) {
      console.log('\n✅ RESPALDO DESCARGADO EXITOSAMENTE');
      console.log('  • Datos:', JSON.stringify(result.data, null, 2));
      console.log('  • Modificado:', new Date(result.fileInfo.modifiedTime).toLocaleString());
      console.log('  • Tamaño:', result.fileInfo.size, 'bytes');
      console.log('');
      return true;
    } else {
      console.log('\n❌ ERROR AL DESCARGAR RESPALDO');
      console.log('  • Error:', result.error);
      if (result.needsAuth) {
        console.log('  • Necesita reautenticar: Sí');
      }
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('\n❌ Error al descargar respaldo:', error.message);
    return false;
  }
}

/**
 * Test 7: Obtener información del respaldo
 */
export async function testGetBackupInfo() {
  console.log('\n🧪 TEST 7: Obtener información del respaldo\n');
  
  try {
    const info = await googleDriveService.getBackupInfo();
    
    if (info) {
      console.log('✅ Información del respaldo:');
      console.log('  • Último respaldo:', info.lastBackup.toLocaleString());
      console.log('  • Tamaño:', info.size, 'bytes');
      console.log('  • File ID:', info.fileId);
      console.log('');
      return true;
    } else {
      console.log('ℹ️  No hay información de respaldo disponible\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Error al obtener información:', error.message);
    return false;
  }
}

/**
 * Test 8: Cerrar sesión
 */
export async function testLogout() {
  console.log('\n🧪 TEST 8: Cerrar sesión\n');
  
  try {
    console.log('🚪 Cerrando sesión...');
    
    const result = await googleDriveService.logout();
    
    if (result.success) {
      console.log('✅ Sesión cerrada correctamente');
      console.log('Tokens eliminados de AsyncStorage\n');
      return true;
    } else {
      console.log('❌ Error al cerrar sesión:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// 🎯 SUITE DE TESTS COMPLETA
// ═══════════════════════════════════════════════════════════════

/**
 * Ejecutar todos los tests en secuencia
 */
export async function runAllTests() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 INICIANDO SUITE DE TESTS DE GOOGLE DRIVE');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const results = {
    initialization: false,
    authentication: false,
    login: false,
    findFile: false,
    upload: false,
    download: false,
    info: false,
    logout: false,
  };
  
  // Test 1: Inicialización
  results.initialization = await testInitialization();
  await sleep(1000);
  
  // Test 2: Estado de autenticación
  results.authentication = await testAuthentication();
  await sleep(1000);
  
  // Si no está autenticado, intentar login
  if (!results.authentication) {
    console.log('\n⚠️  Usuario no autenticado. Iniciando proceso de login...\n');
    results.login = await testLogin();
    await sleep(2000);
    
    if (!results.login) {
      console.log('\n❌ No se pudo autenticar. Deteniendo tests.\n');
      printResults(results);
      return results;
    }
  }
  
  // Test 4: Buscar archivo
  results.findFile = await testFindBackupFile();
  await sleep(1000);
  
  // Test 5: Subir respaldo
  results.upload = await testUploadBackup();
  await sleep(1000);
  
  // Test 6: Descargar respaldo
  results.download = await testDownloadBackup();
  await sleep(1000);
  
  // Test 7: Obtener info
  results.info = await testGetBackupInfo();
  await sleep(1000);
  
  // Test 8: Cerrar sesión (opcional)
  // Descomenta si quieres probar logout
  // results.logout = await testLogout();
  
  printResults(results);
  return results;
}

/**
 * Ejecutar solo tests básicos (sin subir/bajar archivos)
 */
export async function runBasicTests() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 TESTS BÁSICOS DE AUTENTICACIÓN');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const results = {};
  
  results.initialization = await testInitialization();
  await sleep(1000);
  
  results.authentication = await testAuthentication();
  await sleep(1000);
  
  if (!results.authentication) {
    results.login = await testLogin();
  }
  
  printResults(results);
  return results;
}

// ═══════════════════════════════════════════════════════════════
// 🛠️ UTILIDADES
// ═══════════════════════════════════════════════════════════════

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function printResults(results) {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 RESULTADOS DE LOS TESTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  let passed = 0;
  let total = 0;
  
  for (const [test, result] of Object.entries(results)) {
    total++;
    if (result) passed++;
    
    const icon = result ? '✅' : '❌';
    const status = result ? 'PASS' : 'FAIL';
    console.log(`${icon} ${test.toUpperCase().padEnd(20)} - ${status}`);
  }
  
  console.log('');
  console.log(`Total: ${passed}/${total} tests pasados`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// 📖 USO
// ═══════════════════════════════════════════════════════════════

/**
 * Para usar estos tests:
 * 
 * 1. Desde un componente React:
 * 
 *    import { runAllTests, runBasicTests, testLogin } from './test-google-auth';
 * 
 *    // Ejecutar todos los tests
 *    await runAllTests();
 * 
 *    // Solo tests básicos
 *    await runBasicTests();
 * 
 *    // Test individual
 *    await testLogin();
 * 
 * 
 * 2. Desde la consola de Node (con expo):
 * 
 *    // Agregar un botón temporal en tu app:
 *    <Button title="Test Auth" onPress={runAllTests} />
 * 
 * 
 * 3. Orden recomendado para primera vez:
 * 
 *    await testInitialization();  // Verifica si hay token guardado
 *    await testAuthentication();  // Verifica si está autenticado
 *    await testLogin();           // Inicia sesión si no está autenticado
 *    await testFindBackupFile();  // Busca respaldo existente
 *    await testUploadBackup();    // Sube respaldo de prueba
 *    await testDownloadBackup();  // Descarga y verifica
 *    await testGetBackupInfo();   // Obtiene información
 */
