/**
 * Petition Detail Screen
 * Complete petition view with signature collection and status updates
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
  Share,
  Dimensions,
  Linking
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import ApiService from '../services/ApiService';
import SocketService from '../services/SocketService';

const { width } = Dimensions.get('window');

export default function PetitionDetailScreen({ route, navigation }) {
  const { petitionId } = route.params;
  
  // State
  const [petition, setPetition] = useState(null);
  const [petitionResults, setPetitionResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signing, setSigning] = useState(false);

  // Load petition data
  const loadPetitionData = useCallback(async () => {
    try {
      setError(null);
      
      // Load petition details
      const petitionResponse = await ApiService.getPetitionById(petitionId);
      setPetition(petitionResponse.data);
      
      // Load petition results/signature data
      const resultsResponse = await ApiService.getPetitionResults(petitionId);
      setPetitionResults(resultsResponse.data);
      
      // Check if user has signed
      const signedResponse = await ApiService.checkPetitionSignature(petitionId);
      setHasSigned(signedResponse.data.hasSigned);
      
    } catch (err) {
      console.error('Error loading petition:', err);
      setError(err.response?.data?.message || 'Failed to load petition details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [petitionId]);

  // Handle petition signing
  const handleSignPetition = async () => {
    if (hasSigned || signing) return;
    
    setSigning(true);
    
    try {
      await ApiService.signPetition(petitionId);
      
      // Update local state
      const resultsResponse = await ApiService.getPetitionResults(petitionId);
      setPetitionResults(resultsResponse.data);
      setHasSigned(true);
      
      Alert.alert('Success', 'Thank you for signing this petition! Your voice matters.');
      
    } catch (err) {
      console.error('Sign petition error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to sign petition');
    } finally {
      setSigning(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Sign this petition: ${petition.title}\n\n${petition.description}\n\nJoin the movement for change!`,
        url: `https://janmat.app/petition/${petitionId}`
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadPetitionData();
  };

  // Set up Socket.IO listeners for real-time updates
  useFocusEffect(
    useCallback(() => {
      // Listen for petition updates
      const onPetitionUpdate = (data) => {
        if (data.petitionId === petitionId) {
          setPetition(prevPetition => ({ ...prevPetition, ...data.updates }));
          loadPetitionData(); // Refresh results
        }
      };

      // Listen for new signatures
      const onNewSignature = (data) => {
        if (data.petitionId === petitionId) {
          loadPetitionData(); // Refresh results
        }
      };

      SocketService.on('petition_updated', onPetitionUpdate);
      SocketService.on('new_signature', onNewSignature);

      return () => {
        SocketService.off('petition_updated', onPetitionUpdate);
        SocketService.off('new_signature', onNewSignature);
      };
    }, [petitionId, loadPetitionData])
  );

  // Load data on mount
  useEffect(() => {
    loadPetitionData();
  }, [loadPetitionData]);

  // Get progress percentage
  const getProgressPercentage = () => {
    if (!petitionResults || !petitionResults.signatureCount || !petition.targetSignatures) {
      return 0;
    }
    return Math.min((petitionResults.signatureCount / petitionResults.targetSignatures) * 100, 100);
  };

  // Get progress to next milestone
  const getNextMilestoneProgress = () => {
    if (!petitionResults || !petitionResults.signatureCount || !petition.milestones) {
      return { current: 0, target: 100, percentage: 0 };
    }
    
    const current = petitionResults.signatureCount;
    const nextMilestone = petition.milestones.find(m => current < m.target);
    
    if (!nextMilestone) {
      return { current, target: current, percentage: 100 };
    }
    
    const previousMilestone = petition.milestones
      .filter(m => m.target <= current)
      .slice(-1)[0];
    
    const prevTarget = previousMilestone ? previousMilestone.target : 0;
    const target = nextMilestone.target;
    const percentage = target > prevTarget ? ((current - prevTarget) / (target - prevTarget)) * 100 : 0;
    
    return { current, target, percentage: Math.min(percentage, 100) };
  };

  // Get status color
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
    return <LoadingSpinner message="Loading petition details..." />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRetry={loadPetitionData}
      />
    );
  }

  if (!petition) {
    return (
      <ErrorView 
        message="Petition not found"
        onRetry={loadPetitionData}
      />
    );
  }

  const progressPercentage = getProgressPercentage();
  const milestoneProgress = getNextMilestoneProgress();

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
        
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Icon name="share" size={24} color={theme.colors.neutral[0]} />
        </TouchableOpacity>
      </View>

      {/* Petition Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Petition Info */}
        <View style={styles.petitionInfo}>
          <View style={styles.petitionCategory}>
            <Text style={styles.categoryText}>{petition.category}</Text>
          </View>
          
          <Text style={styles.petitionTitle}>{petition.title}</Text>
          
          <Text style={styles.petitionDescription}>{petition.description}</Text>
          
          <View style={styles.petitionMeta}>
            <Text style={styles.petitionDate}>
              Created: {new Date(petition.createdAt).toLocaleDateString()}
            </Text>
            {petition.location && (
              <Text style={styles.petitionLocation}>
                Location: {petition.location}
              </Text>
            )}
            {petition.targetAuthority && (
              <Text style={styles.petitionTarget}>
                Target: {petition.targetAuthority}
              </Text>
            )}
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(petition.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(petition.status) }
            ]}>
              {petition.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Signature Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Signature Progress</Text>
            <Text style={styles.signatureCount}>
              {petitionResults?.signatureCount || 0} / {petition.targetSignatures || 0}
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: theme.colors.primary
                }
              ]} 
            />
          </View>
          
          <Text style={styles.progressPercentage}>
            {progressPercentage.toFixed(1)}% complete
          </Text>

          {/* Milestone Progress */}
          {petition.milestones && petition.milestones.length > 0 && (
            <View style={styles.milestoneContainer}>
              <Text style={styles.milestoneTitle}>Next Milestone</Text>
              <Text style={styles.milestoneTarget}>
                {milestoneProgress.current} / {milestoneProgress.target} signatures
              </Text>
              <View style={styles.milestoneProgressBar}>
                <View 
                  style={[
                    styles.milestoneProgressFill,
                    { 
                      width: `${milestoneProgress.percentage}%`,
                      backgroundColor: theme.colors.success
                    }
                  ]} 
                />
              </View>
              <Text style={styles.milestoneText}>
                {milestoneProgress.target - milestoneProgress.current} more signatures needed
              </Text>
            </View>
          )}
        </View>

        {/* Recent Signatures */}
        {petitionResults?.recentSignatures && petitionResults.recentSignatures.length > 0 && (
          <View style={styles.signaturesSection}>
            <Text style={styles.signaturesTitle}>Recent Signatures</Text>
            {petitionResults.recentSignatures.map((signature, index) => (
              <View key={index} style={styles.signatureItem}>
                <View style={styles.signatureAvatar}>
                  <Icon name="person" size={20} color={theme.colors.neutral[500]} />
                </View>
                <View style={styles.signatureInfo}>
                  <Text style={styles.signatureName}>
                    {signature.anonymousId || 'Anonymous'}
                  </Text>
                  <Text style={styles.signatureLocation}>
                    {signature.state || 'Unknown location'}
                  </Text>
                </View>
                <Text style={styles.signatureDate}>
                  {new Date(signature.signedAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Status Updates */}
        {petition.milestones && petition.milestones.length > 0 && (
          <View style={styles.milestonesSection}>
            <Text style={styles.milestonesTitle}>Milestones & Updates</Text>
            {petition.milestones.map((milestone, index) => (
              <View key={index} style={styles.milestoneItem}>
                <View style={[
                  styles.milestoneDot,
                  { backgroundColor: 
                    (petitionResults?.signatureCount || 0) >= milestone.target
                      ? theme.colors.success
                      : theme.colors.neutral[300]
                  }
                ]} />
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneTargetText}>
                    {milestone.target.toLocaleString()} signatures
                  </Text>
                  <Text style={styles.milestoneDescription}>
                    {milestone.description}
                  </Text>
                  {milestone.status && (
                    <Text style={[
                      styles.milestoneStatus,
                      { color: getStatusColor(milestone.status) }
                    ]}>
                      {milestone.status.replace('_', ' ')}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Target Authority Contact */}
        {petition.targetAuthority && (
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Contact Target Authority</Text>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => {
                if (petition.targetEmail) {
                  Linking.openURL(`mailto:${petition.targetEmail}`);
                } else {
                  Alert.alert('Contact Information', `Please contact: ${petition.targetAuthority}`);
                }
              }}
            >
              <Icon name="email" size={20} color={theme.colors.primary} />
              <Text style={styles.contactButtonText}>Email Authority</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sign Petition Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.signButton,
            (hasSigned || petition.status !== 'ACTIVE') && styles.disabledButton
          ]}
          onPress={handleSignPetition}
          disabled={hasSigned || signing || petition.status !== 'ACTIVE'}
        >
          <Text style={styles.signButtonText}>
            {hasSigned ? 'Already Signed' : signing ? 'Signing...' : 'Sign Petition'}
          </Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: theme.spacing.sm
  },
  shareButton: {
    padding: theme.spacing.sm
  },
  content: {
    flex: 1
  },
  petitionInfo: {
    backgroundColor: theme.colors.neutral[0],
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium
  },
  petitionCategory: {
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600'
  },
  petitionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md,
    lineHeight: 24
  },
  petitionDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.lg,
    lineHeight: 20
  },
  petitionMeta: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: theme.spacing.md
  },
  petitionDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
    marginBottom: theme.spacing.xs
  },
  petitionLocation: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
    marginBottom: theme.spacing.xs
  },
  petitionTarget: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500]
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  progressSection: {
    backgroundColor: theme.colors.neutral[0],
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  progressTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800]
  },
  signatureCount: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  progressBar: {
    height: 12,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm
  },
  progressFill: {
    height: '100%',
    borderRadius: 6
  },
  progressPercentage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    textAlign: 'center'
  },
  milestoneContainer: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200]
  },
  milestoneTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.xs
  },
  milestoneTarget: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.sm
  },
  milestoneProgressBar: {
    height: 6,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm
  },
  milestoneProgressFill: {
    height: '100%',
    borderRadius: 3
  },
  milestoneText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    fontWeight: '500'
  },
  signaturesSection: {
    backgroundColor: theme.colors.neutral[0],
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium
  },
  signaturesTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md
  },
  signatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100]
  },
  signatureAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md
  },
  signatureInfo: {
    flex: 1
  },
  signatureName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.xs
  },
  signatureLocation: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500]
  },
  signatureDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500]
  },
  milestonesSection: {
    backgroundColor: theme.colors.neutral[0],
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium
  },
  milestonesTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md
  },
  milestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
    marginTop: theme.spacing.xs
  },
  milestoneContent: {
    flex: 1
  },
  milestoneTargetText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.xs
  },
  milestoneDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xs
  },
  milestoneStatus: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  contactSection: {
    backgroundColor: theme.colors.neutral[0],
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium
  },
  contactTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start'
  },
  contactButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    fontWeight: '500'
  },
  actionContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200]
  },
  signButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: theme.colors.neutral[300]
  },
  signButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[0],
    fontWeight: 'bold'
  }
});