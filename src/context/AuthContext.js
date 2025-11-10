import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import colors from '../theme/colors';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    console.log('🚀 Inicializando AuthContext...');
    
    // Observar cambios en el estado de autenticación
    const unsubscribe = authService.onAuthChange((authUser) => {
      console.log('🔄 Auth state changed:', authUser ? `${authUser.email} (${authUser.uid})` : 'No user');
      setUser(authUser);
      
      // Solo en la primera carga, marcamos como inicializado
      if (initializing) {
        console.log('✅ Auth inicializado, usuario:', authUser ? 'Logueado' : 'No logueado');
        setInitializing(false);
      }
      
      setLoading(false);
    });

    // Timeout de seguridad por si Firebase no responde
    const timeout = setTimeout(() => {
      console.log('⚠️ Timeout de inicialización, continuando sin usuario');
      if (initializing) {
        setInitializing(false);
        setLoading(false);
      }
    }, 3000); // 3 segundos máximo

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      console.log('✅ Login exitoso en AuthContext');
      return result;
    } catch (error) {
      console.error('❌ Error en login AuthContext:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, displayName) => {
    setLoading(true);
    try {
      const result = await authService.register(email, password, displayName);
      console.log('✅ Registro exitoso en AuthContext');
      return result;
    } catch (error) {
      console.error('❌ Error en registro AuthContext:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await authService.loginWithGoogle();
      console.log('✅ Login con Google exitoso en AuthContext');
      return result;
    } catch (error) {
      console.error('❌ Error en login con Google AuthContext:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      console.log('✅ Logout exitoso en AuthContext');
    } catch (error) {
      console.error('❌ Error en logout AuthContext:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar pantalla de carga solo durante la inicialización
  if (initializing || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={styles.loadingText}>
          {initializing ? 'Verificando sesión...' : 'Cargando...'}
        </Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: colors.text.secondary,
    marginTop: 8,
  },
});
