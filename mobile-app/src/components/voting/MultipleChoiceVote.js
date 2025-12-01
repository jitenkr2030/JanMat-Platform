/**
 * Multiple Choice Voting Component
 * Handles multi-option voting interface with selection feedback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { theme } from '../../theme/theme';

export default function MultipleChoiceVote({ 
  options = [], 
  onVote, 
  pollId, 
  disabled = false,
  initialResults = null 
}) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  const handleOptionSelect = async (optionIndex, optionText) => {
    if (disabled || hasVoted) return;
    
    const newSelection = [...selectedOptions, optionText];
    setSelectedOptions(newSelection);
    setHasVoted(true);

    try {
      await onVote(pollId, { 
        pollType: 'MULTIPLE_CHOICE', 
        selectedOption: optionText 
      });
    } catch (error) {
      console.error('Vote error:', error);
      setSelectedOptions([]);
      setHasVoted(false);
    }
  };

  const getOptionResults = (optionText) => {
    if (!initialResults || !initialResults.multiple_choice_breakdown) {
      return 0;
    }
    return initialResults.multiple_choice_breakdown[optionText] || 0;
  };

  const getTotalVotes = () => {
    if (!initialResults || !initialResults.multiple_choice_breakdown) {
      return 0;
    }
    return Object.values(initialResults.multiple_choice_breakdown).reduce((sum, count) => sum + count, 0);
  };

  const totalVotes = getTotalVotes();

  const getOptionPercentage = (optionText) => {
    const votes = getOptionResults(optionText);
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        Select one option:
      </Text>
      
      <ScrollView 
        style={styles.optionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {options.map((option, index) => {
          const isSelected = selectedOptions.includes(option);
          const percentage = getOptionPercentage(option);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.selectedOption,
                disabled && styles.disabledOption
              ]}
              onPress={() => handleOptionSelect(index, option)}
              disabled={disabled || hasVoted}
              activeOpacity={0.8}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionMain}>
                  <View style={[
                    styles.optionBullet,
                    isSelected && styles.selectedBullet
                  ]}>
                    {isSelected && (
                      <View style={styles.selectedBulletInner} />
                    )}
                  </View>
                  
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                </View>
                
                {totalVotes > 0 && (
                  <View style={styles.optionStats}>
                    <Text style={[
                      styles.voteCount,
                      isSelected && styles.selectedVoteCount
                    ]}>
                      {getOptionResults(option)}
                    </Text>
                    <Text style={[
                      styles.percentage,
                      isSelected && styles.selectedPercentage
                    ]}>
                      {percentage}%
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Progress Bar */}
              {totalVotes > 0 && (
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${percentage}%`,
                        backgroundColor: isSelected 
                          ? theme.colors.primary 
                          : theme.colors.neutral[300]
                      }
                    ]} 
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {hasVoted && (
        <View style={styles.voteStatusContainer}>
          <Text style={styles.voteStatus}>
            Your vote recorded for: <Text style={styles.voteStatusBold}>
              {selectedOptions.join(', ')}
            </Text>
          </Text>
        </View>
      )}
      
      {totalVotes > 0 && (
        <Text style={styles.totalVotesText}>
          Total votes: {totalVotes}
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
    marginBottom: theme.spacing.md,
    textAlign: 'center'
  },
  optionsContainer: {
    maxHeight: 300
  },
  optionButton: {
    backgroundColor: theme.colors.neutral[0],
    borderWidth: 2,
    borderColor: theme.colors.neutral[200],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08' // Primary with low opacity
  },
  disabledOption: {
    opacity: 0.6
  },
  optionContent: {
    marginBottom: theme.spacing.sm
  },
  optionMain: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  optionBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.neutral[400],
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedBullet: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20'
  },
  selectedBulletInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary
  },
  optionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[800],
    fontWeight: '500'
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: '600'
  },
  optionStats: {
    alignItems: 'flex-end'
  },
  voteCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  selectedVoteCount: {
    color: theme.colors.primary,
    fontWeight: 'bold'
  },
  percentage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600]
  },
  selectedPercentage: {
    color: theme.colors.primary,
    fontWeight: 'bold'
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 2
  },
  voteStatusContainer: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    alignItems: 'center'
  },
  voteStatus: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    textAlign: 'center'
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