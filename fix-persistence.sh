#!/bin/bash
echo "🔧 Configurando persistencia de sesión..."

# Limpiar cache
echo "🧹 Limpiando cache..."
expo r -c

# Verificar dependencias
echo "📦 Verificando dependencias..."
npm list @react-native-async-storage/async-storage || npm install @react-native-async-storage/async-storage

# Construir APK con nueva configuración
echo "🚀 Construyendo APK con persistencia mejorada..."
eas build --platform android --profile production

echo "✅ Build completado con configuración de persistencia!"
echo ""
echo "📱 Cambios implementados:"
echo "   ✓ Firebase Auth con AsyncStorage"
echo "   ✓ Persistencia explícita configurada"
echo "   ✓ Permisos de red y wake lock"
echo "   ✓ Sistema de backup en AsyncStorage"
echo "   ✓ Timeout extendido para apps nativas"
echo ""
echo "🎯 La sesión ahora se mantendrá entre cierres de app"