/**
 * Emoji Voting Component
 * Handles emoji reaction voting interface with visual feedback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { theme } from '../../theme/theme';

const { width } = Dimensions.get('window');

const EMOJI_OPTIONS = [
  { emoji: '😀', label: 'Happy', value: 'HAPPY' },
  { emoji: '😍', label: 'Love', value: 'LOVE' },
  { emoji: '😢', label: 'Sad', value: 'SAD' },
  { emoji: '😡', label: 'Angry', value: 'ANGRY' },
  { emoji: '😮', label: 'Surprised', value: 'SURPRISED' },
  { emoji: '👍', label: 'Thumbs Up', value: 'THUMBS_UP' },
  { emoji: '👎', label: 'Thumbs Down', value: 'THUMBS_DOWN' },
  { emoji: '🤔', label: 'Thinking', value: 'THINKING' }
];

export default function EmojiVote({ 
  onVote, 
  pollId, 
  disabled = false,
  initialResults = null 
}) {
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [animValues] = useState(EMOJI_OPTIONS.map(() => new Animated.Value(1)));

  const handleEmojiSelect = async (emojiValue, index) => {
    if (disabled || selectedEmoji) return;
    
    setSelectedEmoji(emojiValue);
    
    // Animate selected emoji
    Animated.sequence([
      Animated.spring(animValues[index], {
        toValue: 1.3,
        tension: 150,
        friction: 8,
        useNativeDriver: true
      }),
      Animated.spring(animValues[index], {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true
      })
    ]).start();

    try {
      await onVote(pollId, { 
        pollType: 'EMOJI', 
        emoji: emojiValue 
      });
    } catch (error) {
      console.error('Vote error:', error);
      setSelectedEmoji(null);
    }
  };

  const getEmojiResults = (emojiValue) => {
    if (!initialResults || !initialResults.emoji_breakdown) {
      return 0;
    }
    return initialResults.emoji_breakdown[emojiValue] || 0;
  };

  const getTotalVotes = () => {
    if (!initialResults || !initialResults.emoji_breakdown) {
      return 0;
    }
    return Object.values(initialResults.emoji_breakdown).reduce((sum, count) => sum + count, 0);
  };

  const totalVotes = getTotalVotes();

  const getEmojiPercentage = (emojiValue) => {
    const votes = getEmojiResults(emojiValue);
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getMostPopularEmoji = () => {
    if (totalVotes === 0) return null;
    let maxVotes = 0;
    let popularEmoji = null;
    
    EMOJI_OPTIONS.forEach(option => {
      const votes = getEmojiResults(option.value);
      if (votes > maxVotes) {
        maxVotes = votes;
        popularEmoji = option;
      }
    });
    
    return popularEmoji;
  };

  const popularEmoji = getMostPopularEmoji();
  const hasVoted = selectedEmoji !== null;

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        How do you feel about this?
      </Text>
      
      {/* Most Popular Emoji */}
      {popularEmoji && (
        <View style={styles.popularContainer}>
          <Text style={styles.popularLabel}>Most Popular:</Text>
          <View style={styles.popularEmojiContainer}>
            <Text style={styles.popularEmoji}>{popularEmoji.emoji}</Text>
            <Text style={styles.popularLabel}>{popularEmoji.label}</Text>
          </View>
        </View>
      )}

      {/* Emoji Grid */}
      <View style={styles.emojiGrid}>
        {EMOJI_OPTIONS.map((option, index) => {
          const isSelected = selectedEmoji === option.value;
          const percentage = getEmojiPercentage(option.value);
          const scaleAnim = animValues[index];
          
          return (
            <Animated.View
              key={option.value}
              style={[
                styles.emojiContainer,
                { transform: [{ scale: isSelected ? scaleAnim : 1 }] }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.emojiButton,
                  isSelected && styles.selectedEmojiButton,
                  disabled && styles.disabledEmojiButton
                ]}
                onPress={() => handleEmojiSelect(option.value, index)}
                disabled={disabled || hasVoted}
                activeOpacity={0.7}
              >
                <Animated.Text style={[
                  styles.emoji,
                  isSelected && styles.selectedEmoji
                ]}>
                  {option.emoji}
                </Animated.Text>
                
                {totalVotes > 0 && (
                  <View style={styles.emojiStats}>
                    <Text style={[
                      styles.emojiCount,
                      isSelected && styles.selectedEmojiCount
                    ]}>
                      {getEmojiResults(option.value)}
                    </Text>
                    <Text style={[
                      styles.emojiPercentage,
                      isSelected && styles.selectedEmojiPercentage
                    ]}>
                      {percentage}%
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <Text style={[
                styles.emojiLabel,
                isSelected && styles.selectedEmojiLabel
              ]}>
                {option.label}
              </Text>
              
              {/* Progress Ring */}
              {totalVotes > 0 && (
                <View style={styles.progressRing}>
                  <View 
                    style={[
                      styles.progressArc,
                      { 
                        width: `${percentage * 2}px`,
                        backgroundColor: isSelected 
                          ? theme.colors.primary 
                          : theme.colors.neutral[300]
                      }
                    ]} 
                  />
                </View>
              )}
            </Animated.View>
          );
        })}
      </View>

      {/* Results Summary */}
      {totalVotes > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Reaction Summary</Text>
          {EMOJI_OPTIONS.slice(0, 3).map(option => {
            const votes = getEmojiResults(option.value);
            const percentage = getEmojiPercentage(option.value);
            
            if (votes === 0) return null;
            
            return (
              <View key={option.value} style={styles.summaryRow}>
                <Text style={styles.summaryEmoji}>{option.emoji}</Text>
                <Text style={styles.summaryLabel}>{option.label}</Text>
                <Text style={styles.summaryStats}>
                  {votes} votes ({percentage}%)
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {hasVoted && (
        <Text style={styles.voteStatus}>
          Your reaction: <Text style={styles.voteStatusBold}>
            {EMOJI_OPTIONS.find(opt => opt.value === selectedEmoji)?.emoji} {option?.label}
          </Text>
        </Text>
      )}
      
      {totalVotes > 0 && (
        <Text style={styles.totalVotesText}>
          Total reactions: {totalVotes}
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
  instructionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    fontWeight: '500'
  },
  popularContainer: {
    backgroundColor: theme.colors.success + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center'
  },
  popularLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xs
  },
  popularEmojiContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  popularEmoji: {
    fontSize: theme.typography.fontSize.xxl,
    marginRight: theme.spacing.sm
  },
  popularEmojiLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.success,
    fontWeight: '600'
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg
  },
  emojiContainer: {
    width: (width - 48) / 4 - 8, // Account for padding and gaps
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  emojiButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    borderWidth: 2,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.small
  },
  selectedEmojiButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  disabledEmojiButton: {
    opacity: 0.6
  },
  emoji: {
    fontSize: 28
  },
  selectedEmoji: {
    transform: [{ scale: 1.1 }]
  },
  emojiStats: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center'
  },
  emojiCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[0],
    fontWeight: 'bold'
  },
  selectedEmojiCount: {
    color: theme.colors.neutral[0]
  },
  emojiPercentage: {
    fontSize: theme.typography.fontSize.xxs,
    color: theme.colors.neutral[0],
    opacity: 0.9
  },
  selectedEmojiPercentage: {
    opacity: 1
  },
  emojiLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    fontWeight: '500'
  },
  selectedEmojiLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold'
  },
  progressRing: {
    position: 'absolute',
    bottom: -2,
    height: 2,
    borderRadius: 1
  },
  progressArc: {
    height: 2,
    borderRadius: 1
  },
  summaryContainer: {
    backgroundColor: theme.colors.neutral[0],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small
  },
  summaryTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md,
    textAlign: 'center'
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  summaryEmoji: {
    fontSize: theme.typography.fontSize.md,
    marginRight: theme.spacing.sm,
    width: 24
  },
  summaryLabel: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[700],
    fontWeight: '500'
  },
  summaryStats: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '600'
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
  },
  totalVotesText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    marginTop: theme.spacing.sm
  }
});