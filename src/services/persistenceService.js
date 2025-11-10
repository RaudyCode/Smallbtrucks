import { auth } from '../config/firebaseConfig';

export const persistenceService = {
  // Verificar si Firebase Auth mantiene la sesión
  checkAuthState: () => {
    const currentUser = auth.currentUser;
    console.log('� Firebase currentUser:', currentUser ? `${currentUser.email} (${currentUser.uid})` : 'No user');
    return currentUser;
  },

  // Verificar estado completo de autenticación
  verifyAuthPersistence: () => {
    const user = auth.currentUser;
    
    if (user) {
      console.log('✅ Usuario autenticado:', user.email);
      console.log('📱 Firebase Auth está funcionando correctamente');
      return {
        isAuthenticated: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }
      };
    } else {
      console.log('❌ No hay usuario autenticado');
      return {
        isAuthenticated: false,
        user: null
      };
    }
  },

  // Debug de persistencia simplificado
  debugPersistence: () => {
    console.log('🔍 === DEBUG PERSISTENCIA ===');
    
    const authState = persistenceService.verifyAuthPersistence();
    console.log('Estado de autenticación:', authState);
    
    // En React Native, Firebase Auth debe persistir automáticamente
    if (authState.isAuthenticated) {
      console.log('🎯 PERSISTENCIA OK: Firebase Auth mantiene la sesión');
    } else {
      console.log('⚠️ PERSISTENCIA ISSUE: Usuario no autenticado');
    }
    
    return authState;
  },

  // Forzar verificación de estado
  forceAuthCheck: () => {
    return new Promise((resolve) => {
      // Firebase Auth debería tener el estado disponible inmediatamente
      setTimeout(() => {
        const state = persistenceService.verifyAuthPersistence();
        resolve(state);
      }, 100);
    });
  }
};