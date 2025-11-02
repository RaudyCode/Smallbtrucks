import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

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

// Inicializar servicios
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
