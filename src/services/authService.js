import { auth } from '../config/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

export const authService = {
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

  // Cerrar sesión
  logout: async () => {
    try {
      console.log('👋 Cerrando sesión...');
      await signOut(auth);
      console.log('✅ Sesión cerrada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      throw error;
    }
  },

  // Recuperar contraseña
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
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
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
    };

    const message = errorMessages[error.code] || error.message;
    return new Error(message);
  },
};
