/**
 * Yes/No Voting Component
 * Handles binary voting interface with visual feedback
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

export default function YesNoVote({ 
  onVote, 
  pollId, 
  disabled = false, 
  initialResults = null 
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [animValue] = useState(new Animated.Value(0));

  const handleVote = async (option) => {
    if (disabled || selectedOption) return;
    
    setSelectedOption(option);
    
    // Animate selection
    Animated.sequence([
      Animated.spring(animValue, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true
      }),
      Animated.spring(animValue, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();

    try {
      await onVote(pollId, { pollType: 'YES_NO', selectedOption: option });
    } catch (error) {
      console.error('Vote error:', error);
      setSelectedOption(null);
    }
  };

  const scaleAnim = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1]
  });

  const getVoteCounts = () => {
    if (!initialResults || !initialResults.yes_no_breakdown) {
      return { yes: 0, no: 0, total: 0 };
    }
    return {
      yes: initialResults.yes_no_breakdown.yes || 0,
      no: initialResults.yes_no_breakdown.no || 0,
      total: (initialResults.yes_no_breakdown.yes || 0) + (initialResults.yes_no_breakdown.no || 0)
    };
  };

  const voteCounts = getVoteCounts();
  const hasVoted = selectedOption !== null;

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        {/* YES Option */}
        <Animated.View style={[styles.optionContainer, { transform: [{ scale: selectedOption === 'YES' ? scaleAnim : 1 }]}]}>
          <TouchableOpacity
            style={[
              styles.yesButton,
              selectedOption === 'YES' && styles.selectedYesButton,
              disabled && styles.disabledButton
            ]}
            onPress={() => handleVote('YES')}
            disabled={disabled || hasVoted}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.voteText,
              selectedOption === 'YES' && styles.selectedVoteText
            ]}>
              YES
            </Text>
            <Text style={[
              styles.voteCount,
              selectedOption === 'YES' && styles.selectedVoteCount
            ]}>
              {voteCounts.yes} votes
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* NO Option */}
        <Animated.View style={[styles.optionContainer, { transform: [{ scale: selectedOption === 'NO' ? scaleAnim : 1 }]}]}>
          <TouchableOpacity
            style={[
              styles.noButton,
              selectedOption === 'NO' && styles.selectedNoButton,
              disabled && styles.disabledButton
            ]}
            onPress={() => handleVote('NO')}
            disabled={disabled || hasVoted}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.voteText,
              selectedOption === 'NO' && styles.selectedVoteText
            ]}>
              NO
            </Text>
            <Text style={[
              styles.voteCount,
              selectedOption === 'NO' && styles.selectedVoteCount
            ]}>
              {voteCounts.no} votes
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Results Bar */}
      {voteCounts.total > 0 && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsBar}>
            <View 
              style={[
                styles.resultsFill, 
                { 
                  width: `${(voteCounts.yes / voteCounts.total) * 100}%`,
                  backgroundColor: theme.colors.success
                }
              ]} 
            />
          </View>
          <Text style={styles.resultsText}>
            {voteCounts.yes}% YES • {voteCounts.no}% NO
          </Text>
        </View>
      )}

      {hasVoted && (
        <Text style={styles.voteStatus}>
          Your vote: <Text style={styles.voteStatusBold}>{selectedOption}</Text>
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
  optionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg
  },
  optionContainer: {
    flex: 1
  },
  yesButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.small
  },
  noButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.small
  },
  selectedYesButton: {
    backgroundColor: theme.colors.success,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  selectedNoButton: {
    backgroundColor: theme.colors.error,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  disabledButton: {
    opacity: 0.6
  },
  voteText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.neutral[0],
    marginBottom: theme.spacing.xs
  },
  selectedVoteText: {
    color: theme.colors.neutral[0]
  },
  voteCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[0],
    opacity: 0.9
  },
  selectedVoteCount: {
    fontWeight: 'bold'
  },
  resultsContainer: {
    marginTop: theme.spacing.md
  },
  resultsBar: {
    height: 6,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm
  },
  resultsFill: {
    height: '100%',
    borderRadius: 3
  },
  resultsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    textAlign: 'center'
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