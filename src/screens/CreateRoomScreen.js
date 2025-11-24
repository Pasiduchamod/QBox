import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Screen, Button, Input, Card } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';

export const CreateRoomScreen = ({ navigation }) => {
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(true);

  // Generate room code
  useEffect(() => {
    generateRoomCode();
  }, []);

  const generateRoomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setRoomCode(code);
  };

  const handleCreateRoom = async () => {
    if (roomName.trim().length === 0) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to lecturer panel
      navigation.navigate('LecturerPanel', { 
        roomCode, 
        roomName,
        questionsVisible 
      });
    }, 1000);
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(roomCode);
    setCopied(true);
    Alert.alert('✅ Copied!', `Room code ${roomCode} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Generated Room Code */}
        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>Your Room Code</Text>
          
          <Card style={styles.codeCard}>
            <TouchableOpacity 
              onPress={handleCopyCode}
              activeOpacity={0.7}
              style={styles.codeContainer}
            >
              <Text style={styles.roomCode}>{roomCode}</Text>
              <View style={styles.copyBadge}>
                <Text style={styles.copyText}>
                  {copied ? '✓ Copied' : '📋 Tap to copy'}
                </Text>
              </View>
            </TouchableOpacity>
          </Card>

          <TouchableOpacity 
            onPress={generateRoomCode}
            style={styles.regenerateButton}
          >
            <Text style={styles.regenerateText}>🔄 Generate new code</Text>
          </TouchableOpacity>
        </View>

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
  
  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  illustrationEmoji: {
    fontSize: 64,
  },
  
  // Room code section
  codeSection: {
    marginTop: spacing.lg,
  },
  codeLabel: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  codeCard: {
    backgroundColor: colors.primaryLight + '15',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  codeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  roomCode: {
    fontSize: 40,
    fontWeight: typography.bold,
    color: colors.primary,
    letterSpacing: 8,
    marginBottom: spacing.sm,
  },
  copyBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  copyText: {
    fontSize: typography.sm,
    color: colors.white,
    fontWeight: typography.medium,
  },
  regenerateButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  regenerateText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
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
