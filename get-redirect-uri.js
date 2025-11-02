// Script temporal para obtener el Redirect URI exacto
const AuthSession = require('expo-auth-session');

console.log('\n═══════════════════════════════════════════════════');
console.log('🔗 REDIRECT URI PARA GOOGLE CLOUD CONSOLE');
console.log('═══════════════════════════════════════════════════\n');

const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true,
});

console.log('📋 Copia esta URL EXACTA y agrégala en:');
console.log('   https://console.cloud.google.com/apis/credentials\n');
console.log('👉 Redirect URI:\n');
console.log('   ' + redirectUri + '\n');
console.log('═══════════════════════════════════════════════════\n');
console.log('⚠️  IMPORTANTE:');
console.log('   1. Ve a Google Cloud Console');
console.log('   2. Edita tu Client ID WEB (NO Android)');
console.log('   3. Agrega esta URL en "URIs de redireccionamiento"');
console.log('   4. Guarda y espera 5 minutos\n');
console.log('═══════════════════════════════════════════════════\n');
