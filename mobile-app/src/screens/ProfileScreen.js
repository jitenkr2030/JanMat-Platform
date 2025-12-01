/**
 * Profile Screen
 * User profile with voting history, created petitions, and settings
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'voting', label: 'Voting History' },
  { key: 'petitions', label: 'My Petitions' },
  { key: 'settings', label: 'Settings' }
];

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateDemographics } = useAuth();
  
  // State
  const [userProfile, setUserProfile] = useState(null);
  const [votingHistory, setVotingHistory] = useState([]);
  const [createdPetitions, setCreatedPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [anonymousMode, setAnonymousMode] = useState(true);

  // Load profile data
  const loadProfileData = useCallback(async () => {
    try {
      setError(null);
      
      // Load user profile
      const profileResponse = await ApiService.getUserProfile();
      setUserProfile(profileResponse.data);
      
      // Load voting history
      const votingResponse = await ApiService.getUserVotingHistory();
      setVotingHistory(votingResponse.data);
      
      // Load created petitions
      const petitionsResponse = await ApiService.getUserCreatedPetitions();
      setCreatedPetitions(petitionsResponse.data);
      
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  // Handle logout
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

  // Load data on mount
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  // Render overview tab
  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* User Info Card */}
      <View style={styles.userInfoCard}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={40} color={theme.colors.primary} />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {userProfile?.anonymousId || 'Anonymous User'}
          </Text>
          <Text style={styles.userMeta}>
            Member since {userProfile?.createdAt ? 
              new Date(userProfile.createdAt).toLocaleDateString() : 
              'N/A'
            }
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setActiveTab('settings')}
        >
          <Icon name="edit" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Demographics */}
      {userProfile?.demographics && (
        <View style={styles.demographicsCard}>
          <Text style={styles.cardTitle}>Demographics</Text>
          <View style={styles.demographicGrid}>
            {userProfile.demographics.ageGroup && (
              <View style={styles.demographicItem}>
                <Text style={styles.demographicLabel}>Age Group</Text>
                <Text style={styles.demographicValue}>{userProfile.demographics.ageGroup}</Text>
              </View>
            )}
            {userProfile.demographics.gender && (
              <View style={styles.demographicItem}>
                <Text style={styles.demographicLabel}>Gender</Text>
                <Text style={styles.demographicValue}>{userProfile.demographics.gender}</Text>
              </View>
            )}
            {userProfile.demographics.state && (
              <View style={styles.demographicItem}>
                <Text style={styles.demographicLabel}>State</Text>
                <Text style={styles.demographicValue}>{userProfile.demographics.state}</Text>
              </View>
            )}
            {userProfile.demographics.city && (
              <View style={styles.demographicItem}>
                <Text style={styles.demographicLabel}>City</Text>
                <Text style={styles.demographicValue}>{userProfile.demographics.city}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Your Activity</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{votingHistory.length}</Text>
            <Text style={styles.statLabel}>Polls Voted</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{createdPetitions.length}</Text>
            <Text style={styles.statLabel}>Petitions Created</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Create')}
        >
          <Icon name="add-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.actionText}>Create New Poll</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreatePetition')}
        >
          <Icon name="description" size={24} color={theme.colors.primary} />
          <Text style={styles.actionText}>Start Petition</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render voting history tab
  const renderVotingHistory = () => (
    <View style={styles.tabContent}>
      {votingHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="how-to-vote" size={64} color={theme.colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No votes yet</Text>
          <Text style={styles.emptyText}>
            Participate in polls to see your voting history here.
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.emptyButtonText}>Browse Polls</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.votingList}>
          {votingHistory.map((vote, index) => (
            <TouchableOpacity 
              key={vote.id || index}
              style={styles.voteItem}
              onPress={() => navigation.navigate('PollDetail', { pollId: vote.pollId })}
            >
              <View style={styles.voteInfo}>
                <Text style={styles.voteQuestion}>
                  {vote.pollQuestion || 'Poll Title'}
                </Text>
                <Text style={styles.voteMeta}>
                  {vote.pollType} • {new Date(vote.votedAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.voteValue}>
                {vote.pollType === 'YES_NO' && (
                  <Text style={[
                    styles.voteAnswer,
                    { color: vote.selectedOption === 'YES' ? theme.colors.success : theme.colors.error }
                  ]}>
                    {vote.selectedOption}
                  </Text>
                )}
                {vote.pollType === 'RATING' && (
                  <Text style={styles.voteAnswer}>
                    {vote.rating}/10
                  </Text>
                )}
                {(vote.pollType === 'MULTIPLE_CHOICE' || vote.pollType === 'EMOJI') && (
                  <Text style={styles.voteAnswer}>
                    {vote.selectedOption || vote.emoji}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Render petitions tab
  const renderPetitions = () => (
    <View style={styles.tabContent}>
      {createdPetitions.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="description" size={64} color={theme.colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No petitions created</Text>
          <Text style={styles.emptyText}>
            Start a petition to make your voice heard on important issues.
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.navigate('CreatePetition')}
          >
            <Text style={styles.emptyButtonText}>Create Petition</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.petitionsList}>
          {createdPetitions.map((petition, index) => (
            <TouchableOpacity 
              key={petition.id || index}
              style={styles.petitionItem}
              onPress={() => navigation.navigate('PetitionDetail', { petitionId: petition.id })}
            >
              <View style={styles.petitionInfo}>
                <Text style={styles.petitionTitle}>
                  {petition.title}
                </Text>
                <Text style={styles.petitionDescription}>
                  {petition.description?.substring(0, 100)}...
                </Text>
                <Text style={styles.petitionMeta}>
                  {petition.category} • {new Date(petition.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.petitionStats}>
                <Text style={styles.petitionSignatures}>
                  {petition.signatureCount || 0} signatures
                </Text>
                <Text style={[
                  styles.petitionStatus,
                  { color: getStatusColor(petition.status) }
                ]}>
                  {petition.status.replace('_', ' ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Render settings tab
  const renderSettings = () => (
    <View style={styles.tabContent}>
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Account Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Anonymous Mode</Text>
            <Text style={styles.settingDescription}>
              Keep your identity anonymous in public displays
            </Text>
          </View>
          <Switch
            value={anonymousMode}
            onValueChange={setAnonymousMode}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary }}
            thumbColor={anonymousMode ? theme.colors.neutral[0] : theme.colors.neutral[400]}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications about new polls and petition updates
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueSet={setNotificationsEnabled}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary }}
            thumbColor={notificationsEnabled ? theme.colors.neutral[0] : theme.colors.neutral[400]}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Location Services</Text>
            <Text style={styles.settingDescription}>
              Allow location-based poll recommendations
            </Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueSet={setLocationEnabled}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary }}
            thumbColor={locationEnabled ? theme.colors.neutral[0] : theme.colors.neutral[400]}
          />
        </View>
      </View>

      {/* Demographic Update */}
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Update Demographics</Text>
        <Text style={styles.settingsDescription}>
          Help us provide better localized content by updating your demographics.
        </Text>
        
        <TouchableOpacity 
          style={styles.demographicButton}
          onPress={() => navigation.navigate('UpdateDemographics')}
        >
          <Icon name="edit" size={20} color={theme.colors.primary} />
          <Text style={styles.demographicButtonText}>Update Demographics</Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.accountButton}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Icon name="lock" size={20} color={theme.colors.primary} />
          <Text style={styles.accountButtonText}>Change Password</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.accountButton}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <Icon name="privacy-tip" size={20} color={theme.colors.primary} />
          <Text style={styles.accountButtonText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="logout" size={20} color={theme.colors.error} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return theme.colors.primary;
      case 'SUBMITTED': return theme.colors.warning;
      case 'RESOLVED': return theme.colors.success;
      case 'REJECTED': return theme.colors.error;
      default: return theme.colors.neutral[500];
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRetry={loadProfileData}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
        >
          <Icon name="settings" size={24} color={theme.colors.neutral[0]} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'voting' && renderVotingHistory()}
        {activeTab === 'petitions' && renderPetitions()}
        {activeTab === 'settings' && renderSettings()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[0]
  },
  settingsButton: {
    padding: theme.spacing.sm
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.neutral[0],
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md
  },
  activeTab: {
    backgroundColor: theme.colors.primary
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  activeTabText: {
    color: theme.colors.neutral[0],
    fontWeight: 'bold'
  },
  content: {
    flex: 1
  },
  tabContent: {
    padding: theme.spacing.md
  },
  userInfoCard: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.medium
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.xs
  },
  userMeta: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500]
  },
  editButton: {
    padding: theme.spacing.sm
  },
  demographicsCard: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md
  },
  demographicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  demographicItem: {
    width: '50%',
    marginBottom: theme.spacing.md
  },
  demographicLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xs
  },
  demographicValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[800],
    fontWeight: '500'
  },
  statsCard: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium
  },
  statsGrid: {
    flexDirection: 'row'
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600]
  },
  actionsCard: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100]
  },
  actionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[700],
    marginLeft: theme.spacing.md,
    fontWeight: '500'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.neutral[600],
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    fontWeight: '600'
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md
  },
  emptyButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[0],
    fontWeight: '600'
  },
  votingList: {
    gap: theme.spacing.sm
  },
  voteItem: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.small
  },
  voteInfo: {
    flex: 1
  },
  voteQuestion: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.xs
  },
  voteMeta: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500]
  },
  voteValue: {
    marginLeft: theme.spacing.md
  },
  voteAnswer: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  petitionsList: {
    gap: theme.spacing.sm
  },
  petitionItem: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small
  },
  petitionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.xs
  },
  petitionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.sm,
    lineHeight: 18
  },
  petitionMeta: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500]
  },
  petitionStats: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  petitionSignatures: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  petitionStatus: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  settingsCard: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium
  },
  settingsDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.md,
    lineHeight: 18
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
  settingLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[800],
    fontWeight: '500',
    marginBottom: theme.spacing.xs
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600]
  },
  demographicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start'
  },
  demographicButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    fontWeight: '500'
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100]
  },
  accountButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[700],
    marginLeft: theme.spacing.md,
    fontWeight: '500'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm
  },
  logoutButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.error,
    marginLeft: theme.spacing.md,
    fontWeight: '500'
  }
});