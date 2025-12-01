/**
 * Notification Service for JanMat Mobile App
 * Handles push notifications and local notifications
 */

import PushNotification from 'react-native-push-notification';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationQueue = [];
  }

  initialize() {
    if (this.isInitialized) return;

    console.log('🔔 Initializing Notification Service...');

    this.configurePushNotifications();
    this.createNotificationChannels();
    this.setupNotificationHandlers();
    
    this.isInitialized = true;
    console.log('✅ Notification Service initialized');
  }

  configurePushNotifications() {
    PushNotification.configure({
      // Called when token is generated
      onRegister: (token) => {
        console.log('📱 Push notification token:', token.token);
        this.handleRegistrationSuccess(token);
      },

      // Called when a remote or local notification is opened or received
      onNotification: (notification) => {
        console.log('🔔 Notification received:', notification);
        this.handleNotificationReceived(notification);
      },

      // Called when notification action is pressed
      onAction: (notification) => {
        console.log('🔔 Notification action:', notification.action);
        this.handleNotificationAction(notification);
      },

      // Called when registration fails
      onRegistrationError: (err) => {
        console.error('🚫 Notification registration error:', err.message);
        this.handleRegistrationError(err);
      },

      // Android specific permissions
      permissions: {
        alert: true,
        badge: true,
        sound: true,
        carPlay: true,
        criticalAlert: true
      },

      // iOS specific permissions
      requestPermissions: Platform.OS === 'ios' ? true : false,

      // Pop initial notification on app start
      popInitialNotification: true
    });

    // Request permissions for Android 13+
    if (Platform.OS === 'android' && DeviceInfo.getApiLevel() >= 33) {
      PushNotification.requestPermissions();
    }
  }

  createNotificationChannels() {
    if (Platform.OS !== 'android') return;

    // Main notifications channel
    PushNotification.createChannel(
      {
        channelId: 'janmat-main',
        channelName: 'JanMat Main',
        channelDescription: 'Main notifications from JanMat app',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
        vibration: 300,
        showWhenInForeground: true,
        priority: 'high'
      },
      (created) => console.log(`Channel 'janmat-main' created: ${created}`)
    );

    // Urgent notifications channel
    PushNotification.createChannel(
      {
        channelId: 'janmat-urgent',
        channelName: 'JanMat Urgent',
        channelDescription: 'Urgent notifications and alerts',
        playSound: true,
        soundName: 'default',
        importance: 5,
        vibrate: true,
        vibration: [0, 250, 250, 250],
        showWhenInForeground: true,
        priority: 'high'
      },
      (created) => console.log(`Channel 'janmat-urgent' created: ${created}`)
    );

    // Poll updates channel
    PushNotification.createChannel(
      {
        channelId: 'janmat-polls',
        channelName: 'Poll Updates',
        channelDescription: 'Notifications about poll updates and results',
        playSound: true,
        soundName: 'default',
        importance: 3,
        vibrate: true,
        vibration: 200,
        showWhenInForeground: true,
        priority: 'normal'
      },
      (created) => console.log(`Channel 'janmat-polls' created: ${created}`)
    );

    // Petition updates channel
    PushNotification.createChannel(
      {
        channelId: 'janmat-petitions',
        channelName: 'Petition Updates',
        channelDescription: 'Updates on petitions and signatures',
        playSound: true,
        soundName: 'default',
        importance: 3,
        vibrate: true,
        vibration: 200,
        showWhenInForeground: true,
        priority: 'normal'
      },
      (created) => console.log(`Channel 'janmat-petitions' created: ${created}`)
    );

    // Reminders channel
    PushNotification.createChannel(
      {
        channelId: 'janmat-reminders',
        channelName: 'Reminders',
        channelDescription: 'Poll and petition reminders',
        playSound: true,
        soundName: 'default',
        importance: 2,
        vibrate: false,
        showWhenInForeground: false,
        priority: 'low'
      },
      (created) => console.log(`Channel 'janmat-reminders' created: ${created}`)
    );
  }

  setupNotificationHandlers() {
    // Handle notification when app is in foreground
    PushNotification.addNotificationReceivedNotification((notification) => {
      console.log('📱 Foreground notification:', notification);
      this.showInAppNotification(notification);
    });

    // Handle notification action
    PushNotification.addNotificationAction({
      // Action identifier
      identifier: 'VIEW_POLL',
      // Action title
      title: 'View Poll',
      // Whether this action requires the app to be opened
      activateOnUnlock: true
    });

    PushNotification.addNotificationAction({
      identifier: 'SIGN_PETITION',
      title: 'Sign Petition',
      activateOnUnlock: true
    });
  }

  handleRegistrationSuccess(token) {
    // Save token for API calls
    this.pushToken = token.token;
    console.log('💾 Saving push token:', token.token);
    
    // Send token to backend
    this.registerPushTokenWithBackend(token.token);
  }

  handleRegistrationError(err) {
    console.error('❌ Push notification registration failed:', err.message);
    
    // Could show user a dialog about notification permissions
    // or fallback to other notification methods
  }

  handleNotificationReceived(notification) {
    // Process notification based on type
    const { data, userInfo } = notification;
    
    if (data?.type) {
      this.processNotificationByType(data);
    }

    // Handle notification interaction
    if (notification.userInteraction) {
      this.handleNotificationInteraction(notification);
    }
  }

  handleNotificationAction(notification) {
    const { action } = notification;
    
    switch (action) {
      case 'VIEW_POLL':
        this.handleViewPollAction(notification);
        break;
      case 'SIGN_PETITION':
        this.handleSignPetitionAction(notification);
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }

  handleNotificationInteraction(notification) {
    const { data, userInfo } = notification;
    
    // Track notification interaction for analytics
    this.trackNotificationInteraction(notification);
    
    // Navigate to relevant screen based on notification type
    if (data?.navigation) {
      // Handle navigation logic here
      console.log('Navigate to:', data.navigation);
    }
  }

  processNotificationByType(data) {
    switch (data.type) {
      case 'poll':
        this.handlePollNotification(data);
        break;
      case 'petition':
        this.handlePetitionNotification(data);
        break;
      case 'urgent':
        this.handleUrgentNotification(data);
        break;
      default:
        console.log('Unknown notification type:', data.type);
    }
  }

  handlePollNotification(data) {
    // Handle poll-specific notifications
    console.log('Processing poll notification:', data);
  }

  handlePetitionNotification(data) {
    // Handle petition-specific notifications
    console.log('Processing petition notification:', data);
  }

  handleUrgentNotification(data) {
    // Handle urgent notifications with high priority
    console.log('Processing urgent notification:', data);
  }

  // Public API methods

  async sendLocalNotification(notification) {
    const {
      title,
      message,
      type = 'info',
      data = {},
      priority = 'normal',
      channelId = 'janmat-main'
    } = notification;

    PushNotification.localNotification({
      channelId,
      title,
      message,
      playSound: true,
      soundName: 'default',
      importance: this.getPriorityLevel(priority),
      vibrate: priority === 'urgent',
      vibration: priority === 'urgent' ? 300 : 200,
      userInfo: {
        type,
        data,
        timestamp: Date.now()
      }
    });
  }

  async sendScheduledNotification(notification) {
    const {
      title,
      message,
      date,
      type = 'info',
      data = {},
      priority = 'normal',
      channelId = 'janmat-reminders'
    } = notification;

    PushNotification.localNotificationSchedule({
      channelId,
      title,
      message,
      date,
      playSound: true,
      soundName: 'default',
      importance: this.getPriorityLevel(priority),
      vibrate: false,
      userInfo: {
        type,
        data,
        timestamp: Date.now()
      }
    });
  }

  async cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
    console.log('🔔 All notifications cancelled');
  }

  async cancelNotification(id) {
    PushNotification.cancelLocalNotification(id);
    console.log(`🔔 Notification cancelled: ${id}`);
  }

  async schedulePollReminder(pollId, pollTitle, reminderDate) {
    await this.sendScheduledNotification({
      title: 'Poll Reminder',
      message: `Don't forget to vote: ${pollTitle}`,
      date: reminderDate,
      type: 'poll',
      data: { pollId, action: 'reminder' },
      priority: 'normal',
      channelId: 'janmat-reminders'
    });
  }

  async schedulePetitionReminder(petitionId, petitionTitle, reminderDate) {
    await this.sendScheduledNotification({
      title: 'Petition Reminder',
      message: `Support needed: ${petitionTitle}`,
      date: reminderDate,
      type: 'petition',
      data: { petitionId, action: 'reminder' },
      priority: 'normal',
      channelId: 'janmat-reminders'
    });
  }

  // Utility methods

  getPriorityLevel(priority) {
    const priorityMap = {
      low: 1,
      normal: 3,
      high: 4,
      urgent: 5
    };
    return priorityMap[priority] || 3;
  }

  showInAppNotification(notification) {
    // Implementation for showing in-app notifications
    // This could be a toast, banner, or custom component
    console.log('📱 In-app notification:', notification.title);
  }

  async registerPushTokenWithBackend(token) {
    try {
      // Send token to your backend API
      // This would be implemented with your API service
      console.log('📤 Registering push token with backend');
    } catch (error) {
      console.error('❌ Failed to register push token:', error);
    }
  }

  async trackNotificationInteraction(notification) {
    try {
      // Track notification interactions for analytics
      console.log('📊 Tracking notification interaction');
    } catch (error) {
      console.error('❌ Failed to track notification interaction:', error);
    }
  }

  handleViewPollAction(notification) {
    console.log('👁️ View poll action triggered');
    // Navigate to poll screen
  }

  handleSignPetitionAction(notification) {
    console.log('✍️ Sign petition action triggered');
    // Navigate to petition screen
  }

  // Badge management
  async setBadgeCount(count) {
    PushNotification.setApplicationIconBadgeNumber(count);
  }

  async clearBadge() {
    PushNotification.setApplicationIconBadgeNumber(0);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;