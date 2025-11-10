import { auth } from '../config/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { persistenceService } from './persistenceService';

// Importar Google Sign-In solo si está disponible
let GoogleSignin;
try {
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;
  
  // Configurar Google Sign-In - REQUIERE configuración en Firebase Console
  GoogleSignin.configure({
    // IMPORTANTE: Estos son IDs temporales - DEBEN reemplazarse con los reales de Firebase Console
    webClientId: '1:687559260753:web:95f89217e877b4f460d670', // ⚠️ TEMPORAL - Ver GOOGLE_SIGNIN_FIX.md
    scopes: ['profile', 'email'],
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  });
  console.log('⚠️ Google Sign-In configurado con IDs temporales - Ver GOOGLE_SIGNIN_FIX.md para configuración real');
} catch (error) {
  console.log('⚠️ Google Sign-In no disponible en Expo Go:', error.message);
  GoogleSignin = null;
}

export const authService = {
  // Verificar si hay una sesión activa
  checkCurrentUser: () => {
    const user = auth.currentUser;
    console.log('🔍 Verificando usuario actual:', user ? `${user.email} (${user.uid})` : 'No hay usuario');
    return user;
  },

  // Registrar nuevo usuario
  register: async (email, password, displayName) => {
    try {
      console.log('📝 Registrando nuevo usuario:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Actualizar nombre de usuario
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      console.log('✅ Usuario registrado exitosamente:', user.uid);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || displayName,
        },
      };
    } catch (error) {
      console.error('❌ Error registrando usuario:', error);
      throw authService.getErrorMessage(error);
    }
  },

  // Iniciar sesión
  login: async (email, password) => {
    try {
      console.log('🔐 Iniciando sesión:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Sesión iniciada exitosamente:', user.uid);
      console.log('📱 Firebase Auth persistirá la sesión automáticamente en React Native');
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
      
      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error('❌ Error iniciando sesión:', error);
      throw authService.getErrorMessage(error);
    }
  },

  // Iniciar sesión con Google
  loginWithGoogle: async () => {
    try {
      if (!GoogleSignin) {
        throw { 
          message: 'Google Sign-In no está disponible en Expo Go. Usa "npx expo run:android" para probarlo.', 
          code: 'google/not_available' 
        };
      }

      console.log('🔐 Iniciando sesión con Google...');
      
      // Verificar configuración
      console.log('🔍 Verificando configuración de Google Sign-In...');
      
      try {
        // Verificar si Google Play Services está disponible
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        console.log('✅ Google Play Services disponible');
      } catch (playServicesError) {
        console.error('❌ Google Play Services error:', playServicesError);
        throw { 
          message: 'Google Play Services no disponible o desactualizado', 
          code: 'google/play_services_error',
          originalError: playServicesError
        };
      }
      
      try {
        // Obtener información del usuario de Google
        console.log('📱 Iniciando proceso de sign-in...');
        const userInfo = await GoogleSignin.signIn();
        console.log('✅ UserInfo obtenido:', userInfo.user?.email);
        
        if (!userInfo.idToken) {
          throw { 
            message: 'No se pudo obtener el token de Google. Verifica la configuración en Firebase Console.', 
            code: 'google/no_token' 
          };
        }
        
        // Crear credencial de Firebase con el token de Google
        const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
        
        // Iniciar sesión en Firebase con la credencial de Google
        const userCredential = await signInWithCredential(auth, googleCredential);
        const user = userCredential.user;
        
        console.log('✅ Sesión con Google iniciada exitosamente:', user.uid);
        console.log('📱 Sesión persistirá automáticamente');
        
        return {
          success: true,
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
        };
        
      } catch (signInError) {
        console.error('❌ Error en Google Sign-In:', signInError);
        
        // Manejo específico de errores de Google Sign-In
        if (signInError.code === 'sign_in_cancelled') {
          throw { message: 'Inicio de sesión cancelado', code: 'google/cancelled' };
        } else if (signInError.code === 'in_progress') {
          throw { message: 'Operación en progreso', code: 'google/in_progress' };
        } else if (signInError.code === 'play_services_not_available') {
          throw { message: 'Google Play Services no disponible', code: 'google/play_services' };
        } else if (signInError.message?.includes('DEVELOPER_ERROR')) {
          throw { 
            message: 'Error de configuración: Verifica el webClientId en Firebase Console. Ve a Authentication > Sign-in method > Google > Configuración web SDK.', 
            code: 'google/developer_error',
            originalError: signInError
          };
        }
        
        throw signInError;
      }
      
    } catch (error) {
      console.error('❌ Error completo con Google Sign-In:', error);
      
      if (error.code?.startsWith('google/')) {
        throw error; // Ya tiene formato correcto
      }
      
      throw authService.getErrorMessage(error);
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Cerrar sesión de Google si está activa
      try {
        if (GoogleSignin) {
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (isSignedIn) {
            await GoogleSignin.signOut();
            console.log('✅ Sesión de Google cerrada');
          }
        }
      } catch (googleError) {
        console.log('⚠️ No hay sesión de Google activa o no está disponible');
      }
      
      // Cerrar sesión de Firebase
      await signOut(auth);
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      throw authService.getErrorMessage(error);
    }
  },

  // Restablecer contraseña
  resetPassword: async (email) => {
    try {
      console.log('📧 Enviando email de recuperación a:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Email enviado exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw authService.getErrorMessage(error);
    }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = auth.currentUser;
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
    }
    return null;
  },

  // Observador de cambios de autenticación
  onAuthChange: (callback) => {
    return onAuthStateChanged(auth, (user) => {
      console.log('🔄 onAuthStateChanged triggered:', user ? `${user.email} (${user.uid})` : 'null');
      
      if (user) {
        // Usuario logueado - la sesión persiste automáticamente
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        // Usuario no logueado
        callback(null);
      }
    });
  },

  // Mensajes de error en español
  getErrorMessage: (error) => {
    const errorMessages = {
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este correo',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/invalid-api-key': 'Clave API inválida',
      'auth/app-deleted': 'La aplicación ha sido eliminada',
      'auth/invalid-user-token': 'Token de usuario inválido',
      'auth/user-token-expired': 'Token de usuario expirado',
      'auth/null-user': 'No hay usuario logueado',
      'auth/quota-exceeded': 'Cuota excedida',
    };

    const message = errorMessages[error.code] || error.message || 'Error desconocido';
    
    return {
      message,
      code: error.code,
    };
  },
};
