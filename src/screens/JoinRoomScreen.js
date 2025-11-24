import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Screen, Button, RoomCodeInput } from '../components';
import { colors, spacing, typography } from '../theme';
import { roomAPI } from '../services/api';

export const JoinRoomScreen = ({ navigation }) => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinRoom = async () => {
    if (roomCode.length !== 6) {
      setError('Please enter a valid 6-character room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await roomAPI.joinRoom(roomCode.trim().toUpperCase());

      if (response.success) {
        const roomData = response.data;
        // Navigate to room feed with real data
        navigation.navigate('RoomFeed', {
          roomId: roomData.roomId,
          roomCode: roomData.roomCode,
          questionsVisible: roomData.questionsVisible,
          roomName: roomData.roomName,
          lecturerName: roomData.lecturerName,
          status: roomData.status
        });
      } else {
        setError(response.message || 'Failed to join room');
      }
    } catch (error) {
      let errorMessage = 'Unable to join room';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 'Invalid room code or room is closed';
      } else if (error.request) {
        errorMessage = 'Cannot reach server. Check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Screen style={styles.screen}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Join Room</Text>
            <Text style={styles.description}>
              Enter the 6-character room code shared by your instructor
            </Text>
          </View>

          {/* Room Code Input */}
          <View style={styles.inputSection}>
            <RoomCodeInput
              value={roomCode}
              onChangeText={(text) => {
                setRoomCode(text);
                setError('');
              }}
            />
            
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Text style={styles.hint}>
              Room codes are case-insensitive and contain letters and numbers
            </Text>
          </View>
        </View>

        {/* Join Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Join Room"
            onPress={handleJoinRoom}
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            disabled={roomCode.length === 0}
          />
          
          <Button
            title="Back"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="medium"
            fullWidth
            style={styles.backButton}
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
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
  },
  description: {
    fontSize: typography.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.md,
  },
  
  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: spacing.xxl,
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  
  // Input section
  inputSection: {
    marginBottom: spacing.xl,
  },
  errorText: {
    fontSize: typography.sm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  hint: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: typography.lineHeight.relaxed * typography.sm,
  },
  
  // Buttons
  buttonContainer: {
    width: '100%',
  },
  backButton: {
    marginTop: spacing.sm,
  },
});

export default JoinRoomScreen;
