/**
 * Poll Card Component for JanMat App
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { theme, componentTheme } from '../theme/theme';

const PollCard = ({ poll, onPress, onViewResults, showResultsButton = false }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  const getCategoryIcon = (category) => {
    const icons = {
      national: 'public',
      local: 'location-city',
      social: 'people',
      economic: 'trending-up',
      political: 'how-to-vote'
    };
    return icons[category] || 'help';
  };

  const getCategoryColor = (category) => {
    const colors = {
      national: theme.colors.primary[500],
      local: theme.colors.accent.green,
      social: theme.colors.accent.saffron,
      economic: theme.colors.warning,
      political: theme.colors.accent.neutral
    };
    return colors[category] || theme.colors.primary[500];
  };

  const formatTimeRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Less than 1h left';
  };

  return (
    <TouchableOpacity
      style={[
        componentTheme.pollCard,
        isPressed && { transform: [{ scale: 0.98 }] }
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Icon 
            name={getCategoryIcon(poll.category)} 
            size={20} 
            color={getCategoryColor(poll.category)}
          />
          <Text style={styles.categoryText}>
            {poll.category.charAt(0).toUpperCase() + poll.category.slice(1)}
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <Icon name="schedule" size={16} color={theme.colors.text.muted} />
          <Text style={styles.timeText}>
            {formatTimeRemaining(poll.endDate)}
          </Text>
        </View>
      </View>

      {/* Poll Title */}
      <Text style={styles.title} numberOfLines={2}>
        {poll.title}
      </Text>

      {/* Poll Description */}
      {poll.description && (
        <Text style={styles.description} numberOfLines={2}>
          {poll.description}
        </Text>
      )}

      {/* Poll Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Icon name="how-to-vote" size={16} color={theme.colors.primary[500]} />
          <Text style={styles.statText}>
            {poll.totalVotes.toLocaleString()} votes
          </Text>
        </View>
        
        {poll.state && (
          <View style={styles.statItem}>
            <Icon name="place" size={16} color={theme.colors.text.muted} />
            <Text style={styles.statText}>{poll.state}</Text>
          </View>
        )}
      </View>

      {/* Featured Badge */}
      {poll.metadata?.featured && (
        <LinearGradient
          colors={[theme.colors.accent.saffron, theme.colors.accent.green]}
          style={styles.featuredBadge}
        >
          <Icon name="star" size={12} color={theme.colors.neutral[0]} />
          <Text style={styles.featuredText}>Featured</Text>
        </LinearGradient>
      )}

      {/* Action Buttons */}
      {showResultsButton && onViewResults && (
        <TouchableOpacity
          style={styles.resultsButton}
          onPress={onViewResults}
        >
          <Text style={styles.resultsButtonText}>View Results</Text>
          <Icon name="chevron-right" size={20} color={theme.colors.primary[500]} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small
  },
  categoryText: {
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.muted,
    marginLeft: theme.spacing.xs
  },
  title: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.tight,
    marginBottom: theme.spacing.sm
  },
  description: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.normal,
    marginBottom: theme.spacing.md
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.muted,
    marginLeft: theme.spacing.xs
  },
  featuredBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small
  },
  featuredText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[0],
    marginLeft: theme.spacing.xs
  },
  resultsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary[200]
  },
  resultsButtonText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[500],
    marginRight: theme.spacing.xs
  }
});

export default PollCard;