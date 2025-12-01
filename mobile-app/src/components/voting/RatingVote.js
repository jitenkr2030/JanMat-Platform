/**
 * Rating Voting Component
 * Handles 1-10 rating interface with interactive slider and visual feedback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

export default function RatingVote({ 
  onVote, 
  pollId, 
  disabled = false,
  initialResults = null 
}) {
  const [selectedRating, setSelectedRating] = useState(null);
  const [animValue] = useState(new Animated.Value(0));

  const handleRatingSelect = async (rating) => {
    if (disabled || selectedRating) return;
    
    setSelectedRating(rating);
    
    // Animate the selected rating
    Animated.sequence([
      Animated.spring(animValue, {
        toValue: rating,
        tension: 100,
        friction: 10,
        useNativeDriver: false
      }),
    ]).start();

    try {
      await onVote(pollId, { 
        pollType: 'RATING', 
        rating: rating 
      });
    } catch (error) {
      console.error('Vote error:', error);
      setSelectedRating(null);
    }
  };

  const getRatingDescription = (rating) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 7) return 'Very Good';
    if (rating >= 5) return 'Good';
    if (rating >= 3) return 'Fair';
    if (rating >= 1) return 'Poor';
    return '';
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return theme.colors.success;
    if (rating >= 6) return theme.colors.warning;
    if (rating >= 4) return theme.colors.primary;
    return theme.colors.error;
  };

  const getAverageRating = () => {
    if (!initialResults || !initialResults.rating_distribution) {
      return 0;
    }
    const distribution = initialResults.rating_distribution;
    let totalVotes = 0;
    let weightedSum = 0;
    
    for (let rating = 1; rating <= 10; rating++) {
      const votes = distribution[rating] || 0;
      totalVotes += votes;
      weightedSum += votes * rating;
    }
    
    return totalVotes > 0 ? Math.round((weightedSum / totalVotes) * 10) / 10 : 0;
  };

  const averageRating = getAverageRating();
  const hasVoted = selectedRating !== null;

  return (
    <View style={styles.container}>
      {/* Current Selection Display */}
      {selectedRating && (
        <Animated.View style={styles.selectionContainer}>
          <Text style={styles.selectedLabel}>Your Rating:</Text>
          <Animated.View style={styles.selectedRatingContainer}>
            <Text style={[
              styles.selectedRating,
              { color: getRatingColor(selectedRating) }
            ]}>
              {selectedRating}
            </Text>
            <Text style={[
              styles.ratingDescription,
              { color: getRatingColor(selectedRating) }
            ]}>
              {getRatingDescription(selectedRating)}
            </Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* Average Rating Display */}
      {averageRating > 0 && (
        <View style={styles.averageContainer}>
          <Text style={styles.averageLabel}>Community Average:</Text>
          <View style={styles.averageRatingContainer}>
            <Text style={[
              styles.averageRating,
              { color: getRatingColor(averageRating) }
            ]}>
              {averageRating}/10
            </Text>
            <Text style={[
              styles.averageDescription,
              { color: getRatingColor(averageRating) }
            ]}>
              {getRatingDescription(averageRating)}
            </Text>
          </View>
        </View>
      )}

      {/* Rating Scale */}
      <View style={styles.ratingScale}>
        <Text style={styles.ratingLabel}>Rate from 1 to 10:</Text>
        
        <View style={styles.ratingNumbers}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingNumber,
                selectedRating === rating && styles.selectedRatingNumber,
                selectedRating >= rating && styles.filledRatingNumber,
                disabled && styles.disabledNumber
              ]}
              onPress={() => handleRatingSelect(rating)}
              disabled={disabled || hasVoted}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.ratingNumberText,
                selectedRating >= rating && styles.selectedRatingNumberText,
                disabled && styles.disabledNumberText
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rating Labels */}
        <View style={styles.ratingLabels}>
          <Text style={styles.ratingLabelText}>Poor</Text>
          <Text style={styles.ratingLabelText}>Fair</Text>
          <Text style={styles.ratingLabelText}>Good</Text>
          <Text style={styles.ratingLabelText}>Great</Text>
          <Text style={styles.ratingLabelText}>Excellent</Text>
        </View>
      </View>

      {/* Rating Distribution */}
      {initialResults && initialResults.rating_distribution && (
        <View style={styles.distributionContainer}>
          <Text style={styles.distributionTitle}>Rating Distribution:</Text>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => {
            const votes = initialResults.rating_distribution[rating] || 0;
            const totalVotes = Object.values(initialResults.rating_distribution).reduce((sum, count) => sum + count, 0);
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            
            return (
              <View key={rating} style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>{rating}</Text>
                <View style={styles.distributionBar}>
                  <View 
                    style={[
                      styles.distributionFill,
                      { 
                        width: `${percentage}%`,
                        backgroundColor: getRatingColor(rating)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.distributionValue}>{votes}</Text>
              </View>
            );
          })}
        </View>
      )}

      {hasVoted && (
        <Text style={styles.voteStatus}>
          Your rating of <Text style={styles.voteStatusBold}>{selectedRating}/10</Text> has been recorded
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg
  },
  selectionContainer: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center'
  },
  selectedLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xs
  },
  selectedRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectedRating: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    marginRight: theme.spacing.sm
  },
  ratingDescription: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600'
  },
  averageContainer: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center'
  },
  averageLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xs
  },
  averageRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  averageRating: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    marginRight: theme.spacing.sm
  },
  averageDescription: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600'
  },
  ratingScale: {
    marginBottom: theme.spacing.lg
  },
  ratingLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontWeight: '500'
  },
  ratingNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm
  },
  ratingNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[0],
    ...theme.shadows.small
  },
  selectedRatingNumber: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  filledRatingNumber: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary + '40'
  },
  disabledNumber: {
    opacity: 0.5
  },
  ratingNumberText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.neutral[600]
  },
  selectedRatingNumberText: {
    color: theme.colors.neutral[0]
  },
  disabledNumberText: {
    opacity: 0.5
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs
  },
  ratingLabelText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    flex: 1
  },
  distributionContainer: {
    backgroundColor: theme.colors.neutral[0],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small
  },
  distributionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md,
    textAlign: 'center'
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs
  },
  distributionLabel: {
    width: 20,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    fontWeight: '600'
  },
  distributionBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 3,
    marginHorizontal: theme.spacing.sm,
    overflow: 'hidden'
  },
  distributionFill: {
    height: '100%',
    borderRadius: 3
  },
  distributionValue: {
    width: 30,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    textAlign: 'right',
    fontWeight: '500'
  },
  voteStatus: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontWeight: '500'
  },
  voteStatusBold: {
    fontWeight: 'bold'
  }
});