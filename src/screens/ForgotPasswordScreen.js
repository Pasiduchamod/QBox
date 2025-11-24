import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Screen, Button, Input } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';
import { authAPI } from '../services/api';

const logo = require('../../assets/Logo/QBox logo png.png');

export const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(email.trim());
      
      if (response.success) {
        Alert.alert('Code Sent', `Password reset code sent to ${email}. Please check your email.`);
        setStep(2);
      } else {
        Alert.alert('Error', response.message || 'Failed to send reset code');
      }
    } catch (error) {
      let errorMessage = 'Unable to send reset code';
      if (error.response?.data) {
        errorMessage = error.response.data.message || 'Failed to send code';
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the reset code');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.resetPassword(email.trim(), code, newPassword);
      
      if (response.success) {
        Alert.alert('Success', 'Password reset successful!', [
          { text: 'OK', onPress: () => navigation.replace('MyRooms') }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to reset password');
      }
    } catch (error) {
      let errorMessage = 'Unable to reset password';
      if (error.response?.data) {
        errorMessage = error.response.data.message || 'Failed to reset password';
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image 
              source={logo} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              {step === 1 ? 'Forgot Password?' : 'Reset Password'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 
                ? 'Enter your email to receive a reset code' 
                : 'Enter the code and your new password'}
            </Text>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
              <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
            </View>
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
              <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === 1 ? (
              /* Step 1: Email */
              <>
                <Input
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
                
                <Button
                  title={loading ? "Sending Code..." : "Send Reset Code"}
                  onPress={handleSendCode}
                  loading={loading}
                  style={styles.button}
                />
              </>
            ) : (
              /* Step 2: Code & New Password */
              <>
                <View style={styles.emailDisplay}>
                  <Text style={styles.emailLabel}>Email:</Text>
                  <Text style={styles.emailValue}>{email}</Text>
                  <TouchableOpacity onPress={() => setStep(1)}>
                    <Text style={styles.changeEmail}>Change</Text>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Reset Code"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                <Input
                  label="New Password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />

                <Input
                  label="Confirm New Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />

                <Button
                  title={loading ? "Resetting..." : "Reset Password"}
                  onPress={handleResetPassword}
                  loading={loading}
                  style={styles.button}
                />

                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        {/* Back to Login */}
        <View style={styles.backContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  
  // Header
  header: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
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
    lineHeight: typography.lineHeight.relaxed * typography.md,
    textAlign: 'center',
  },
  
  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumber: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },

  // Email Display
  emailDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.secondary + '10',
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  emailLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  emailValue: {
    flex: 1,
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  changeEmail: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.semibold,
  },

  // Resend Button
  resendButton: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resendText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  
  // Form
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.md,
  },

  // Back Button
  backContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  backText: {
    fontSize: typography.md,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
});

export default ForgotPasswordScreen;
