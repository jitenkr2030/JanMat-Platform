/**
 * Poll Detail Screen
 * Complete poll view with voting interface, results, and demographics
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
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import ApiService from '../services/ApiService';
import SocketService from '../services/SocketService';

// Import voting components
import YesNoVote from '../components/voting/YesNoVote';
import MultipleChoiceVote from '../components/voting/MultipleChoiceVote';
import RatingVote from '../components/voting/RatingVote';
import EmojiVote from '../components/voting/EmojiVote';

const { width } = Dimensions.get('window');

export default function PollDetailScreen({ route, navigation }) {
  const { pollId } = route.params;
  
  // State
  const [poll, setPoll] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [activeTab, setActiveTab] = useState('vote'); // 'vote' or 'results'

  // Load poll data
  const loadPollData = useCallback(async () => {
    try {
      setError(null);
      
      // Load poll details
      const pollResponse = await ApiService.getPollById(pollId);
      setPoll(pollResponse.data);
      
      // Load poll results
      const resultsResponse = await ApiService.getPollResults(pollId);
      setPollResults(resultsResponse.data);
      
      // Check if user has already voted
      const voteResponse = await ApiService.getUserVote(pollId);
      setUserVote(voteResponse.data);
      
    } catch (err) {
      console.error('Error loading poll:', err);
      setError(err.response?.data?.message || 'Failed to load poll details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pollId]);

  // Handle vote submission
  const handleVote = async (pollId, voteData) => {
    try {
      await ApiService.submitVote({
        pollId,
        ...voteData
      });
      
      // Update local state
      const resultsResponse = await ApiService.getPollResults(pollId);
      setPollResults(resultsResponse.data);
      
      setUserVote(voteData);
      setActiveTab('results');
      
      Alert.alert('Success', 'Your vote has been recorded!');
      
    } catch (err) {
      console.error('Vote error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit vote');
      throw err;
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Vote on this poll: ${poll.question}\n\nDownload JanMat app to participate in democratic decisions!`,
        url: `https://janmat.app/poll/${pollId}`
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadPollData();
  };

  // Set up Socket.IO listeners for real-time updates
  useFocusEffect(
    useCallback(() => {
      // Listen for poll updates
      const onPollUpdate = (data) => {
        if (data.pollId === pollId) {
          setPoll(prevPoll => ({ ...prevPoll, ...data.updates }));
          loadPollData(); // Refresh results
        }
      };

      // Listen for new votes
      const onNewVote = (data) => {
        if (data.pollId === pollId) {
          loadPollData(); // Refresh results
        }
      };

      SocketService.on('poll_updated', onPollUpdate);
      SocketService.on('new_vote', onNewVote);

      return () => {
        SocketService.off('poll_updated', onPollUpdate);
        SocketService.off('new_vote', onNewVote);
      };
    }, [pollId, loadPollData])
  );

  // Load data on mount
  useEffect(() => {
    loadPollData();
  }, [loadPollData]);

  // Render voting component based on poll type
  const renderVotingComponent = () => {
    if (!poll) return null;
    
    const votingProps = {
      onVote: handleVote,
      pollId: pollId,
      disabled: !!userVote,
      initialResults: pollResults
    };

    switch (poll.pollType) {
      case 'YES_NO':
        return <YesNoVote {...votingProps} />;
      case 'MULTIPLE_CHOICE':
        return (
          <MultipleChoiceVote 
            {...votingProps} 
            options={poll.options} 
          />
        );
      case 'RATING':
        return <RatingVote {...votingProps} />;
      case 'EMOJI':
        return <EmojiVote {...votingProps} />;
      default:
        return <Text>Unknown poll type</Text>;
    }
  };

  // Render results view
  const renderResultsView = () => {
    if (!pollResults) return null;

    return (
      <View style={styles.resultsContainer}>
        {/* Total Votes */}
        <View style={styles.totalVotesSection}>
          <Text style={styles.totalVotesTitle}>Total Votes</Text>
          <Text style={styles.totalVotesNumber}>
            {pollResults.totalVotes || 0}
          </Text>
        </View>

        {/* Poll-specific results */}
        <View style={styles.pollResultsSection}>
          <Text style={styles.resultsTitle}>Results Breakdown</Text>
          
          {poll.pollType === 'YES_NO' && pollResults.yes_no_breakdown && (
            <View style={styles.yesNoResults}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Yes</Text>
                <Text style={styles.resultValue}>
                  {pollResults.yes_no_breakdown.yes || 0} votes
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>No</Text>
                <Text style={styles.resultValue}>
                  {pollResults.yes_no_breakdown.no || 0} votes
                </Text>
              </View>
            </View>
          )}

          {poll.pollType === 'MULTIPLE_CHOICE' && pollResults.multiple_choice_breakdown && (
            <View style={styles.multipleChoiceResults}>
              {Object.entries(pollResults.multiple_choice_breakdown).map(([option, votes]) => (
                <View key={option} style={styles.resultRow}>
                  <Text style={styles.resultLabel}>{option}</Text>
                  <Text style={styles.resultValue}>{votes} votes</Text>
                </View>
              ))}
            </View>
          )}

          {poll.pollType === 'RATING' && pollResults.rating_distribution && (
            <View style={styles.ratingResults}>
              <Text style={styles.averageRating}>
                Average: {pollResults.averageRating?.toFixed(1) || 'N/A'}/10
              </Text>
              {Object.entries(pollResults.rating_distribution).map(([rating, votes]) => (
                <View key={rating} style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Rating {rating}</Text>
                  <Text style={styles.resultValue}>{votes} votes</Text>
                </View>
              ))}
            </View>
          )}

          {poll.pollType === 'EMOJI' && pollResults.emoji_breakdown && (
            <View style={styles.emojiResults}>
              {Object.entries(pollResults.emoji_breakdown).map(([emoji, votes]) => (
                <View key={emoji} style={styles.resultRow}>
                  <Text style={styles.resultLabel}>{emoji}</Text>
                  <Text style={styles.resultValue}>{votes} votes</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Demographics */}
        {pollResults.demographics && (
          <View style={styles.demographicsSection}>
            <Text style={styles.demographicsTitle}>Demographics</Text>
            
            {pollResults.demographics.state_wise && (
              <View style={styles.demographicGroup}>
                <Text style={styles.demographicLabel}>By State:</Text>
                {Object.entries(pollResults.demographics.state_wise).map(([state, count]) => (
                  <View key={state} style={styles.demographicRow}>
                    <Text style={styles.demographicState}>{state}</Text>
                    <Text style={styles.demographicCount}>{count} votes</Text>
                  </View>
                ))}
              </View>
            )}

            {pollResults.demographics.age_group_wise && (
              <View style={styles.demographicGroup}>
                <Text style={styles.demographicLabel}>By Age Group:</Text>
                {Object.entries(pollResults.demographics.age_group_wise).map(([age, count]) => (
                  <View key={age} style={styles.demographicRow}>
                    <Text style={styles.demographicAge}>{age}</Text>
                    <Text style={styles.demographicCount}>{count} votes</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading poll details..." />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRetry={loadPollData}
      />
    );
  }

  if (!poll) {
    return (
      <ErrorView 
        message="Poll not found"
        onRetry={loadPollData}
      />
    );
  }

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

      {/* Poll Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Poll Info */}
        <View style={styles.pollInfo}>
          <View style={styles.pollCategory}>
            <Text style={styles.categoryText}>{poll.category}</Text>
          </View>
          
          <Text style={styles.pollQuestion}>{poll.question}</Text>
          
          {poll.description && (
            <Text style={styles.pollDescription}>{poll.description}</Text>
          )}
          
          <View style={styles.pollMeta}>
            <Text style={styles.pollDate}>
              Created: {new Date(poll.createdAt).toLocaleDateString()}
            </Text>
            {poll.expiryDate && (
              <Text style={styles.pollExpiry}>
                Expires: {new Date(poll.expiryDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'vote' && styles.activeTab]}
            onPress={() => setActiveTab('vote')}
            disabled={!!userVote}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'vote' && styles.activeTabText
            ]}>
              {userVote ? 'Voted' : 'Vote'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'results' && styles.activeTab]}
            onPress={() => setActiveTab('results')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'results' && styles.activeTabText
            ]}>
              Results
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'vote' && renderVotingComponent()}
        {activeTab === 'results' && renderResultsView()}
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
  backButton: {
    padding: theme.spacing.sm
  },
  shareButton: {
    padding: theme.spacing.sm
  },
  content: {
    flex: 1
  },
  pollInfo: {
    backgroundColor: theme.colors.neutral[0],
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium
  },
  pollCategory: {
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
  pollQuestion: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md,
    lineHeight: 24
  },
  pollDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.lg,
    lineHeight: 20
  },
  pollMeta: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: theme.spacing.md
  },
  pollDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
    marginBottom: theme.spacing.xs
  },
  pollExpiry: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning,
    fontWeight: '500'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.neutral[0],
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
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
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  activeTabText: {
    color: theme.colors.neutral[0],
    fontWeight: 'bold'
  },
  resultsContainer: {
    backgroundColor: theme.colors.neutral[0],
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium
  },
  totalVotesSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg
  },
  totalVotesTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xs
  },
  totalVotesNumber: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  pollResultsSection: {
    marginBottom: theme.spacing.lg
  },
  resultsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md
  },
  yesNoResults: {
    gap: theme.spacing.sm
  },
  multipleChoiceResults: {
    gap: theme.spacing.sm
  },
  ratingResults: {
    gap: theme.spacing.sm
  },
  emojiResults: {
    gap: theme.spacing.sm
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm
  },
  resultLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[700],
    flex: 1
  },
  resultValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[600],
    fontWeight: '600'
  },
  averageRating: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md
  },
  demographicsSection: {
    marginTop: theme.spacing.lg
  },
  demographicsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md
  },
  demographicGroup: {
    marginBottom: theme.spacing.md
  },
  demographicLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.sm
  },
  demographicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs
  },
  demographicState: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    flex: 1
  },
  demographicAge: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    flex: 1
  },
  demographicCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  }
});