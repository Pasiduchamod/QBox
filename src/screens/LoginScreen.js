import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Screen, Button, Input } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';
import { authAPI, roomsAPI } from '../services/api';

const logo = require('../../assets/Logo/QBox logo png.png');
const googleLogo = require('../../assets/Logo/google-logo.png');

export const LoginScreen = ({ navigation }) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [oneTimeLoading, setOneTimeLoading] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [questionsVisible, setQuestionsVisible] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '531788294144-1ilnampcqrrjianujc9u9q27ts8uqhg3.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError('');

      // Sign out first to force account selection
      await GoogleSignin.signOut();

      // Check if Google Play Services is available
      await GoogleSignin.hasPlayServices();

      // Get user info
      const userInfo = await GoogleSignin.signIn();

      // Get ID token
      const tokens = await GoogleSignin.getTokens();
      
      // Send to backend
      const response = await authAPI.googleAuth(tokens.idToken);
      
      if (response.success) {
        // Clear one-time user flag for Google users
        await AsyncStorage.removeItem('isOneTimeUser');
        navigation.replace('MyRooms');
      } else {
        setError(response.message || 'Google Sign-In failed');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        // User cancelled the sign-in
      } else if (error.code === 'IN_PROGRESS') {
        setError('Sign-in already in progress');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        setError('Google Play Services not available');
      } else {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCreateOneTimeRoom = async () => {
    if (!userName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to create a room');
      return;
    }

    try {
      setOneTimeLoading(true);
      setError('');

      // Create one-time room
      const response = await roomsAPI.createOneTimeRoom(userName.trim(), questionsVisible);

      if (response.success) {
        setShowNameModal(false);
        setUserName('');
        // Store one-time room flag
        await AsyncStorage.setItem('isOneTimeUser', 'true');
        
        // Navigate to Lecturer Panel for one-time rooms
        navigation.replace('LecturerPanel', { 
          roomId: response.data.room._id,
          roomCode: response.data.room.code,
          roomName: response.data.room.roomName,
          roomStatus: 'active',
          questionsVisible: response.data.room.questionsVisible,
          isOneTime: true
        });
      } else {
        setError(response.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('One-Time Room Error:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setOneTimeLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Image 
              source={logo} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome to QBox</Text>
            <Text style={styles.subtitle}>Choose how you want to continue</Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Google Sign-In Button */}
          <View style={styles.buttonSection}>
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              <Image 
                source={googleLogo}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>
                {googleLoading ? 'Signing in...' : 'Sign in with Google'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* One-Time Room Button */}
            <TouchableOpacity 
              style={styles.oneTimeButton}
              onPress={() => setShowNameModal(true)}
              disabled={oneTimeLoading}
            >
              <Text style={styles.oneTimeButtonText}>Create One-Time Room</Text>
              <Text style={styles.oneTimeButtonSubtext}>No account needed • Expires in 1 hour</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Back Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="medium"
            fullWidth
          />
        </View>

        {/* Name Input Modal */}
        <Modal
          visible={showNameModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNameModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Your Name</Text>
              <Text style={styles.modalSubtitle}>This will be displayed in your room</Text>
              
              <TextInput
                style={styles.nameInput}
                placeholder="Your name"
                value={userName}
                onChangeText={setUserName}
                autoFocus
                maxLength={50}
              />

              {/* Room Type Selection */}
              <View style={styles.roomTypeContainer}>
                <Text style={styles.roomTypeLabel}>Room Type:</Text>
                <View style={styles.roomTypeButtons}>
                  <TouchableOpacity 
                    style={[styles.roomTypeButton, questionsVisible && styles.roomTypeButtonActive]}
                    onPress={() => setQuestionsVisible(true)}
                  >
                    <Text style={[styles.roomTypeButtonText, questionsVisible && styles.roomTypeButtonTextActive]}>👁️ Public</Text>
                    <Text style={[styles.roomTypeButtonDesc, questionsVisible && styles.roomTypeButtonDescActive]}>Everyone sees all questions</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.roomTypeButton, !questionsVisible && styles.roomTypeButtonActive]}
                    onPress={() => setQuestionsVisible(false)}
                  >
                    <Text style={[styles.roomTypeButtonText, !questionsVisible && styles.roomTypeButtonTextActive]}>🔒 Private</Text>
                    <Text style={[styles.roomTypeButtonDesc, !questionsVisible && styles.roomTypeButtonDescActive]}>Students see only their own</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalButtons}>>
                <TouchableOpacity 
                  style={styles.modalButtonCancel}
                  onPress={() => {
                    setShowNameModal(false);
                    setUserName('');
                    setQuestionsVisible(true);
                  }}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButtonCreate, oneTimeLoading && styles.modalButtonDisabled]}
                  onPress={handleCreateOneTimeRoom}
                  disabled={oneTimeLoading}
                >
                  <Text style={styles.modalButtonCreateText}>
                    {oneTimeLoading ? 'Creating...' : 'Create Room'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
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
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.md,
  },

  // Button Section
  buttonSection: {
    paddingHorizontal: spacing.lg,
  },
  
  // Buttons
  buttonContainer: {
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  errorContainer: {
    backgroundColor: colors.error + '15',
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.sm,
    color: colors.error,
    fontWeight: typography.medium,
  },

  // Google Sign-In Button
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: spacing.sm,
  },
  googleButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },

  // One-Time Room Button
  oneTimeButton: {
    backgroundColor: colors.primary + '15',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  oneTimeButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  oneTimeButtonSubtext: {
    fontSize: typography.sm,
    color: colors.primary,
    opacity: 0.8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  roomTypeContainer: {
    marginBottom: spacing.lg,
  },
  roomTypeLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  roomTypeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roomTypeButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  roomTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  roomTypeButtonText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  roomTypeButtonTextActive: {
    color: colors.primary,
  },
  roomTypeButtonDesc: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roomTypeButtonDescActive: {
    color: colors.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  modalButtonCreate: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalButtonCreateText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
});

export default LoginScreen;
