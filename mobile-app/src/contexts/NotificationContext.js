/**
 * Notification Context for JanMat App
 * Handles push notifications and real-time updates
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';
import Toast from 'react-native-simple-toast';
import SocketService from '../services/SocketService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  subscription: null
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload
      };

    case 'SET_SUBSCRIPTION':
      return {
        ...state,
        subscription: action.payload
      };

    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { getUserId } = useAuth();

  // Initialize notification system
  useEffect(() => {
    initializeNotifications();
    setupSocketConnection();

    return () => {
      SocketService.disconnect();
      PushNotification.cancelAllLocalNotifications();
    };
  }, []);

  const initializeNotifications = () => {
    // Configure push notifications
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
        dispatch({ type: 'SET_SUBSCRIPTION', payload: token });
      },

      onNotification: (notification) => {
        console.log('Notification received:', notification);

        if (notification.userInteraction) {
          // User tapped on notification
          handleNotificationInteraction(notification);
        } else {
          // App was in background, show in-app notification
          showInAppNotification(notification);
        }

        // Mark as read if user opened it
        if (notification.userInteraction) {
          dispatch({ type: 'MARK_AS_READ', payload: notification.id });
        }
      },

      onAction: (notification) => {
        console.log('Notification action:', notification.action);
        handleNotificationAction(notification);
      },

      onRegistrationError: (err) => {
        console.error('Notification registration error:', err.message);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios'
    });

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'janmat-notifications',
          channelName: 'JanMat Notifications',
          channelDescription: 'Notifications for JanMat app',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }
  };

  const setupSocketConnection = () => {
    SocketService.connect();

    SocketService.on('connect', () => {
      console.log('Socket connected for notifications');
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      
      const userId = getUserId();
      if (userId) {
        SocketService.emit('join-user-room', userId);
      }
    });

    SocketService.on('disconnect', () => {
      console.log('Socket disconnected');
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    });

    SocketService.on('new-poll', (data) => {
      showNotification({
        title: 'New Poll Available',
        message: data.title,
        type: 'poll',
        data: data
      });
    });

    SocketService.on('poll-results', (data) => {
      showNotification({
        title: 'Poll Results Updated',
        message: `Results available for: ${data.pollTitle}`,
        type: 'results',
        data: data
      });
    });

    SocketService.on('petition-update', (data) => {
      showNotification({
        title: 'Petition Update',
        message: `${data.title} - ${data.update}`,
        type: 'petition',
        data: data
      });
    });

    SocketService.on('urgent-petition', (data) => {
      Alert.alert(
        'Urgent Petition',
        `${data.title}\n\n${data.description?.substring(0, 100)}...`,
        [
          { text: 'View Later', style: 'cancel' },
          { 
            text: 'View Now', 
            onPress: () => handleNotificationAction({ 
              type: 'petition', 
              data 
            })
          }
        ]
      );
    });
  };

  const showNotification = ({ title, message, type, data }) => {
    const notificationId = Date.now().toString();

    const notification = {
      id: notificationId,
      title,
      message,
      type,
      data,
      timestamp: new Date(),
      read: false
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    // Show push notification
    PushNotification.localNotification({
      channelId: 'janmat-notifications',
      title,
      message,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      vibrate: true,
      vibration: 300,
      userInfo: {
        id: notificationId,
        type,
        data
      }
    });

    // Show toast for non-urgent notifications
    if (type !== 'urgent') {
      Toast.show(message, Toast.SHORT);
    }
  };

  const showInAppNotification = (notification) => {
    // Show non-intrusive in-app notification
    const notificationData = {
      id: notification.data?.id || Date.now().toString(),
      title: notification.title,
      message: notification.message,
      type: notification.data?.type || 'info',
      timestamp: new Date(),
      read: false
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notificationData });
  };

  const handleNotificationInteraction = (notification) => {
    const { type, data } = notification.data || {};

    switch (type) {
      case 'poll':
        // Navigate to poll detail
        // Navigation logic would be handled by the component
        console.log('Navigate to poll:', data.pollId);
        break;

      case 'petition':
        // Navigate to petition detail
        console.log('Navigate to petition:', data.petitionId);
        break;

      case 'results':
        // Navigate to results
        console.log('Navigate to results:', data.pollId);
        break;

      default:
        console.log('Unknown notification type:', type);
    }
  };

  const handleNotificationAction = (notification) => {
    const { type, data } = notification;

    switch (type) {
      case 'poll':
        // Handle poll action
        console.log('Poll action:', data);
        break;

      case 'petition':
        // Handle petition action
        console.log('Petition action:', data);
        break;

      default:
        console.log('Unknown action type:', type);
    }
  };

  const markAsRead = (notificationId) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    PushNotification.cancelAllLocalNotifications();
  };

  const scheduleReminder = (title, message, date) => {
    PushNotification.localNotificationSchedule({
      channelId: 'janmat-reminders',
      title,
      message,
      date,
      playSound: true,
      soundName: 'default',
      importance: 'high'
    });
  };

  const cancelScheduledReminders = () => {
    PushNotification.cancelAllLocalNotifications();
  };

  // Utility functions for different notification types
  const notifyNewPoll = (pollData) => {
    showNotification({
      title: 'New Poll',
      message: pollData.title,
      type: 'poll',
      data: pollData
    });
  };

  const notifyPollResults = (resultsData) => {
    showNotification({
      title: 'Results Available',
      message: `Results for: ${resultsData.pollTitle}`,
      type: 'results',
      data: resultsData
    });
  };

  const notifyPetitionUpdate = (petitionData) => {
    showNotification({
      title: 'Petition Update',
      message: petitionData.updateMessage,
      type: 'petition',
      data: petitionData
    });
  };

  const notifyUrgentPetition = (petitionData) => {
    Alert.alert(
      'Urgent Petition Alert',
      petitionData.title,
      [
        { text: 'Dismiss', style: 'cancel' },
        { text: 'View Now', onPress: () => handleNotificationAction({ type: 'petition', data: petitionData }) }
      ]
    );
  };

  const value = {
    ...state,
    markAsRead,
    clearNotifications,
    scheduleReminder,
    cancelScheduledReminders,
    notifyNewPoll,
    notifyPollResults,
    notifyPetitionUpdate,
    notifyUrgentPetition
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};