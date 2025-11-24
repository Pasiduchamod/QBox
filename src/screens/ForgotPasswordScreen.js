import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Screen, Button, Input } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
    }, 1500);
  };

  if (emailSent) {
    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Success Illustration */}
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>✉️</Text>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successMessage}>
                We've sent password reset instructions to
              </Text>
              <Text style={styles.emailText}>{email}</Text>
              <Text style={styles.successNote}>
                If you don't see the email, check your spam folder or try again.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              variant="primary"
              size="large"
              fullWidth
            />
            <Button
              title="Resend Email"
              onPress={() => {
                setEmailSent(false);
                handleResetPassword();
              }}
              variant="ghost"
              size="medium"
              fullWidth
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email and we'll send you reset instructions
            </Text>
          </View>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Text style={styles.illustrationEmoji}>🔐</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="your.email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            <Text style={styles.hint}>
              Enter the email associated with your lecturer account
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Send Reset Link"
            onPress={handleResetPassword}
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
          />

          <Button
            title="Back to Login"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="medium"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Header
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.md,
    paddingHorizontal: spacing.lg,
  },
  
  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  
  // Form
  form: {
    gap: spacing.md,
  },
  hint: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
  
  // Success State
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emailText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  successNote: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.sm,
  },
  
  // Button Container
  buttonContainer: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});

export default ForgotPasswordScreen;
