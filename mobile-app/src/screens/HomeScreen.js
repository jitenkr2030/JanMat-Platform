/**
 * Home Screen for JanMat App
 * Shows active polls and trending topics
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Import components and services
import PollCard from '../components/PollCard';
import SentimentWidget from '../components/SentimentWidget';
import TrendingWidget from '../components/TrendingWidget';
import QuickActions from '../components/QuickActions';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';

import { theme, componentTheme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import ApiService from '../services/ApiService';
import SocketService from '../services/SocketService';

const HomeScreen = ({ navigation }) => {
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [trendingData, setTrendingData] = useState(null);

  const { userId, getUserLocation } = useAuth();
  const { notifyNewPoll } = useNotifications();

  // Load initial data
  const loadHomeData = async () => {
    try {
      setError(null);
      
      const [pollsResponse, sentimentResponse, trendingResponse] = await Promise.all([
        ApiService.getActivePolls(),
        ApiService.getSentimentData(),
        ApiService.getTrendingTopics()
      ]);

      setPolls(pollsResponse.data.polls || []);
      setSentimentData(sentimentResponse.data);
      setTrendingData(trendingResponse.data);
      
    } catch (error) {
      console.error('Home data loading error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Refresh data
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadHomeData();
  }, []);

  // Handle poll press
  const handlePollPress = (poll) => {
    navigation.navigate('PollDetail', { pollId: poll._id, poll });
  };

  // Handle view results
  const handleViewResults = (poll) => {
    navigation.navigate('Results', { pollId: poll._id });
  };

  // Handle create petition
  const handleCreatePetition = () => {
    navigation.navigate('CreatePetition');
  };

  // Setup real-time updates
  useFocusEffect(
    useCallback(() => {
      const handleNewPoll = (data) => {
        // Add new poll to the list
        setPolls(prevPolls => [data, ...prevPolls]);
        notifyNewPoll(data);
      };

      const handlePollUpdate = (data) => {
        // Update existing poll
        setPolls(prevPolls => 
          prevPolls.map(poll => 
            poll._id === data.pollId ? { ...poll, ...data } : poll
          )
        );
      };

      const handlePollDelete = (data) => {
        // Remove deleted poll
        setPolls(prevPolls => 
          prevPolls.filter(poll => poll._id !== data.pollId)
        );
      };

      // Subscribe to real-time events
      SocketService.on('new-poll', handleNewPoll);
      SocketService.on('poll-updated', handlePollUpdate);
      SocketService.on('poll-deleted', handlePollDelete);

      return () => {
        // Cleanup listeners
        SocketService.off('new-poll', handleNewPoll);
        SocketService.off('poll-updated', handlePollUpdate);
        SocketService.off('poll-deleted', handlePollDelete);
      };
    }, [notifyNewPoll])
  );

  // Initial data load
  useEffect(() => {
    loadHomeData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading polls..." />;
  }

  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={loadHomeData}
        message="Failed to load polls. Please try again."
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary[500], theme.colors.primary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🇮🇳 JanMat</Text>
          <Text style={styles.headerSubtitle}>
            Nation's Voice. In One Place.
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{polls.length}</Text>
              <Text style={styles.statLabel}>Active Polls</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {polls.reduce((sum, poll) => sum + poll.totalVotes, 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Votes</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <QuickActions onCreatePetition={handleCreatePetition} />

        {/* Sentiment Widget */}
        {sentimentData && (
          <SentimentWidget data={sentimentData} />
        )}

        {/* Trending Widget */}
        {trendingData && (
          <TrendingWidget data={trendingData} />
        )}

        {/* Active Polls */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Polls</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {polls.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="poll" size={48} color={theme.colors.neutral[400]} />
              <Text style={styles.emptyStateText}>
                No active polls at the moment
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Check back later for new polls
              </Text>
            </View>
          ) : (
            <View style={styles.pollsContainer}>
              {polls.map((poll, index) => (
                <PollCard
                  key={poll._id || index}
                  poll={poll}
                  onPress={() => handlePollPress(poll)}
                  onViewResults={() => handleViewResults(poll)}
                  showResultsButton={poll.totalVotes > 0}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg
  },
  headerContent: {
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[0],
    marginBottom: theme.spacing.xs
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.neutral[100],
    marginBottom: theme.spacing.lg
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[0]
  },
  statLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.neutral[100],
    marginTop: theme.spacing.xs
  },
  content: {
    flex: 1
  },
  section: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary
  },
  seeAllText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium
  },
  pollsContainer: {
    gap: theme.spacing.md
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center'
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.sm,
    textAlign: 'center'
  },
  bottomSpacing: {
    height: theme.spacing.xl
  }
});

export default HomeScreen;