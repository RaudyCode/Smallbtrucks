#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗑️  Eliminando base de datos antigua...\n');

// Rutas posibles donde puede estar la base de datos
const possiblePaths = [
  path.join(__dirname, '.expo', 'data', 'camiones.db'),
  path.join(__dirname, 'data', 'camiones.db'),
];

let deleted = false;

possiblePaths.forEach(dbPath => {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log(`✅ Eliminada: ${dbPath}`);
    deleted = true;
  }
});

if (!deleted) {
  console.log('ℹ️  No se encontró ninguna base de datos local.');
  console.log('   La base de datos se eliminará automáticamente al reiniciar la app.');
}

console.log('\n📝 Instrucciones:');
console.log('   1. Cierra completamente la app en tu dispositivo/emulador');
console.log('   2. Ejecuta: npx expo start --clear');
console.log('   3. Abre la app de nuevo');
console.log('   4. La base de datos se creará con la nueva estructura\n');
console.log('⚠️  Nota: Perderás todos los datos existentes.\n');
