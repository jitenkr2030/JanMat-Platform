/**
 * Explore Screen
 * Browse and filter polls and petitions with advanced search functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import PollCard from '../components/PollCard';
import ApiService from '../services/ApiService';
import SocketService from '../services/SocketService';

const CONTENT_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'polls', label: 'Polls' },
  { key: 'petitions', label: 'Petitions' }
];

const CATEGORIES = [
  'All Categories',
  'Politics',
  'Economy',
  'Social Issues', 
  'Education',
  'Environment',
  'Healthcare',
  'Infrastructure'
];

const SORT_OPTIONS = [
  { key: 'recent', label: 'Most Recent' },
  { key: 'trending', label: 'Trending' },
  { key: 'popular', label: 'Most Popular' },
  { key: 'ending', label: 'Ending Soon' }
];

export default function ExploreScreen({ navigation }) {
  // State
  const [polls, setPolls] = useState([]);
  const [petitions, setPetitions] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [filteredPetitions, setFilteredPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Load explore data
  const loadExploreData = useCallback(async () => {
    try {
      setError(null);
      
      // Load polls
      const pollsResponse = await ApiService.getAllPolls({
        category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        sort: selectedSort
      });
      setPolls(pollsResponse.data);
      
      // Load petitions
      const petitionsResponse = await ApiService.getAllPetitions({
        category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        sort: selectedSort
      });
      setPetitions(petitionsResponse.data);
      
    } catch (err) {
      console.error('Error loading explore data:', err);
      setError(err.response?.data?.message || 'Failed to load content');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedSort]);

  // Filter content based on search query and type
  const filterContent = useCallback(() => {
    let filteredPolls = [...polls];
    let filteredPetitions = [...petitions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredPolls = filteredPolls.filter(poll => 
        poll.question?.toLowerCase().includes(query) ||
        poll.description?.toLowerCase().includes(query) ||
        poll.category?.toLowerCase().includes(query)
      );
      
      filteredPetitions = filteredPetitions.filter(petition =>
        petition.title?.toLowerCase().includes(query) ||
        petition.description?.toLowerCase().includes(query) ||
        petition.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filteredPolls = filteredPolls.filter(poll => poll.category === selectedCategory);
      filteredPetitions = filteredPetitions.filter(petition => petition.category === selectedCategory);
    }

    // Apply sorting
    const applySorting = (items, type) => {
      switch (selectedSort) {
        case 'trending':
          return items.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
        case 'popular':
          return items.sort((a, b) => (b.voteCount || b.signatureCount || 0) - (a.voteCount || a.signatureCount || 0));
        case 'ending':
          if (type === 'polls') {
            return items.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
          }
          return items;
        default:
          return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    };

    filteredPolls = applySorting(filteredPolls, 'polls');
    filteredPetitions = applySorting(filteredPetitions, 'petitions');

    setFilteredPolls(filteredPolls);
    setFilteredPetitions(filteredPetitions);
  }, [polls, petitions, searchQuery, selectedCategory, selectedSort]);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadExploreData();
  };

  // Set up Socket.IO listeners for real-time updates
  useFocusEffect(
    useCallback(() => {
      const onContentUpdate = () => {
        loadExploreData();
      };

      SocketService.on('poll_updated', onContentUpdate);
      SocketService.on('petition_updated', onContentUpdate);

      return () => {
        SocketService.off('poll_updated', onContentUpdate);
        SocketService.off('petition_updated', onContentUpdate);
      };
    }, [loadExploreData])
  );

  // Load data on mount and when filters change
  useEffect(() => {
    loadExploreData();
  }, [loadExploreData]);

  // Apply filters when dependencies change
  useEffect(() => {
    filterContent();
  }, [filterContent]);

  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color={theme.colors.neutral[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search polls and petitions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.neutral[400]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="clear" size={20} color={theme.colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Icon 
          name="filter-list" 
          size={24} 
          color={theme.colors.primary} 
        />
      </TouchableOpacity>
    </View>
  );

  // Render filters
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Content Type Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {CONTENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.filterChip,
              selectedType === type.key && styles.activeFilterChip
            ]}
            onPress={() => setSelectedType(type.key)}
          >
            <Text style={[
              styles.filterText,
              selectedType === type.key && styles.activeFilterText
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryFilterChip,
              selectedCategory === category && styles.activeCategoryFilterChip
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryFilterText,
              selectedCategory === category && styles.activeCategoryFilterText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortChip,
              selectedSort === option.key && styles.activeSortChip
            ]}
            onPress={() => setSelectedSort(option.key)}
          >
            <Text style={[
              styles.sortText,
              selectedSort === option.key && styles.activeSortText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render polls section
  const renderPolls = () => {
    if (filteredPolls.length === 0 && selectedType !== 'petitions') {
      return (
        <View style={styles.emptyState}>
          <Icon name="how-to-vote" size={64} color={theme.colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No polls found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your filters or search terms.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.contentSection}>
        {(selectedType === 'all' || selectedType === 'polls') && (
          <View>
            <Text style={styles.sectionTitle}>Polls</Text>
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onPress={() => navigation.navigate('PollDetail', { pollId: poll.id })}
                style={styles.pollCard}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Render petitions section
  const renderPetitions = () => {
    if (filteredPetitions.length === 0 && selectedType !== 'polls') {
      return (
        <View style={styles.emptyState}>
          <Icon name="description" size={64} color={theme.colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No petitions found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your filters or search terms.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.contentSection}>
        {(selectedType === 'all' || selectedType === 'petitions') && (
          <View>
            <Text style={styles.sectionTitle}>Petitions</Text>
            {filteredPetitions.map((petition) => (
              <TouchableOpacity
                key={petition.id}
                style={styles.petitionCard}
                onPress={() => navigation.navigate('PetitionDetail', { petitionId: petition.id })}
              >
                <View style={styles.petitionHeader}>
                  <Text style={styles.petitionTitle}>{petition.title}</Text>
                  <View style={styles.petitionMeta}>
                    <Text style={styles.petitionCategory}>{petition.category}</Text>
                    <Text style={styles.petitionDate}>
                      {new Date(petition.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.petitionDescription} numberOfLines={2}>
                  {petition.description}
                </Text>
                
                <View style={styles.petitionStats}>
                  <View style={styles.petitionStat}>
                    <Icon name="how-to-vote" size={16} color={theme.colors.primary} />
                    <Text style={styles.petitionStatText}>
                      {petition.signatureCount || 0} signatures
                    </Text>
                  </View>
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
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

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
    return <LoadingSpinner message="Loading content..." />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRetry={loadExploreData}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Create')}
          style={styles.createButton}
        >
          <Icon name="add" size={24} color={theme.colors.neutral[0]} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {renderSearchBar()}

      {/* Filters */}
      {showFilters && renderFilters()}

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderPolls()}
        {renderPetitions()}
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
  createButton: {
    padding: theme.spacing.sm
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.neutral[0]
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[800]
  },
  filterButton: {
    padding: theme.spacing.sm
  },
  filtersContainer: {
    backgroundColor: theme.colors.neutral[0],
    paddingVertical: theme.spacing.md
  },
  filterRow: {
    marginBottom: theme.spacing.sm
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
  categoryFilterChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.sm
  },
  activeCategoryFilterChip: {
    backgroundColor: theme.colors.secondary
  },
  categoryFilterText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  activeCategoryFilterText: {
    color: theme.colors.neutral[0]
  },
  sortChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.sm
  },
  activeSortChip: {
    backgroundColor: theme.colors.accent
  },
  sortText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  activeSortText: {
    color: theme.colors.neutral[0]
  },
  content: {
    flex: 1
  },
  contentSection: {
    padding: theme.spacing.md
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md
  },
  pollCard: {
    marginBottom: theme.spacing.md
  },
  petitionCard: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small
  },
  petitionHeader: {
    marginBottom: theme.spacing.sm
  },
  petitionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.xs
  },
  petitionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  petitionCategory: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500'
  },
  petitionDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500]
  },
  petitionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    lineHeight: 18,
    marginBottom: theme.spacing.md
  },
  petitionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  petitionStat: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  petitionStatText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginLeft: theme.spacing.xs,
    fontWeight: '500'
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase'
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
    lineHeight: 20
  }
});