import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Screen, Button, Input, Card } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';
import { roomAPI } from '../services/api';

export const CreateRoomScreen = ({ navigation }) => {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(true);

  const handleCreateRoom = async () => {
    if (roomName.trim().length === 0) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    setLoading(true);

    try {
      const response = await roomAPI.createRoom(roomName.trim(), questionsVisible);

      if (response.success) {
        const createdRoom = response.data;
        navigation.navigate('LecturerPanel', {
          roomId: createdRoom._id,
          roomCode: createdRoom.roomCode,
          roomName: createdRoom.roomName,
          roomStatus: createdRoom.status,
          questionsVisible: createdRoom.questionsVisible
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to create room');
      }
    } catch (error) {
      let errorMessage = 'Unable to create room';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error';
      } else if (error.request) {
        errorMessage = 'Cannot reach server. Check your connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };



  return (
    <Screen style={styles.screen}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Room</Text>
          <Text style={styles.description}>
            Set up a new Q&A session for your students
          </Text>
        </View>

        {/* Room Name Input */}
        <Input
          label="Room Name"
          placeholder="e.g., Computer Science 101"
          value={roomName}
          onChangeText={setRoomName}
          maxLength={50}
          hint="This name will be visible to students who join"
        />

        {/* Question Visibility Toggle */}
        <View style={styles.visibilitySection}>
          <Text style={styles.visibilityLabel}>Question Visibility</Text>
          <Text style={styles.visibilityHint}>
            Control whether students can see each other's questions
          </Text>
          
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleOption, questionsVisible && styles.toggleOptionActive]}
              onPress={() => setQuestionsVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleIcon}>👁️</Text>
              <Text style={[styles.toggleText, questionsVisible && styles.toggleTextActive]}>
                Visible
              </Text>
              <Text style={styles.toggleDescription}>
                Students can see all questions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleOption, !questionsVisible && styles.toggleOptionActive]}
              onPress={() => setQuestionsVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleIcon}>🔒</Text>
              <Text style={[styles.toggleText, !questionsVisible && styles.toggleTextActive]}>
                Private
              </Text>
              <Text style={styles.toggleDescription}>
                Only you see all questions
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Create & Share Code"
          onPress={handleCreateRoom}
          variant="primary"
          size="large"
          fullWidth
          loading={loading}
          disabled={roomName.trim().length === 0}
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
  );
};

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  
  // Header
  header: {
    marginBottom: spacing.xl,
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
  
  // Visibility Section
  visibilitySection: {
    marginTop: spacing.lg,
  },
  visibilityLabel: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  visibilityHint: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.relaxed * typography.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleOption: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toggleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  toggleIcon: {
    fontSize: typography.xxl,
    marginBottom: spacing.xs,
  },
  toggleText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  toggleTextActive: {
    color: colors.primary,
  },
  toggleDescription: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Buttons
  buttonContainer: {
    width: '100%',
  },
  backButton: {
    marginTop: spacing.sm,
  },
});

export default CreateRoomScreen;
