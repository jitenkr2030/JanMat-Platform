/**
 * Create Screen
 * Create new polls and petitions with guided forms
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';

const CREATE_OPTIONS = [
  {
    key: 'poll',
    title: 'Create Poll',
    description: 'Gather public opinion on important issues',
    icon: 'how-to-vote',
    color: theme.colors.primary,
    action: () => Alert.alert('Poll Creation', 'Poll creation feature coming soon!')
  },
  {
    key: 'petition',
    title: 'Start Petition',
    description: 'Collect signatures for your cause',
    icon: 'description',
    color: theme.colors.secondary,
    action: () => Alert.alert('Petition Creation', 'Petition creation feature coming soon!')
  },
  {
    key: 'quick-poll',
    title: 'Quick Poll',
    description: 'Create a simple Yes/No poll',
    icon: 'thumb-up',
    color: theme.colors.accent,
    action: () => Alert.alert('Quick Poll', 'Quick poll feature coming soon!')
  },
  {
    key: 'community',
    title: 'Community Discussion',
    description: 'Start a discussion in your community',
    icon: 'group',
    color: theme.colors.success,
    action: () => Alert.alert('Community', 'Community discussion feature coming soon!')
  }
];

export default function CreateScreen({ navigation }) {
  const handleOptionPress = (option) => {
    option.action();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create</Text>
        <Text style={styles.headerSubtitle}>
          Share your voice and make a difference
        </Text>
      </View>

      {/* Create Options */}
      <View style={styles.optionsContainer}>
        {CREATE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={styles.optionCard}
            onPress={() => handleOptionPress(option)}
            activeOpacity={0.8}
          >
            <View style={[
              styles.optionIcon,
              { backgroundColor: option.color + '20' }
            ]}>
              <Icon 
                name={option.icon} 
                size={32} 
                color={option.color} 
              />
            </View>
            
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            
            <Icon 
              name="arrow-forward-ios" 
              size={16} 
              color={theme.colors.neutral[400]} 
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Guidelines */}
      <View style={styles.guidelinesContainer}>
        <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
        <Text style={styles.guidelinesText}>
          • Be respectful and constructive{'\n'}
          • Share factual information{'\n'}
          • Avoid spam and duplicate content{'\n'}
          • Follow local laws and regulations
        </Text>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentContainer}>
        <Text style={styles.recentTitle}>Your Recent Creations</Text>
        <Text style={styles.recentEmpty}>
          No creations yet. Start by creating your first poll or petition!
        </Text>
      </View>
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
  optionsContainer: {
    padding: theme.spacing.md
  },
  optionCard: {
    backgroundColor: theme.colors.neutral[0],
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md
  },
  optionContent: {
    flex: 1
  },
  optionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.xs
  },
  optionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    lineHeight: 16
  },
  guidelinesContainer: {
    backgroundColor: theme.colors.neutral[0],
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small
  },
  guidelinesTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.sm
  },
  guidelinesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    lineHeight: 20
  },
  recentContainer: {
    backgroundColor: theme.colors.neutral[0],
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small
  },
  recentTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.sm
  },
  recentEmpty: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[500],
    textAlign: 'center',
    fontStyle: 'italic'
  }
});