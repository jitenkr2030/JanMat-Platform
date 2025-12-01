/**
 * Authentication Context for JanMat App
 * Handles anonymous user creation and session management
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import Toast from 'react-native-simple-toast';

const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: action.payload
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      };

    case 'UPDATE_USER_LOCATION':
      return {
        ...state,
        user: {
          ...state.user,
          location: action.payload
        }
      };

    case 'UPDATE_USER_DEMOGRAPHICS':
      return {
        ...state,
        user: {
          ...state.user,
          demographics: action.payload
        }
      };

    default:
      return state;
  }
};

// Generate anonymous user
const generateAnonymousUser = () => {
  const userId = `anon_${uuidv4()}`;
  const sessionId = uuidv4();

  return {
    userId,
    sessionId,
    isAnonymous: true,
    createdAt: new Date().toISOString(),
    location: null,
    demographics: {
      state: null,
      city: null,
      ageGroup: null,
      gender: null
    }
  };
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Check if user already exists in storage
      const storedUser = await AsyncStorage.getItem('janmat_user');
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        // Create new anonymous user
        const newUser = generateAnonymousUser();
        await AsyncStorage.setItem('janmat_user', JSON.stringify(newUser));
        dispatch({ type: 'AUTH_SUCCESS', payload: newUser });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Failed to initialize authentication' });
    }
  };

  // Update user location
  const updateUserLocation = async (location) => {
    try {
      const updatedUser = {
        ...state.user,
        location
      };

      await AsyncStorage.setItem('janmat_user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER_LOCATION', payload: location });
      
      Toast.show('Location updated successfully');
    } catch (error) {
      console.error('Update location error:', error);
      Toast.show('Failed to update location');
    }
  };

  // Update user demographics
  const updateUserDemographics = async (demographics) => {
    try {
      const updatedUser = {
        ...state.user,
        demographics: {
          ...state.user.demographics,
          ...demographics
        }
      };

      await AsyncStorage.setItem('janmat_user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER_DEMOGRAPHICS', payload: demographics });
      
      Toast.show('Profile updated successfully');
    } catch (error) {
      console.error('Update demographics error:', error);
      Toast.show('Failed to update profile');
    }
  };

  // Anonymous user registration with basic info
  const registerAnonymousUser = async (userData) => {
    try {
      const updatedUser = {
        ...state.user,
        ...userData,
        isAnonymous: false
      };

      await AsyncStorage.setItem('janmat_user', JSON.stringify(updatedUser));
      dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser });
      
      Toast.show('Profile created successfully');
      return updatedUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to create profile');
    }
  };

  // Logout (clear anonymous user)
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('janmat_user');
      dispatch({ type: 'AUTH_LOGOUT' });
      
      // Create new anonymous user
      const newUser = generateAnonymousUser();
      await AsyncStorage.setItem('janmat_user', JSON.stringify(newUser));
      dispatch({ type: 'AUTH_SUCCESS', payload: newUser });
      
      Toast.show('Session reset');
    } catch (error) {
      console.error('Logout error:', error);
      Toast.show('Failed to logout');
    }
  };

  // Get user ID for API calls
  const getUserId = () => {
    return state.user?.userId;
  };

  // Get user location for API calls
  const getUserLocation = () => {
    return state.user?.location || state.user?.demographics || {};
  };

  // Check if user has completed profile
  const hasCompletedProfile = () => {
    const demographics = state.user?.demographics;
    if (!demographics) return false;
    
    return demographics.state && demographics.city && demographics.ageGroup && demographics.gender;
  };

  // Get anonymous session ID
  const getSessionId = () => {
    return state.user?.sessionId;
  };

  const value = {
    ...state,
    updateUserLocation,
    updateUserDemographics,
    registerAnonymousUser,
    logout,
    getUserId,
    getUserLocation,
    hasCompletedProfile,
    getSessionId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};