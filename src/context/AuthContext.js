import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observar cambios en el estado de autenticación
    const unsubscribe = authService.onAuthChange((authUser) => {
      console.log('🔄 Auth state changed:', authUser ? authUser.email : 'No user');
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    return result;
  };

  const register = async (email, password, displayName) => {
    const result = await authService.register(email, password, displayName);
    return result;
  };

  const logout = async () => {
    await authService.logout();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
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
  },
});
