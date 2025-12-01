/**
 * JanMat Mobile App - Main Entry Point
 * Public Opinion & Citizen Voice App for India
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-simple-toast';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import CreateScreen from './src/screens/CreateScreen';
import CommunitiesScreen from './src/screens/CommunitiesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PollDetailScreen from './src/screens/PollDetailScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import PetitionDetailScreen from './src/screens/PetitionDetailScreen';
import CreatePetitionScreen from './src/screens/CreatePetitionScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import services and contexts
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import SocketService from './src/services/SocketService';
import NotificationService from './src/services/NotificationService';

// Import theme
import { theme } from './src/theme/theme';

// Initialize services
SocketService.initialize();
NotificationService.initialize();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Explore':
              iconName = 'explore';
              break;
            case 'Create':
              iconName = 'add-circle';
              break;
            case 'Communities':
              iconName = 'group';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.neutral[400],
        tabBarStyle: {
          backgroundColor: theme.colors.neutral[0],
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          paddingBottom: 5,
          paddingTop: 5,
          height: 60
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500'
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.neutral[200]
        },
        headerTintColor: theme.colors.neutral[0],
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18
        }
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'JanMat',
          headerTitle: '🇮🇳 JanMat'
        }} 
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{ title: 'Explore' }} 
      />
      <Tab.Screen 
        name="Create" 
        component={CreateScreen} 
        options={{ title: 'Create' }} 
      />
      <Tab.Screen 
        name="Communities" 
        component={CommunitiesScreen} 
        options={{ title: 'Communities' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0
        },
        headerTintColor: theme.colors.neutral[0],
        headerTitleStyle: {
          fontWeight: '600'
        }
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PollDetail" 
        component={PollDetailScreen}
        options={{ title: 'Poll Details' }}
      />
      <Stack.Screen 
        name="Results" 
        component={ResultsScreen}
        options={{ title: 'Results' }}
      />
      <Stack.Screen 
        name="PetitionDetail" 
        component={PetitionDetailScreen}
        options={{ title: 'Petition' }}
      />
      <Stack.Screen 
        name="CreatePetition" 
        component={CreatePetitionScreen}
        options={{ title: 'Create Petition' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // App initialization
    console.log('🚀 JanMat App Starting...');
    
    // Set up global error handler
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('Global Error:', error);
      Toast.show('An error occurred. Please restart the app.', Toast.LONG);
    });

    return () => {
      // Cleanup on app close
      SocketService.disconnect();
    };
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <NavigationContainer>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor={theme.colors.primary}
            translucent={false}
          />
          <AppStack />
        </NavigationContainer>
      </NotificationProvider>
    </AuthProvider>
  );
}