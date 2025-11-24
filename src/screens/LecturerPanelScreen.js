import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share
} from 'react-native';
import { Screen, Card } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

// Mock data for pending questions
const MOCK_PENDING_QUESTIONS = [
  {
    id: '1',
    question: 'What is the difference between PUT and PATCH HTTP methods?',
    upvotes: 5,
    timestamp: '2 min ago',
  },
  {
    id: '2',
    question: 'Can you explain dependency injection in more detail?',
    upvotes: 8,
    timestamp: '5 min ago',
  },
  {
    id: '3',
    question: 'How do I optimize database queries for better performance?',
    upvotes: 12,
    timestamp: '7 min ago',
  },
  {
    id: '4',
    question: 'What are the advantages of microservices architecture?',
    upvotes: 3,
    timestamp: '10 min ago',
  },
];

export const LecturerPanelScreen = ({ navigation, route }) => {
  const { roomCode, roomName, roomStatus } = route.params || {};
  const [questions, setQuestions] = useState(MOCK_PENDING_QUESTIONS);
  const [deletedQuestions, setDeletedQuestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [isRoomClosed, setIsRoomClosed] = useState(roomStatus === 'closed');

  const handleApprove = (questionId) => {
    Alert.alert(
      'Approve Question',
      'This question will be visible to all students',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            setQuestions(prev => prev.filter(q => q.id !== questionId));
            Alert.alert('✅ Approved', 'Question has been approved');
          },
        },
      ]
    );
  };

  const handleDelete = (questionId) => {
    Alert.alert(
      'Delete Question',
      'This question will be moved to deleted section',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const deletedQuestion = questions.find(q => q.id === questionId);
            if (deletedQuestion) {
              setDeletedQuestions(prev => [...prev, { ...deletedQuestion, deletedAt: new Date().toISOString() }]);
              setQuestions(prev => prev.filter(q => q.id !== questionId));
              Alert.alert('🗑️ Deleted', 'Question moved to deleted section');
            }
          },
        },
      ]
    );
  };

  const handleRestore = (questionId) => {
    Alert.alert(
      'Restore Question',
      'This question will be restored to pending',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: () => {
            const restoredQuestion = deletedQuestions.find(q => q.id === questionId);
            if (restoredQuestion) {
              const { deletedAt, ...questionData } = restoredQuestion;
              setQuestions(prev => [...prev, questionData]);
              setDeletedQuestions(prev => prev.filter(q => q.id !== questionId));
              Alert.alert('♻️ Restored', 'Question has been restored');
            }
          },
        },
      ]
    );
  };

  const handleDeletePermanent = (questionId) => {
    Alert.alert(
      'Delete Forever',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            setDeletedQuestions(prev => prev.filter(q => q.id !== questionId));
            Alert.alert('❌ Permanently Deleted', 'Question has been permanently deleted');
          },
        },
      ]
    );
  };

  const handleMarkAnswered = (questionId) => {
    Alert.alert(
      'Mark as Answered',
      'This question will be marked as answered',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Answered',
          onPress: () => {
            setQuestions(prev => prev.filter(q => q.id !== questionId));
            Alert.alert('✔️ Answered', 'Question marked as answered');
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleShare = async () => {
    try {
      const message = `🎓 Join my Q&A session!\n\n📚 Room: ${roomName || 'My Classroom'}\n🔑 Code: ${roomCode || 'ABC123'}\n\nOpen QBox app and enter this code to ask questions anonymously.`;
      
      await Share.share({
        message: message,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share room code');
    }
  };

  const handleCloseRoom = () => {
    Alert.alert(
      '⚠️ Close Room',
      'Are you sure you want to close this room?\n\n• Students will no longer be able to ask questions\n• The room cannot be reopened\n• All data will be preserved for viewing only\n\nThis action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Room',
          style: 'destructive',
          onPress: () => {
            setIsRoomClosed(true);
            Alert.alert('🔒 Room Closed', 'This room is now closed. Students can no longer submit questions.');
          },
        },
      ]
    );
  };

  const renderQuestionCard = ({ item }) => (
    <Card style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.upvoteContainer}>
          <Text style={styles.upvoteIcon}>👍</Text>
          <Text style={styles.upvoteCount}>{item.upvotes}</Text>
        </View>
        <Text style={styles.timestamp}>{item.deletedAt ? new Date(item.deletedAt).toLocaleString() : item.timestamp}</Text>
      </View>

      <Text style={styles.questionText}>{item.question}</Text>

      {filter === 'pending' ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.answeredButton]}
            onPress={() => handleMarkAnswered(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>✔️ Mark as Answered</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.restoreButton]}
            onPress={() => handleRestore(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>♻️ Restore</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.permanentDeleteButton]}
            onPress={() => handleDeletePermanent(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>❌ Delete Forever</Text>
          </TouchableOpacity>
        </View>
      )}
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
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Text style={styles.shareIcon}>📤</Text>
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
          <Text style={styles.statNumber}>{questions.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>18</Text>
          <Text style={styles.statLabel}>Answered</Text>
        </View>
      </View>

      <View style={styles.filterTabsContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
          onPress={() => setFilter('pending')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>
            Pending ({questions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'deleted' && styles.filterTabActive]}
          onPress={() => setFilter('deleted')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterTabText, filter === 'deleted' && styles.filterTabTextActive]}>
            🗑️ Deleted ({deletedQuestions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.reportsButton}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.reportsButtonText}>📋 Reports</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{filter === 'pending' ? '✨' : '🗑️'}</Text>
      <Text style={styles.emptyTitle}>{filter === 'pending' ? 'All caught up!' : 'No deleted questions'}</Text>
      <Text style={styles.emptyDescription}>
        {filter === 'pending' ? 'No pending questions to review at the moment' : 'Deleted questions will appear here'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filter === 'pending' ? questions : deletedQuestions}
        keyExtractor={item => item.id}
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
  shareButton: {
    backgroundColor: colors.white + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  shareIcon: {
    fontSize: typography.xl,
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
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  reportsButton: {
    backgroundColor: colors.warning + '20',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
  },
  reportsButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.warning,
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
  approveButton: {
    backgroundColor: colors.approved,
  },
  deleteButton: {
    backgroundColor: colors.error + '20',
  },
  answeredButton: {
    backgroundColor: colors.answered,
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
});

export default LecturerPanelScreen;
