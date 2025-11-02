import React from 'react';
import { Text, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// App Screens
import HomeScreen from '../screens/HomeScreen';
import CamionListScreen from '../screens/CamionListScreen';
import AddCamionScreen from '../screens/AddCamionScreen';
import CamionDetailScreen from '../screens/CamionDetailScreen';
import DestinoListScreen from '../screens/DestinoListScreen';
import AddDestinoScreen from '../screens/AddDestinoScreen';
import DuenoListScreen from '../screens/DuenoListScreen';
import AddDuenoScreen from '../screens/AddDuenoScreen';
import DuenoDetailScreen from '../screens/DuenoDetailScreen';
import AddViajeScreen from '../screens/AddViajeScreen';
import ViajesProgramadosScreen from '../screens/ViajesProgramadosScreen';
import HistorialScreen from '../screens/HistorialScreen';
import BackupScreen from '../screens/BackupScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  // Obtener los insets del dispositivo (safe area)
  const insets = useSafeAreaInsets();
  
  // Calcular altura dinámica de la TabBar respetando el área segura
  const tabBarHeight = Platform.select({
    ios: 49 + insets.bottom, // Altura base + bottom inset para iOS (notch/gestos)
    android: Math.max(60, 60 + insets.bottom), // Altura base + bottom inset para Android
  });

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          // Altura dinámica que respeta el área segura
          height: tabBarHeight,
          // Padding superior para separar íconos del borde
          paddingTop: 8,
          // Padding inferior dinámico: usa el inset del dispositivo + espacio adicional
          paddingBottom: Platform.select({
            ios: insets.bottom > 0 ? insets.bottom : 10, // Si hay notch, usa el inset, sino 10px
            android: Math.max(insets.bottom, 10), // Mínimo 10px, o el inset si es mayor
          }),
          // Padding horizontal para los íconos
          paddingHorizontal: 5,
          // Estilos visuales (sin cambios)
          backgroundColor: colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: colors.border.primary,
          elevation: 0,
          // Posición absoluta para que no empuje el contenido hacia arriba
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
          marginTop: -5,
          // Margin bottom ajustado para que el texto no se pegue al borde
          marginBottom: Platform.select({
            ios: 0,
            android: 2,
          }),
        },
        // Configuración para que las screens respeten el espacio de la TabBar
        tabBarHideOnKeyboard: true, // Ocultar TabBar cuando aparece el teclado
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="view-dashboard-outline" 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Viajes"
        component={ViajesProgramadosScreen}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="truck-delivery-outline" 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Historial"
        component={HistorialScreen}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="calendar-clock-outline" 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Respaldo"
        component={BackupScreen}
        options={{
          tabBarLabel: 'Respaldo',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name="cloud-sync-outline" 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Navegador de Autenticación
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Navegador Principal
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.brand.primary,
        },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: {
          fontFamily: 'Poppins-SemiBold',
          fontSize: 18,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CamionList"
        component={CamionListScreen}
        options={{ title: 'Gestión de Camiones' }}
      />
      <Stack.Screen
        name="AddCamion"
        component={AddCamionScreen}
        options={{ title: 'Registrar Camión' }}
      />
      <Stack.Screen
        name="CamionDetail"
        component={CamionDetailScreen}
        options={{ title: 'Detalle del Camión' }}
      />
      <Stack.Screen
        name="DestinoList"
        component={DestinoListScreen}
        options={{ title: 'Gestión de Destinos' }}
      />
      <Stack.Screen
        name="AddDestino"
        component={AddDestinoScreen}
        options={{ title: 'Registrar Destino' }}
      />
      <Stack.Screen
        name="DuenoList"
        component={DuenoListScreen}
        options={{ title: 'Gestión de Dueños' }}
      />
      <Stack.Screen
        name="AddDueno"
        component={AddDuenoScreen}
        options={{ title: 'Registrar Dueño' }}
      />
      <Stack.Screen
        name="DuenoDetail"
        component={DuenoDetailScreen}
        options={{ title: 'Detalle del Dueño' }}
      />
      <Stack.Screen
        name="AddViaje"
        component={AddViajeScreen}
        options={{ title: 'Programar Pedido' }}
      />
    </Stack.Navigator>
  );
}

// Root Navigator - Maneja autenticación
export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AppStack /> : <AuthStack />;
}
