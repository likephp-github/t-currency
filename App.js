import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './src/contexts/AppContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CurrencySelectionScreen from './src/screens/CurrencySelectionScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MoreSettingsScreen from './src/screens/MoreSettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right'
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen 
            name="CurrencySelection" 
            component={CurrencySelectionScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }}
          />
          <Stack.Screen 
            name="MoreSettings" 
            component={MoreSettingsScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
