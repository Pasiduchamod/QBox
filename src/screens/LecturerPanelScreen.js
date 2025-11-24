import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Card } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { questionAPI, roomAPI, getSocket, initSocket } from '../services/api';

export const LecturerPanelScreen = ({ navigation, route }) => {
  const { roomCode, roomName, roomStatus, roomId, questionsVisible: initialQuestionsVisible } = route.params || {};
  const [questions, setQuestions] = useState([]);
  const [deletedQuestions, setDeletedQuestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [isRoomClosed, setIsRoomClosed] = useState(roomStatus === 'closed');
  const [questionsVisible, setQuestionsVisible] = useState(initialQuestionsVisible);
  const [lecturerName, setLecturerName] = useState('');

  // Get lecturer name from storage
  useEffect(() => {
    const getLecturerName = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setLecturerName(user.name || '');
        }
      } catch (error) {
        console.error('Error getting lecturer name:', error);
      }
    };
    getLecturerName();
  }, []);

  // Fetch questions from API
  const fetchQuestions = useCallback(async () => {
    try {
      const response = await questionAPI.getQuestions(roomId, null, true);

      if (response.success) {
        // Transform API data to match component structure
        const transformedQuestions = response.data.map(q => ({
          id: q._id,
          _id: q._id,
          question: q.questionText,
          upvotes: q.upvotes,
          status: q.status,
          studentTag: q.studentTag,
          isReported: q.isReported,
          answer: q.answer,
          timestamp: new Date(q.createdAt).toLocaleString()
        }));
        setQuestions(transformedQuestions);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Setup socket listeners for real-time updates
  useEffect(() => {
    const socket = getSocket() || initSocket();
    if (!socket || !roomCode) return;

    socket.emit('join-room', roomCode);

    const handleNewQuestion = (question) => {
      setQuestions(prev => {
        const exists = prev.some(q => q._id === question._id || q.id === question._id);
        if (exists) return prev;
        
        const newQuestion = {
          id: question._id,
          _id: question._id,
          question: question.questionText,
          upvotes: question.upvotes || 0,
          status: question.status || 'pending',
          studentTag: question.studentTag,
          isReported: question.isReported || false,
          answer: question.answer || null,
          timestamp: new Date(question.createdAt).toLocaleString()
        };
        return [newQuestion, ...prev];
      });
    };

    const handleUpvoteUpdate = ({ questionId, upvotes }) => {
      setQuestions(prev =>
        prev.map(q => (q._id === questionId || q.id === questionId) ? { ...q, upvotes } : q)
      );
    };

    const handleQuestionAnswered = ({ questionId }) => {
      setQuestions(prev =>
        prev.map(q => (q._id === questionId || q.id === questionId) ? { ...q, status: 'answered' } : q)
      );
    };

    const handleQuestionRemoved = ({ questionId }) => {
      setQuestions(prev =>
        prev.map(q => (q._id === questionId || q.id === questionId) ? { ...q, status: 'rejected' } : q)
      );
    };

    const handleQuestionRestored = ({ questionId }) => {
      setQuestions(prev =>
        prev.map(q => (q._id === questionId || q.id === questionId) ? { ...q, status: 'pending' } : q)
      );
    };

    const handleQuestionPermanentlyDeleted = ({ questionId }) => {
      setQuestions(prev => prev.filter(q => q._id !== questionId && q.id !== questionId));
    };

    socket.on('new-question', handleNewQuestion);
    socket.on('question-upvote-update', handleUpvoteUpdate);
    socket.on('question-marked-answered', handleQuestionAnswered);
    socket.on('question-removed', handleQuestionRemoved);
    socket.on('question-restored', handleQuestionRestored);
    socket.on('question-permanently-deleted', handleQuestionPermanentlyDeleted);

    return () => {
      socket.off('new-question', handleNewQuestion);
      socket.off('question-upvote-update', handleUpvoteUpdate);
      socket.off('question-marked-answered', handleQuestionAnswered);
      socket.off('question-removed', handleQuestionRemoved);
      socket.off('question-restored', handleQuestionRestored);
      socket.off('question-permanently-deleted', handleQuestionPermanentlyDeleted);
    };
  }, [roomCode]);

  // Fetch questions when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (roomId) {
        setLoading(true);
        fetchQuestions();
      }
    }, [roomId, fetchQuestions])
  );

  const handleAnswer = async (questionId) => {
    Alert.alert(
      'Mark as Answered',
      'This question will be marked as answered',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Answered',
          onPress: async () => {
            try {
              const response = await questionAPI.answerQuestion(questionId, roomCode);

              if (response.success) {
                // Refresh questions list
                await fetchQuestions();
                Alert.alert('✅ Success', 'Question has been marked as answered');
              } else {
                Alert.alert('Error', response.message || 'Failed to mark question as answered');
              }
            } catch (error) {
              Alert.alert('Error', 'Unable to mark question as answered. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (questionId) => {
    Alert.alert(
      'Delete Question',
      'This question will be moved to the Deleted section',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await questionAPI.deleteQuestion(questionId);

              if (response.success) {
                // Update status to rejected instead of removing
                setQuestions(prev => 
                  prev.map(q => q._id === questionId ? { ...q, status: 'rejected' } : q)
                );
                Alert.alert('🗑️ Deleted', 'Question has been moved to Deleted section');
              } else {
                Alert.alert('Error', response.message || 'Failed to delete question');
              }
            } catch (error) {
              Alert.alert('Error', 'Unable to delete question. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRestore = async (questionId) => {
    Alert.alert(
      'Restore Question',
      'This question will be restored to Pending',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              const response = await questionAPI.restoreQuestion(questionId);

              if (response.success) {
                setQuestions(prev => 
                  prev.map(q => q._id === questionId ? { ...q, status: 'pending' } : q)
                );
                Alert.alert('♻️ Restored', 'Question has been restored to Pending');
              } else {
                Alert.alert('Error', response.message || 'Failed to restore question');
              }
            } catch (error) {
              Alert.alert('Error', 'Unable to restore question. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = async (questionId) => {
    Alert.alert(
      '⚠️ Permanent Delete',
      'This question will be permanently deleted and cannot be recovered. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await questionAPI.permanentDeleteQuestion(questionId);

              if (response.success) {
                setQuestions(prev => prev.filter(q => q._id !== questionId));
                Alert.alert('🗑️ Deleted', 'Question has been permanently deleted');
              } else {
                Alert.alert('Error', response.message || 'Failed to delete question');
              }
            } catch (error) {
              Alert.alert('Error', 'Unable to delete question. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleMarkAnswered = async (questionId, answerText) => {
    Alert.alert(
      'Mark as Answered',
      'This question will be marked as answered',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Answered',
          onPress: async () => {
            try {
              const response = await questionAPI.answerQuestion(questionId, answerText || 'Answered');

              if (response.success) {
                // Refresh questions list
                await fetchQuestions();
                Alert.alert('✔️ Answered', 'Question marked as answered');
              } else {
                Alert.alert('Error', response.message || 'Failed to answer question');
              }
            } catch (error) {
              Alert.alert('Error', 'Unable to answer question. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQuestions();
    setRefreshing(false);
  };

  const handleShare = async () => {
    try {
      const invitedBy = lecturerName ? `${lecturerName}` : '';
      const message = `Q&A Session Invitation\n\nYou have been invited by ${invitedBy} to join a live Q&A session.\n\nRoom: ${roomName || 'My Classroom'}\nAccess Code: ${roomCode || 'ABC123'}\n\nPlease open the QBox application and enter the access code to participate.\nAll questions will remain fully anonymous, ensuring a comfortable and open environment for discussion.`;
      
      await Share.share({
        message: message,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share room code');
    }
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(roomCode || 'ABC123');
      Alert.alert('✅ Copied!', `Room code ${roomCode} copied to clipboard`);
    } catch (error) {
      Alert.alert('Error', 'Could not copy room code');
    }
  };

  const handleCloseRoom = async () => {
    Alert.alert(
      '⚠️ Close Room',
      'Are you sure you want to close this room?\n\n• Students will no longer be able to ask questions\n• The room cannot be reopened\n• All data will be preserved for viewing only\n\nThis action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Room',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await roomAPI.closeRoom(roomId);

              if (response.success) {
                setIsRoomClosed(true);
                Alert.alert('🔒 Room Closed', 'This room is now closed. Students can no longer submit questions.');
              } else {
                Alert.alert('Error', response.message || 'Failed to close room');
              }
            } catch (error) {
              Alert.alert('Error', 'Unable to close room. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleToggleVisibility = async () => {
    try {
      const response = await roomAPI.toggleVisibility(roomId);

      if (response.success) {
        setQuestionsVisible(response.data.questionsVisible);
        Alert.alert(
          'Visibility Updated',
          response.data.questionsVisible
            ? 'Questions are now visible to all students'
            : 'Questions are now private (students can only see their own questions)'
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update visibility');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to update visibility. Please try again.');
    }
  };

  const renderQuestionCard = ({ item }) => (
    <Card style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.upvoteContainer}>
          <Text style={styles.upvoteIcon}>👍</Text>
          <Text style={styles.upvoteCount}>{item.upvotes}</Text>
        </View>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>

      <View style={styles.questionTagContainer}>
        <Text style={styles.questionTag}>Anonymous {item.studentTag}</Text>
      </View>

      <Text style={styles.questionText}>{item.question}</Text>

      {item.answer && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Answer:</Text>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      )}

      {item.isReported && (
        <View style={styles.reportedBadge}>
          <Text style={styles.reportedText}>⚠️ Reported</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        {item.status === 'rejected' ? (
          // Buttons for deleted questions
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.restoreButton]}
              onPress={() => handleRestore(item._id)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>♻️ Restore</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.permanentDeleteButton]}
              onPress={() => handlePermanentDelete(item._id)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>🗑️ Delete Permanently</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Buttons for active questions
          <>
            {item.status === 'pending' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.answerButton]}
                onPress={() => handleAnswer(item._id)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>✅ Mark Answered</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item._id)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.roomInfoCard}>
        <View style={styles.roomNameContainer}>
          <Text style={styles.roomName}>{roomName || 'My Classroom'}</Text>
          {isRoomClosed && (
            <View style={styles.closedBadge}>
              <Text style={styles.closedBadgeText}>🔒 Closed</Text>
            </View>
          )}
        </View>
        <View style={styles.codeContainer}>
          <View style={styles.codeContent}>
            <Text style={styles.codeLabel}>Room Code:</Text>
            <Text style={styles.roomCode}>{roomCode || 'ABC123'}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonIcon}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonIcon}>↗️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Visibility Toggle */}
        <View style={styles.visibilityContainer}>
          <Text style={styles.visibilityLabel}>Question Visibility:</Text>
          <TouchableOpacity
            style={[styles.visibilityToggle, questionsVisible ? styles.visibilityPublic : styles.visibilityPrivate]}
            onPress={handleToggleVisibility}
            disabled={isRoomClosed}
            activeOpacity={0.7}
          >
            <Text style={styles.visibilityText}>
              {questionsVisible ? '🌐 Public' : '🔒 Private'}
            </Text>
          </TouchableOpacity>
        </View>

        {!isRoomClosed && (
          <TouchableOpacity
            style={styles.closeRoomButton}
            onPress={handleCloseRoom}
            activeOpacity={0.7}
          >
            <Text style={styles.closeRoomButtonText}>🔒 Close Room</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{questions.filter(q => q.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{questions.filter(q => q.status === 'answered').length}</Text>
          <Text style={styles.statLabel}>Answered</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{questions.filter(q => q.status === 'rejected').length}</Text>
          <Text style={styles.statLabel}>Deleted</Text>
        </View>
      </View>

      <View style={styles.filterTabsContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All ({questions.filter(q => q.status !== 'rejected').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
            onPress={() => setFilter('pending')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>
              Pending ({questions.filter(q => q.status === 'pending').length})
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'answered' && styles.filterTabActive]}
            onPress={() => setFilter('answered')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, filter === 'answered' && styles.filterTabTextActive]}>
              Answered ({questions.filter(q => q.status === 'answered').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'rejected' && styles.filterTabActive]}
            onPress={() => setFilter('rejected')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, filter === 'rejected' && styles.filterTabTextActive]}>
              Deleted ({questions.filter(q => q.status === 'rejected').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>✨</Text>
      <Text style={styles.emptyTitle}>All caught up!</Text>
      <Text style={styles.emptyDescription}>
        No questions to review at the moment
      </Text>
    </View>
  );

  // Filter questions based on active filter
  const getFilteredQuestions = () => {
    if (filter === 'all') return questions.filter(q => q.status !== 'rejected');
    return questions.filter(q => q.status === filter);
  };

  // Show loading state
  if (loading) {
    return (
      <Screen>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={getFilteredQuestions()}
        keyExtractor={item => item._id}
        renderItem={renderQuestionCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
  },
  
  // Header
  header: {
    marginBottom: spacing.lg,
  },
  roomInfoCard: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  roomNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  roomName: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.white,
    flex: 1,
  },
  closedBadge: {
    backgroundColor: colors.error,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    marginLeft: spacing.sm,
  },
  closedBadgeText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  codeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  codeLabel: {
    fontSize: typography.md,
    color: colors.white,
    opacity: 0.9,
    marginRight: spacing.sm,
  },
  roomCode: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.white,
    letterSpacing: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  copyButton: {
    backgroundColor: colors.white + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  shareButton: {
    backgroundColor: colors.white + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  buttonIcon: {
    fontSize: 20,
  },
  closeRoomButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  closeRoomButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  statNumber: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  
  // Filter tabs
  filterTabsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterTab: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.white,
  },
  
  // Question card
  questionCard: {
    marginBottom: spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  upvoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  upvoteIcon: {
    fontSize: typography.md,
    marginRight: spacing.xs,
  },
  upvoteCount: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  questionText: {
    fontSize: typography.md,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.md,
    marginBottom: spacing.md,
  },
  
  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  answerButton: {
    backgroundColor: colors.success + '20',
  },
  deleteButton: {
    backgroundColor: colors.error + '20',
  },
  restoreButton: {
    backgroundColor: colors.secondary + '20',
  },
  permanentDeleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Loading State
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.md,
    color: colors.textSecondary,
  },

  // Visibility Toggle
  visibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  visibilityLabel: {
    fontSize: typography.md,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  visibilityToggle: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  visibilityPublic: {
    backgroundColor: colors.success || '#10B981',
  },
  visibilityPrivate: {
    backgroundColor: colors.warning || '#F59E0B',
  },
  visibilityText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.white,
  },

  // Question Tag
  questionTagContainer: {
    marginBottom: spacing.sm,
  },
  questionTag: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // Answer Container
  answerContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.success + '20' || '#10B98120',
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.success || '#10B981',
  },
  answerLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.success || '#10B981',
    marginBottom: spacing.xs,
  },
  answerText: {
    fontSize: typography.md,
    color: colors.textPrimary,
  },

  // Reported Badge
  reportedBadge: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.error + '20' || '#EF444420',
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  reportedText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.error || '#EF4444',
  },

  // Approve Button
  approveButton: {
    backgroundColor: colors.success || '#10B981',
  },
});

export default LecturerPanelScreen;
