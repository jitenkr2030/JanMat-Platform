/**
 * Settings Screen
 * App settings, preferences, and account management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Share
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';

const SETTING_SECTIONS = [
  {
    title: 'Account',
    items: [
      {
        type: 'navigation',
        title: 'Edit Profile',
        icon: 'person',
        action: () => Alert.alert('Profile', 'Edit profile feature coming soon!')
      },
      {
        type: 'navigation',
        title: 'Change Password',
        icon: 'lock',
        action: () => Alert.alert('Security', 'Change password feature coming soon!')
      },
      {
        type: 'navigation',
        title: 'Privacy Settings',
        icon: 'privacy-tip',
        action: () => Alert.alert('Privacy', 'Privacy settings feature coming soon!')
      }
    ]
  },
  {
    title: 'Notifications',
    items: [
      {
        type: 'toggle',
        title: 'Push Notifications',
        description: 'Receive notifications about new polls and petitions',
        icon: 'notifications',
        value: true,
        onChange: (value) => console.log('Push notifications:', value)
      },
      {
        type: 'toggle',
        title: 'Email Notifications',
        description: 'Get email updates about your activity',
        icon: 'email',
        value: false,
        onChange: (value) => console.log('Email notifications:', value)
      },
      {
        type: 'toggle',
        title: 'Location-based Alerts',
        description: 'Receive local poll recommendations',
        icon: 'location-on',
        value: true,
        onChange: (value) => console.log('Location alerts:', value)
      }
    ]
  },
  {
    title: 'Privacy & Security',
    items: [
      {
        type: 'toggle',
        title: 'Anonymous Mode',
        description: 'Hide your identity in public displays',
        icon: 'visibility-off',
        value: true,
        onChange: (value) => console.log('Anonymous mode:', value)
      },
      {
        type: 'toggle',
        title: 'Data Sharing',
        description: 'Share anonymous data for research',
        icon: 'analytics',
        value: false,
        onChange: (value) => console.log('Data sharing:', value)
      },
      {
        type: 'navigation',
        title: 'Download My Data',
        icon: 'download',
        action: () => Alert.alert('Data Export', 'Data export feature coming soon!')
      }
    ]
  },
  {
    title: 'App Preferences',
    items: [
      {
        type: 'navigation',
        title: 'Language',
        icon: 'language',
        subtitle: 'English',
        action: () => Alert.alert('Language', 'Language selection feature coming soon!')
      },
      {
        type: 'navigation',
        title: 'Theme',
        icon: 'palette',
        subtitle: 'Light',
        action: () => Alert.alert('Theme', 'Theme selection feature coming soon!')
      },
      {
        type: 'navigation',
        title: 'Region',
        icon: 'public',
        subtitle: 'India',
        action: () => Alert.alert('Region', 'Region selection feature coming soon!')
      }
    ]
  },
  {
    title: 'Support',
    items: [
      {
        type: 'navigation',
        title: 'Help Center',
        icon: 'help',
        action: () => Linking.openURL('https://janmat.app/help')
      },
      {
        type: 'navigation',
        title: 'Contact Support',
        icon: 'support-agent',
        action: () => Linking.openURL('mailto:support@janmat.app')
      },
      {
        type: 'navigation',
        title: 'Report Bug',
        icon: 'bug-report',
        action: () => Alert.alert('Bug Report', 'Bug reporting feature coming soon!')
      },
      {
        type: 'navigation',
        title: 'Feature Request',
        icon: 'lightbulb',
        action: () => Alert.alert('Feature Request', 'Feature request feature coming soon!')
      }
    ]
  },
  {
    title: 'Legal & About',
    items: [
      {
        type: 'navigation',
        title: 'Privacy Policy',
        icon: 'description',
        action: () => Linking.openURL('https://janmat.app/privacy')
      },
      {
        type: 'navigation',
        title: 'Terms of Service',
        icon: 'gavel',
        action: () => Linking.openURL('https://janmat.app/terms')
      },
      {
        type: 'navigation',
        title: 'Community Guidelines',
        icon: 'rule',
        action: () => Linking.openURL('https://janmat.app/guidelines')
      },
      {
        type: 'navigation',
        title: 'About JanMat',
        icon: 'info',
        action: () => Alert.alert('About', 'JanMat v1.0.0 - Empowering democratic participation')
      }
    ]
  }
];

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuth();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    locationAlerts: true,
    anonymousMode: true,
    dataSharing: false
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out JanMat - the app for democratic participation in India! Download it to voice your opinions on important issues.',
        url: 'https://janmat.app'
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderSettingItem = (item) => {
    switch (item.type) {
      case 'toggle':
        return (
          <View key={item.title} style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Icon name={item.icon} size={20} color={theme.colors.primary} />
                <Text style={styles.settingTitle}>{item.title}</Text>
              </View>
              {item.description && (
                <Text style={styles.settingDescription}>{item.description}</Text>
              )}
            </View>
            <Switch
              value={settings[item.key]}
              onValueChange={() => handleToggle(item.key)}
              trackColor={{ 
                false: theme.colors.neutral[300], 
                true: theme.colors.primary + '50' 
              }}
              thumbColor={settings[item.key] ? theme.colors.primary : theme.colors.neutral[400]}
            />
          </View>
        );

      case 'navigation':
        return (
          <TouchableOpacity
            key={item.title}
            style={styles.settingItem}
            onPress={item.action}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Icon name={item.icon} size={20} color={theme.colors.primary} />
                <Text style={styles.settingTitle}>{item.title}</Text>
              </View>
              {item.subtitle && (
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              )}
            </View>
            <Icon 
              name="arrow-forward-ios" 
              size={16} 
              color={theme.colors.neutral[400]} 
            />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const renderSection = (section) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingItem)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.neutral[0]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {SETTING_SECTIONS.map(renderSection)}

        {/* App Version */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>JanMat v1.0.0</Text>
          <Text style={styles.appDescription}>
            Empowering democratic participation in India
          </Text>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareApp}
          >
            <Icon name="share" size={20} color={theme.colors.primary} />
            <Text style={styles.shareButtonText}>Share JanMat</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color={theme.colors.error} />
            <Text style={styles.dangerButtonText}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={() => Alert.alert(
              'Delete Account',
              'Are you sure you want to delete your account? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => Alert.alert('Account Deletion', 'Account deletion feature coming soon!')
                }
              ]
            )}
          >
            <Icon name="delete-forever" size={20} color={theme.colors.error} />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50]
  },
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[0]
  },
  content: {
    flex: 1
  },
  section: {
    backgroundColor: theme.colors.neutral[0],
    marginBottom: theme.spacing.md,
    ...theme.shadows.small
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[700],
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200]
  },
  sectionContent: {
    padding: theme.spacing.md
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100]
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs
  },
  settingTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[800],
    fontWeight: '500',
    marginLeft: theme.spacing.sm
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    lineHeight: 16,
    marginLeft: 28
  },
  settingSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
    marginLeft: 28
  },
  appInfo: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    alignItems: 'center',
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small
  },
  appVersion: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.xs
  },
  appDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: theme.spacing.md
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md
  },
  shareButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
    fontWeight: '500'
  },
  dangerSection: {
    backgroundColor: theme.colors.neutral[0],
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small
  },
  dangerTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center'
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100]
  },
  dangerButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
    fontWeight: '500'
  }
});