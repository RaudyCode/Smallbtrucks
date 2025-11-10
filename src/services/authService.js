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

// Importar Google Sign-In solo si está disponible
let GoogleSignin;
try {
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;
  
  // Configurar Google Sign-In solo si está disponible
  GoogleSignin.configure({
    webClientId: '687559260753-REEMPLAZA_CON_TU_WEB_CLIENT_ID.apps.googleusercontent.com', // Ver GOOGLE_SIGNIN_SETUP.md
  });
  console.log('✅ Google Sign-In configurado correctamente');
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
      console.log('📱 Sesión persistirá automáticamente en React Native');
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
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
      
      // Verificar si Google Play Services está disponible
      await GoogleSignin.hasPlayServices();
      
      // Obtener información del usuario de Google
      const userInfo = await GoogleSignin.signIn();
      
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
    } catch (error) {
      console.error('❌ Error con Google Sign-In:', error);
      
      if (error.code === 'sign_in_cancelled') {
        throw { message: 'Inicio de sesión cancelado', code: 'google/cancelled' };
      } else if (error.code === 'in_progress') {
        throw { message: 'Operación en progreso', code: 'google/in_progress' };
      } else if (error.code === 'play_services_not_available') {
        throw { message: 'Google Play Services no disponible', code: 'google/play_services' };
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
