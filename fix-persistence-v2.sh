#!/bin/bash
echo "🔧 Configurando persistencia de sesión - Versión Corregida..."

# Limpiar cache
echo "🧹 Limpiando cache..."
expo r -c

echo "✅ Configuración simplificada completada!"
echo ""
echo "📱 Cambios implementados:"
echo "   ✓ Firebase Auth nativo para React Native"
echo "   ✓ Persistencia automática (sin dependencias extra)"
echo "   ✓ Permisos de red y wake lock en Android"
echo "   ✓ Timeout extendido para inicialización"
echo "   ✓ Logs mejorados para debug"
echo "   ✓ Removido AsyncStorage (causaba plugin error)"
echo ""
echo "🚀 Para construir APK con persistencia:"
echo "   eas build --platform android --profile production"
echo ""
echo "🎯 Firebase Auth mantiene la sesión automáticamente en apps compiladas"
echo "   - En Expo Go puede requerir relogin ocasional"
echo "   - En APK compilada la persistencia es completa"