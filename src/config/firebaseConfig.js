import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';

// Tu configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD7M_wxF0MFd6HwYKOtnC7EacbuzGvSYKQ",
  authDomain: "smallbtrucks-a2673.firebaseapp.com",
  projectId: "smallbtrucks-a2673",
  storageBucket: "smallbtrucks-a2673.firebasestorage.app",
  messagingSenderId: "687559260753",
  appId: "1:687559260753:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Para React Native, Firebase Auth maneja la persistencia automáticamente
// Solo necesitamos asegurarnos de usar getAuth correctamente
let auth;
try {
  auth = getAuth(app);
  console.log('✅ Firebase Auth inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase Auth:', error);
  auth = getAuth(app);
}

// Inicializar servicios
export const storage = getStorage(app);
export { auth };

export default app;
