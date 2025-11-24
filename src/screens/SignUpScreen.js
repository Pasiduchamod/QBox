import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { Screen, Button, Input } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';
import { authAPI } from '../services/api';

const logo = require('../../assets/Logo/QBox logo png.png');

export const SignUpScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Email verification, 2: Complete signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
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
      const response = await authAPI.sendVerificationCode(email.trim());
      
      if (response.success) {
        Alert.alert('Code Sent', `Verification code sent to ${email}. Please check your email.`);
        setStep(2);
      } else {
        Alert.alert('Error', response.message || 'Failed to send verification code');
      }
    } catch (error) {
      let errorMessage = 'Unable to send verification code';
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

  const handleVerifyAndSignUp = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (!name || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Verify code first
      const verifyResponse = await authAPI.verifyCode(email.trim(), verificationCode);
      
      if (!verifyResponse.success) {
        Alert.alert('Error', 'Invalid verification code');
        setLoading(false);
        return;
      }

      // If verified, proceed with signup
      const response = await authAPI.signup(name.trim(), email.trim(), password);
      
      if (response.success) {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigation.replace('MyRooms') }
        ]);
      } else {
        Alert.alert('Signup Failed', response.message || 'Unable to create account');
      }
    } catch (error) {
      let errorMessage = 'Unable to connect to server';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 'Signup failed';
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else {
        errorMessage = error.message || 'An error occurred';
      }
      
      Alert.alert('Signup Error', errorMessage);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              {step === 1 ? 'Enter your email to get started' : 'Complete your account setup'}
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
              /* Step 1: Email Verification */
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
                  title={loading ? "Sending Code..." : "Send Verification Code"}
                  onPress={handleSendCode}
                  loading={loading}
                  style={styles.button}
                />
              </>
            ) : (
              /* Step 2: Complete Registration */
              <>
                <View style={styles.emailDisplay}>
                  <Text style={styles.emailLabel}>Email:</Text>
                  <Text style={styles.emailValue}>{email}</Text>
                  <TouchableOpacity onPress={() => setStep(1)}>
                    <Text style={styles.changeEmail}>Change</Text>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />

                <Input
                  label="Password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  hint="Use a strong password with letters and numbers"
                />

                <Input
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                
                <Button
                  title={loading ? "Creating Account..." : "Create Account"}
                  onPress={handleVerifyAndSignUp}
                  loading={loading}
                  style={styles.button}
                />

                <TouchableOpacity 
                  onPress={handleSendCode}
                  style={styles.resendButton}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>Didn't receive code? Resend</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Login Prompt */}
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
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
  },
  subtitle: {
    fontSize: typography.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.md,
  },
  
  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  
  // Form
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
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
  
  // Buttons
  button: {
    marginTop: spacing.md,
  },
  buttonContainer: {
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: typography.md,
    color: colors.primary,
    fontWeight: typography.semibold,
  },
});

export default SignUpScreen;
