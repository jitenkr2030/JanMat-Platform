/**
 * Results Screen - Analytics Dashboard
 * Shows sentiment index, state-wise results, trending topics, and demographic charts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import ApiService from '../services/ApiService';
import SocketService from '../services/SocketService';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  'All',
  'Politics',
  'Economy', 
  'Social Issues',
  'Education',
  'Environment',
  'Healthcare',
  'Infrastructure'
];

const STATES = [
  'All States',
  'Maharashtra',
  'Uttar Pradesh',
  'Karnataka',
  'Tamil Nadu',
  'Gujarat',
  'Rajasthan',
  'Madhya Pradesh',
  'West Bengal',
  'Andhra Pradesh',
  'Telangana',
  'Kerala',
  'Punjab',
  'Haryana',
  'Delhi',
  'Other'
];

export default function ResultsScreen({ navigation }) {
  // State
  const [sentimentIndex, setSentimentIndex] = useState(null);
  const [stateResults, setStateResults] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [demographicData, setDemographicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All States');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'states', 'demographics'

  // Load results data
  const loadResultsData = useCallback(async () => {
    try {
      setError(null);
      
      // Load sentiment index
      const sentimentResponse = await ApiService.getSentimentIndex({
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });
      setSentimentIndex(sentimentResponse.data);
      
      // Load state-wise results
      const stateResponse = await ApiService.getStateResults({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        state: selectedState !== 'All States' ? selectedState : undefined
      });
      setStateResults(stateResponse.data);
      
      // Load trending topics
      const trendingResponse = await ApiService.getTrendingTopics({
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });
      setTrendingTopics(trendingResponse.data);
      
      // Load demographic data
      const demographicResponse = await ApiService.getDemographicResults({
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });
      setDemographicData(demographicResponse.data);
      
    } catch (err) {
      console.error('Error loading results:', err);
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedState]);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadResultsData();
  };

  // Set up Socket.IO listeners for real-time updates
  useFocusEffect(
    useCallback(() => {
      const onResultsUpdate = () => {
        loadResultsData();
      };

      SocketService.on('results_updated', onResultsUpdate);

      return () => {
        SocketService.off('results_updated', onResultsUpdate);
      };
    }, [loadResultsData])
  );

  // Load data on mount and when filters change
  useEffect(() => {
    loadResultsData();
  }, [loadResultsData]);

  // Get sentiment color
  const getSentimentColor = (score) => {
    if (score >= 0.6) return theme.colors.success;
    if (score >= 0.4) return theme.colors.warning;
    return theme.colors.error;
  };

  // Get sentiment label
  const getSentimentLabel = (score) => {
    if (score >= 0.7) return 'Very Positive';
    if (score >= 0.6) return 'Positive';
    if (score >= 0.4) return 'Neutral';
    if (score >= 0.3) return 'Negative';
    return 'Very Negative';
  };

  // Render filter section
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              selectedCategory === category && styles.activeFilterChip
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.filterText,
              selectedCategory === category && styles.activeFilterText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateFilters}>
        {STATES.map((state) => (
          <TouchableOpacity
            key={state}
            style={[
              styles.stateFilterChip,
              selectedState === state && styles.activeStateFilterChip
            ]}
            onPress={() => setSelectedState(state)}
          >
            <Text style={[
              styles.stateFilterText,
              selectedState === state && styles.activeStateFilterText
            ]}>
              {state}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render overview tab
  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Sentiment Index */}
      {sentimentIndex && (
        <View style={styles.sentimentContainer}>
          <Text style={styles.sectionTitle}>Public Sentiment Index</Text>
          <View style={styles.sentimentCard}>
            <View style={styles.sentimentMain}>
              <Text style={[
                styles.sentimentScore,
                { color: getSentimentColor(sentimentIndex.overall_score) }
              ]}>
                {(sentimentIndex.overall_score * 100).toFixed(1)}
              </Text>
              <Text style={styles.sentimentLabel}>
                {getSentimentLabel(sentimentIndex.overall_score)}
              </Text>
            </View>
            
            <View style={styles.sentimentBreakdown}>
              <View style={styles.sentimentMetric}>
                <Text style={styles.metricLabel}>Trust</Text>
                <Text style={[
                  styles.metricValue,
                  { color: getSentimentColor(sentimentIndex.trust_score) }
                ]}>
                  {(sentimentIndex.trust_score * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.sentimentMetric}>
                <Text style={styles.metricLabel}>Support</Text>
                <Text style={[
                  styles.metricValue,
                  { color: getSentimentColor(sentimentIndex.support_score) }
                ]}>
                  {(sentimentIndex.support_score * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.sentimentMetric}>
                <Text style={styles.metricLabel}>Satisfaction</Text>
                <Text style={[
                  styles.metricValue,
                  { color: getSentimentColor(sentimentIndex.satisfaction_score) }
                ]}>
                  {(sentimentIndex.satisfaction_score * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Trending Topics */}
      <View style={styles.trendingContainer}>
        <Text style={styles.sectionTitle}>Trending Topics</Text>
        {trendingTopics.slice(0, 5).map((topic, index) => (
          <TouchableOpacity 
            key={topic.id || index}
            style={styles.trendingItem}
            onPress={() => navigation.navigate('PollDetail', { pollId: topic.id })}
          >
            <View style={styles.trendingRank}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.trendingContent}>
              <Text style={styles.trendingTitle}>{topic.title}</Text>
              <Text style={styles.trendingMeta}>
                {topic.category} • {topic.voteCount} votes
              </Text>
            </View>
            <Icon name="trending-up" size={20} color={theme.colors.success} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render states tab
  const renderStates = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>State-wise Results</Text>
      {stateResults && Object.entries(stateResults).map(([state, data]) => (
        <View key={state} style={styles.stateItem}>
          <View style={styles.stateHeader}>
            <Text style={styles.stateName}>{state}</Text>
            <Text style={styles.stateScore}>
              {(data.sentiment_score * 100).toFixed(1)}
            </Text>
          </View>
          
          <View style={styles.stateProgressBar}>
            <View 
              style={[
                styles.stateProgressFill,
                { 
                  width: `${data.sentiment_score * 100}%`,
                  backgroundColor: getSentimentColor(data.sentiment_score)
                }
              ]} 
            />
          </View>
          
          <View style={styles.stateStats}>
            <Text style={styles.stateStat}>
              {data.pollCount} polls
            </Text>
            <Text style={styles.stateStat}>
              {data.totalVotes} votes
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  // Render demographics tab
  const renderDemographics = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Demographic Breakdown</Text>
      
      {demographicData?.age_groups && (
        <View style={styles.demographicSection}>
          <Text style={styles.subsectionTitle}>By Age Group</Text>
          {Object.entries(demographicData.age_groups).map(([age, count]) => {
            const total = Object.values(demographicData.age_groups).reduce((sum, c) => sum + c, 0);
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            return (
              <View key={age} style={styles.demographicItem}>
                <Text style={styles.demographicLabel}>{age}</Text>
                <View style={styles.demographicBar}>
                  <View 
                    style={[
                      styles.demographicFill,
                      { width: `${percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.demographicValue}>{percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      )}

      {demographicData?.genders && (
        <View style={styles.demographicSection}>
          <Text style={styles.subsectionTitle}>By Gender</Text>
          {Object.entries(demographicData.genders).map(([gender, count]) => {
            const total = Object.values(demographicData.genders).reduce((sum, c) => sum + c, 0);
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            return (
              <View key={gender} style={styles.demographicItem}>
                <Text style={styles.demographicLabel}>{gender}</Text>
                <View style={styles.demographicBar}>
                  <View 
                    style={[
                      styles.demographicFill,
                      { width: `${percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.demographicValue}>{percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      )}

      {demographicData?.cities && (
        <View style={styles.demographicSection}>
          <Text style={styles.subsectionTitle}>Top Cities</Text>
          {Object.entries(demographicData.cities)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([city, count]) => {
              const total = Object.values(demographicData.cities).reduce((sum, c) => sum + c, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <View key={city} style={styles.demographicItem}>
                  <Text style={styles.demographicLabel}>{city}</Text>
                  <View style={styles.demographicBar}>
                    <View 
                      style={[
                        styles.demographicFill,
                        { width: `${percentage}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.demographicValue}>{count}</Text>
                </View>
              );
            })}
        </View>
      )}
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRetry={loadResultsData}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics & Results</Text>
      </View>

      {/* Filters */}
      {renderFilters()}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'overview' && styles.activeTabText
          ]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'states' && styles.activeTab]}
          onPress={() => setActiveTab('states')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'states' && styles.activeTabText
          ]}>
            States
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'demographics' && styles.activeTab]}
          onPress={() => setActiveTab('demographics')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'demographics' && styles.activeTabText
          ]}>
            Demographics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'states' && renderStates()}
        {activeTab === 'demographics' && renderDemographics()}
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[0],
    textAlign: 'center'
  },
  filtersContainer: {
    backgroundColor: theme.colors.neutral[0],
    paddingVertical: theme.spacing.md,
    ...theme.shadows.small
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.full
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  activeFilterText: {
    color: theme.colors.neutral[0]
  },
  stateFilters: {
    marginTop: theme.spacing.sm
  },
  stateFilterChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.sm
  },
  activeStateFilterChip: {
    backgroundColor: theme.colors.secondary
  },
  stateFilterText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  activeStateFilterText: {
    color: theme.colors.neutral[0]
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
    fontSize: theme.typography.fontSize.md,
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
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md
  },
  sentimentContainer: {
    marginBottom: theme.spacing.lg
  },
  sentimentCard: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium
  },
  sentimentMain: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg
  },
  sentimentScore: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs
  },
  sentimentLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  sentimentBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  sentimentMetric: {
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xs
  },
  metricValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold'
  },
  trendingContainer: {
    backgroundColor: theme.colors.neutral[0],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.medium
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100]
  },
  trendingRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md
  },
  rankText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 'bold'
  },
  trendingContent: {
    flex: 1
  },
  trendingTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[800],
    fontWeight: '500',
    marginBottom: theme.spacing.xs
  },
  trendingMeta: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500]
  },
  stateItem: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small
  },
  stateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  stateName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[800]
  },
  stateScore: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  stateProgressBar: {
    height: 6,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm
  },
  stateProgressFill: {
    height: '100%',
    borderRadius: 3
  },
  stateStats: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stateStat: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600]
  },
  demographicSection: {
    backgroundColor: theme.colors.neutral[0],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium
  },
  subsectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.md
  },
  demographicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  demographicLabel: {
    width: 80,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  demographicBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: theme.spacing.md
  },
  demographicFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4
  },
  demographicValue: {
    width: 50,
    textAlign: 'right',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '600'
  }
});