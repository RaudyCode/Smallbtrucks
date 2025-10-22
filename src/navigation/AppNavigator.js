import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CamionListScreen from '../screens/CamionListScreen';
import AddCamionScreen from '../screens/AddCamionScreen';
import CamionDetailScreen from '../screens/CamionDetailScreen';
import DestinoListScreen from '../screens/DestinoListScreen';
import AddDestinoScreen from '../screens/AddDestinoScreen';
import AddViajeScreen from '../screens/AddViajeScreen';
import ViajesProgramadosScreen from '../screens/ViajesProgramadosScreen';
import HistorialScreen from '../screens/HistorialScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Viajes"
        component={ViajesProgramadosScreen}
        options={{
          tabBarLabel: 'Viajes',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🚛</Text>,
        }}
      />
      <Tab.Screen
        name="Historial"
        component={HistorialScreen}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📅</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
        name="AddViaje"
        component={AddViajeScreen}
        options={{ title: 'Registrar Viaje' }}
      />
    </Stack.Navigator>
  );
}
