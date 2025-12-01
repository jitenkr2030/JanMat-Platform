/**
 * Create Petition Screen
 * Create new petitions with form validation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';

const CATEGORIES = [
  'Politics',
  'Economy',
  'Social Issues',
  'Education',
  'Environment',
  'Healthcare',
  'Infrastructure',
  'Other'
];

const STATES = [
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

export default function CreatePetitionScreen({ navigation }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    targetAuthority: '',
    location: '',
    targetSignatures: '1000',
    milestones: [
      { target: 100, description: 'Initial Support' },
      { target: 500, description: 'Local Awareness' },
      { target: 1000, description: 'Regional Impact' },
      { target: 5000, description: 'State Attention' }
    ]
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.targetAuthority.trim()) {
      newErrors.targetAuthority = 'Target authority is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    const targetSignatures = parseInt(formData.targetSignatures);
    if (isNaN(targetSignatures) || targetSignatures < 100) {
      newErrors.targetSignatures = 'Target must be at least 100 signatures';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success!',
        'Your petition has been created and is pending review.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create petition. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.neutral[0]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Petition</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Petition Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              placeholder="Brief, clear title for your petition"
              multiline
              maxLength={100}
            />
            <Text style={styles.characterCount}>{formData.title.length}/100</Text>
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              placeholder="Explain your petition in detail. Why is this important? What change are you seeking?"
              multiline
              numberOfLines={6}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{formData.description.length}/1000</Text>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    formData.category === category && styles.selectedCategoryChip
                  ]}
                  onPress={() => updateFormData('category', category)}
                >
                  <Text style={[
                    styles.categoryText,
                    formData.category === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>
        </View>

        {/* Target & Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target & Location</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Target Authority *</Text>
            <TextInput
              style={[styles.input, errors.targetAuthority && styles.inputError]}
              value={formData.targetAuthority}
              onChangeText={(text) => updateFormData('targetAuthority', text)}
              placeholder="Who should this petition be addressed to? (e.g., Prime Minister, State CM, Local MP)"
            />
            {errors.targetAuthority && <Text style={styles.errorText}>{errors.targetAuthority}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateScroll}>
              {STATES.map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.stateChip,
                    formData.location === state && styles.selectedStateChip
                  ]}
                  onPress={() => updateFormData('location', state)}
                >
                  <Text style={[
                    styles.stateText,
                    formData.location === state && styles.selectedStateText
                  ]}>
                    {state}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>
        </View>

        {/* Goals & Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals & Milestones</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Target Signatures *</Text>
            <TextInput
              style={[styles.input, errors.targetSignatures && styles.inputError]}
              value={formData.targetSignatures}
              onChangeText={(text) => updateFormData('targetSignatures', text)}
              placeholder="1000"
              keyboardType="numeric"
            />
            {errors.targetSignatures && <Text style={styles.errorText}>{errors.targetSignatures}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Milestones</Text>
            <Text style={styles.helpText}>
              Define key milestones for your petition campaign:
            </Text>
            {formData.milestones.map((milestone, index) => (
              <View key={index} style={styles.milestoneItem}>
                <Text style={styles.milestoneNumber}>{index + 1}.</Text>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneTarget}>
                    {milestone.target.toLocaleString()} signatures
                  </Text>
                  <Text style={styles.milestoneDescription}>
                    {milestone.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesContainer}>
          <Text style={styles.guidelinesTitle}>Petition Guidelines</Text>
          <Text style={styles.guidelinesText}>
            • Ensure your petition is factual and well-researched{'\n'}
            • Be respectful in your language{'\n'}
            • Focus on achievable goals{'\n'}
            • Provide clear, actionable demands{'\n'}
            • Follow all applicable laws and regulations
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Creating Petition...' : 'Create Petition'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[0]
  },
  content: {
    flex: 1,
    padding: theme.spacing.md
  },
  section: {
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md
  },
  inputContainer: {
    marginBottom: theme.spacing.lg
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.sm
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[800],
    backgroundColor: theme.colors.neutral[0]
  },
  inputError: {
    borderColor: theme.colors.error
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200
  },
  characterCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[500],
    textAlign: 'right',
    marginTop: theme.spacing.xs
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs
  },
  categoryScroll: {
    marginHorizontal: -theme.spacing.md
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.full
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primary
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  selectedCategoryText: {
    color: theme.colors.neutral[0]
  },
  stateScroll: {
    marginHorizontal: -theme.spacing.md
  },
  stateChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.sm
  },
  selectedStateChip: {
    backgroundColor: theme.colors.secondary
  },
  stateText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[600],
    fontWeight: '500'
  },
  selectedStateText: {
    color: theme.colors.neutral[0]
  },
  helpText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.sm
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md
  },
  milestoneNumber: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    marginTop: theme.spacing.xs
  },
  milestoneContent: {
    flex: 1
  },
  milestoneTarget: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.xs
  },
  milestoneDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    lineHeight: 16
  },
  guidelinesContainer: {
    backgroundColor: theme.colors.neutral[0],
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
  submitContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200]
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center'
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.neutral[400]
  },
  submitButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral[0],
    fontWeight: 'bold'
  }
});