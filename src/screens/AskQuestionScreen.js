import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { Screen, Button, Input } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';

export const AskQuestionScreen = ({ navigation, route }) => {
  const { roomCode } = route.params || {};
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const MAX_QUESTION_LENGTH = 500;

  const handleSubmit = async () => {
    if (question.trim().length < 10) {
      Alert.alert('Too short', 'Please write a more detailed question (at least 10 characters)');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Question Submitted! 🎉',
        'Your anonymous question has been submitted successfully',
        [
          {
            text: 'Ask Another',
            onPress: () => setQuestion(''),
          },
          {
            text: 'Back to Feed',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Screen style={styles.screen}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Ask a Question</Text>
            <Text style={styles.description}>
              Your question will be posted anonymously. Be respectful and clear.
            </Text>
          </View>

          {/* Anonymous Badge */}
          <View style={styles.anonymousBadge}>
            <Text style={styles.anonymousIcon}>🎭</Text>
            <View style={styles.anonymousTextContainer}>
              <Text style={styles.anonymousTitle}>You're Anonymous</Text>
              <Text style={styles.anonymousDescription}>
                Your identity will not be revealed to anyone
              </Text>
            </View>
          </View>

          {/* Question Input */}
          <View style={styles.inputSection}>
            <Input
              placeholder="Type your question here..."
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={8}
              maxLength={MAX_QUESTION_LENGTH}
              autoCapitalize="sentences"
              autoCorrect={true}
              hint="Be specific and clear to get better answers"
              style={styles.input}
            />
          </View>

          {/* Tips Card */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Tips for great questions:</Text>
            <Text style={styles.tipItem}>• Be clear and specific</Text>
            <Text style={styles.tipItem}>• Include context if needed</Text>
            <Text style={styles.tipItem}>• Ask one question at a time</Text>
            <Text style={styles.tipItem}>• Be respectful and constructive</Text>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Submit Anonymously"
              onPress={handleSubmit}
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
              disabled={question.trim().length < 10}
              icon={<Text style={styles.buttonIcon}>📤</Text>}
            />
            
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="ghost"
              size="medium"
              fullWidth
              style={styles.cancelButton}
            />
          </View>
        </Screen>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flex: 1,
  },
  
  // Header
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.md,
  },
  
  // Anonymous badge
  anonymousBadge: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight + '20',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  anonymousIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  anonymousTextContainer: {
    flex: 1,
  },
  anonymousTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  anonymousDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.sm,
  },
  
  // Input section
  inputSection: {
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: 0,
  },
  
  // Tips card
  tipsCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  tipsTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tipItem: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.sm,
    marginBottom: spacing.xs,
  },
  
  // Buttons
  buttonContainer: {
    marginTop: 'auto',
  },
  buttonIcon: {
    fontSize: typography.md,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
});

export default AskQuestionScreen;
