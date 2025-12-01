/**
 * Communities Screen
 * Community discussions and local groups
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';

const COMMUNITY_CATEGORIES = [
  { key: 'local', label: 'Local Community', icon: 'location-on' },
  { key: 'professional', label: 'Professional', icon: 'work' },
  { key: 'interest', label: 'Interest Groups', icon: 'favorite' },
  { key: 'education', label: 'Education', icon: 'school' },
  { key: 'environment', label: 'Environment', icon: 'eco' },
  { key: 'health', label: 'Health & Wellness', icon: 'local-hospital' }
];

const FEATURED_COMMUNITIES = [
  {
    id: 1,
    name: 'Mumbai Youth Forum',
    description: 'Engaging young Mumbaikars in civic discussions',
    members: 1250,
    category: 'local',
    image: null
  },
  {
    id: 2,
    name: 'Tech for Good India',
    description: 'Technology professionals driving social change',
    members: 890,
    category: 'professional',
    image: null
  },
  {
    id: 3,
    name: 'Clean India Initiative',
    description: 'Environmental conservation and sustainability',
    members: 2100,
    category: 'environment',
    image: null
  },
  {
    id: 4,
    name: 'Education Reform Advocates',
    description: 'Improving education quality across India',
    members: 756,
    category: 'education',
    image: null
  }
];

const TRENDING_DISCUSSIONS = [
  {
    id: 1,
    title: 'Sustainable Transportation in Urban Areas',
    community: 'Mumbai Youth Forum',
    replies: 45,
    lastActivity: '2 hours ago'
  },
  {
    id: 2,
    title: 'Digital Education Accessibility',
    community: 'Education Reform Advocates',
    replies: 23,
    lastActivity: '4 hours ago'
  },
  {
    id: 3,
    title: 'Renewable Energy Policies',
    community: 'Clean India Initiative',
    replies: 67,
    lastActivity: '6 hours ago'
  }
];

export default function CommunitiesScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [communities] = useState(FEATURED_COMMUNITIES);

  const filteredCommunities = selectedCategory === 'all' 
    ? communities 
    : communities.filter(community => community.category === selectedCategory);

  const handleCommunityPress = (community) => {
    Alert.alert('Community Details', `Join ${community.name} discussion forum`);
  };

  const handleDiscussionPress = (discussion) => {
    Alert.alert('Discussion', `Open "${discussion.title}" discussion`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communities</Text>
        <Text style={styles.headerSubtitle}>
          Connect with like-minded people
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Create Community', 'Create a new community feature coming soon!')}
          >
            <Icon name="group-add" size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Create Community</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Find Communities', 'Discover communities near you')}
          >
            <Icon name="search" size={24} color={theme.colors.secondary} />
            <Text style={styles.quickActionText}>Discover</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === 'all' && styles.activeCategoryChip
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === 'all' && styles.activeCategoryText
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            {COMMUNITY_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.key && styles.activeCategoryChip
                ]}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Icon 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.key ? theme.colors.neutral[0] : theme.colors.neutral[600]} 
                  style={styles.categoryIcon}
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.key && styles.activeCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Communities */}
        <View style={styles.communitiesContainer}>
          <Text style={styles.sectionTitle}>Featured Communities</Text>
          
          {filteredCommunities.map((community) => (
            <TouchableOpacity
              key={community.id}
              style={styles.communityCard}
              onPress={() => handleCommunityPress(community)}
              activeOpacity={0.8}
            >
              <View style={styles.communityHeader}>
                <View style={styles.communityAvatar}>
                  <Icon name="group" size={24} color={theme.colors.primary} />
                </View>
                
                <View style={styles.communityInfo}>
                  <Text style={styles.communityName}>{community.name}</Text>
                  <Text style={styles.communityMembers}>
                    {community.members.toLocaleString()} members
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.joinButton}
                  onPress={() => Alert.alert('Join Community', `Join ${community.name}?`)}
                >
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.communityDescription}>
                {community.description}
              </Text>
              
              <View style={styles.communityTags}>
                {COMMUNITY_CATEGORIES
                  .filter(cat => cat.key === community.category)
                  .map((category) => (
                    <View key={category.key} style={styles.communityTag}>
                      <Text style={styles.communityTagText}>{category.label}</Text>
                    </View>
                  ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending Discussions */}
        <View style={styles.discussionsContainer}>
          <View style={styles.discussionsHeader}>
            <Text style={styles.sectionTitle}>Trending Discussions</Text>
            <TouchableOpacity 
              onPress={() => Alert.alert('All Discussions', 'View all community discussions')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {TRENDING_DISCUSSIONS.map((discussion) => (
            <TouchableOpacity
              key={discussion.id}
              style={styles.discussionCard}
              onPress={() => handleDiscussionPress(discussion)}
              activeOpacity={0.8}
            >
              <View style={styles.discussionContent}>
                <Text style={styles.discussionTitle}>{discussion.title}</Text>
                <Text style={styles.discussionCommunity}>{discussion.community}</Text>
              </View>
              
              <View style={styles.discussionStats}>
                <View style={styles.discussionStat}>
                  <Icon name="chat-bubble" size={16} color={theme.colors.neutral[500]} />
                  <Text style={styles.discussionStatText}>{discussion.replies}</Text>
                </View>
                <Text style={styles.discussionTime}>{discussion.lastActivity}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Discussion */}
        <TouchableOpacity 
          style={styles.createDiscussionButton}
          onPress={() => Alert.alert('Start Discussion', 'Start a new community discussion')}
        >
          <Icon name="add-circle" size={24} color={theme.colors.neutral[0]} />
          <Text style={styles.createDiscussionText}>Start New Discussion</Text>
        </TouchableOpacity>
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
    paddingBottom: theme.spacing.lg
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.neutral[0],
    marginBottom: theme.spacing.xs
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[0],
    opacity: 0.9
  },
  content: {
    flex: 1
  },
  quickActionsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small
  },
  quickActionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[700],
    fontWeight: '500',
    marginLeft: theme.spacing.xs
  },
  categoriesContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md
  },
  categoriesScroll: {
    marginHorizontal: -theme.spacing.md
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.full
  },
  activeCategoryChip: {
    backgroundColor: theme.colors.primary
  },
  categoryIcon: {
    marginRight: theme.spacing.xs
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  activeCategoryText: {
    color: theme.colors.neutral[0]
  },
  communitiesContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg
  },
  communityCard: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  communityAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md
  },
  communityInfo: {
    flex: 1
  },
  communityName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.xs
  },
  communityMembers: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500]
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm
  },
  joinButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[0],
    fontWeight: '600'
  },
  communityDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    lineHeight: 18,
    marginBottom: theme.spacing.md
  },
  communityTags: {
    flexDirection: 'row'
  },
  communityTag: {
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm
  },
  communityTagText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '500'
  },
  discussionsContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg
  },
  discussionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  seeAllText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500'
  },
  discussionCard: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.small
  },
  discussionContent: {
    flex: 1
  },
  discussionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.xs
  },
  discussionCommunity: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500]
  },
  discussionStats: {
    alignItems: 'flex-end'
  },
  discussionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs
  },
  discussionStatText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500],
    marginLeft: theme.spacing.xs
  },
  discussionTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[400]
  },
  createDiscussionButton: {
    backgroundColor: theme.colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg
  },
  createDiscussionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[0],
    fontWeight: '600',
    marginLeft: theme.spacing.sm
  }
});