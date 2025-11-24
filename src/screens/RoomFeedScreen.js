import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { Screen, QuestionCard } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

// Mock data
const MOCK_QUESTIONS = [
  {
    id: '1',
    question: 'What is the difference between synchronous and asynchronous programming?',
    upvotes: 15,
    status: 'approved',
    isMyQuestion: false,
  },
  {
    id: '2',
    question: 'Can you explain how React hooks work under the hood?',
    upvotes: 23,
    status: 'answered',
    isMyQuestion: false,
  },
  {
    id: '3',
    question: 'Is there a recommended design pattern for state management in large applications?',
    upvotes: 8,
    status: 'pending',
    isMyQuestion: true,
  },
  {
    id: '4',
    question: 'How do I properly handle errors in async/await functions?',
    upvotes: 12,
    status: 'approved',
    isMyQuestion: false,
  },
  {
    id: '5',
    question: 'What are the best practices for API security?',
    upvotes: 19,
    status: 'answered',
    isMyQuestion: true,
  },
  {
    id: '6',
    question: 'What are the best practices for API security?',
    upvotes: 19,
    status: 'answered',
    isMyQuestion: true,
  },
];

export const RoomFeedScreen = ({ navigation, route }) => {
  const { roomCode, questionsVisible, roomName, lecturerName } = route.params || {};
  const [activeFilter, setActiveFilter] = useState('all');
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

  console.log('RoomFeedScreen - questionsVisible:', questionsVisible);

  // Filter questions based on visibility and ownership
  const getVisibleQuestions = () => {
    if (questionsVisible) {
      // If questions are visible to all, show approved and answered questions + user's own questions
      return questions.filter(q => q.status !== 'pending' || q.isMyQuestion);
    } else {
      // If questions are private, only show user's own questions
      return questions.filter(q => q.isMyQuestion);
    }
  };

  const visibleQuestions = getVisibleQuestions();

  const filters = [
    { id: 'all', label: 'All', count: visibleQuestions.length },
    { id: 'approved', label: 'Approved', count: visibleQuestions.filter(q => q.status === 'approved').length },
    { id: 'answered', label: 'Answered', count: visibleQuestions.filter(q => q.status === 'answered').length },
  ];

  const getFilteredQuestions = () => {
    if (activeFilter === 'all') return visibleQuestions;
    return visibleQuestions.filter(q => q.status === activeFilter);
  };

  const handleUpvote = (questionId) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
      )
    );
  };

  const handleReport = (questionId) => {
    setSelectedQuestionId(questionId);
    setReportModalVisible(true);
  };

  const submitReport = (reason) => {
    setReportModalVisible(false);
    Alert.alert('✅ Reported', `Question has been reported as ${reason.toLowerCase()}`);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAskQuestion = () => {
    navigation.navigate('AskQuestion', { roomCode, questionsVisible });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{roomName || 'Q&A Room'}</Text>
        <View style={styles.roomDetails}>
          <Text style={styles.lecturerLabel}>👨‍🏫 {lecturerName || 'Lecturer'}</Text>
          <View style={styles.roomCodeBadge}>
            <Text style={styles.roomCodeLabel}>Code:</Text>
            <Text style={styles.roomCode}>{roomCode || 'ABC123'}</Text>
          </View>
        </View>
      </View>
      
      {/* Private Room Info Banner */}
      {!questionsVisible && (
        <View style={styles.privateRoomBanner}>
          <Text style={styles.privateRoomIcon}>🔒</Text>
          <View style={styles.privateRoomTextContainer}>
            <Text style={styles.privateRoomTitle}>Private Room</Text>
            <Text style={styles.privateRoomDescription}>
              You can only see your own questions in this room
            </Text>
          </View>
        </View>
      )}
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterTab,
              activeFilter === filter.id && styles.filterTabActive
            ]}
            onPress={() => setActiveFilter(filter.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter.id && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterBadge,
              activeFilter === filter.id && styles.filterBadgeActive
            ]}>
              <Text style={[
                styles.filterBadgeText,
                activeFilter === filter.id && styles.filterBadgeTextActive
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{questionsVisible ? '🤔' : '🔒'}</Text>
      <Text style={styles.emptyTitle}>
        {questionsVisible ? 'No questions yet' : 'Private Room'}
      </Text>
      <Text style={styles.emptyDescription}>
        {questionsVisible 
          ? 'Be the first to ask a question in this room'
          : 'In private rooms, you can only see your own questions. Ask a question to get started!'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={getFilteredQuestions()}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View>
            {item.isMyQuestion && (
              <View style={styles.myQuestionBadge}>
                <Text style={styles.myQuestionBadgeText}>✓ Your Question</Text>
              </View>
            )}
            <QuestionCard
              question={item.question}
              upvotes={item.upvotes}
              status={item.status}
              onUpvote={() => handleUpvote(item.id)}
              onReport={() => handleReport(item.id)}
              onPress={() => {/* Navigate to question details */}}
            />
          </View>
        )}
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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAskQuestion}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>✏️</Text>
        <Text style={styles.fabText}>Ask</Text>
      </TouchableOpacity>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setReportModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Question</Text>
            <Text style={styles.modalSubtitle}>Why are you reporting this question?</Text>
            
            <TouchableOpacity
              style={styles.reportOption}
              onPress={() => submitReport('Spam')}
              activeOpacity={0.7}
            >
              <Text style={styles.reportOptionIcon}>🚫</Text>
              <Text style={styles.reportOptionText}>Spam</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportOption}
              onPress={() => submitReport('Inappropriate')}
              activeOpacity={0.7}
            >
              <Text style={styles.reportOptionIcon}>⚠️</Text>
              <Text style={styles.reportOptionText}>Inappropriate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reportOption}
              onPress={() => submitReport('Off-topic')}
              activeOpacity={0.7}
            >
              <Text style={styles.reportOptionIcon}>📌</Text>
              <Text style={styles.reportOptionText}>Off-topic</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reportOption, styles.cancelOption]}
              onPress={() => setReportModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: spacing.xxl * 2, // Extra space for FAB
  },
  
  // Header
  header: {
    marginBottom: spacing.lg,
  },
  roomInfo: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  roomName: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  roomDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  lecturerLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    flex: 1,
  },
  roomCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  roomCodeLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  roomCode: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.primary,
    letterSpacing: 2,
  },
  
  // Filters
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  filterBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: colors.primaryDark,
  },
  filterBadgeText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.textSecondary,
  },
  filterBadgeTextActive: {
    color: colors.white,
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
  
  // Private Room Banner
  privateRoomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning || '#F59E0B',
  },
  privateRoomIcon: {
    fontSize: typography.xl,
    marginRight: spacing.md,
  },
  privateRoomTextContainer: {
    flex: 1,
  },
  privateRoomTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  privateRoomDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  
  // My Question Badge
  myQuestionBadge: {
    backgroundColor: colors.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  myQuestionBadgeText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: spacing.xxl * 2,
    right: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.lg,
  },
  fabIcon: {
    fontSize: typography.lg,
  },
  fabText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  
  // Report Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: typography.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  reportOptionIcon: {
    fontSize: typography.xl,
    marginRight: spacing.md,
  },
  reportOptionText: {
    fontSize: typography.md,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  cancelOption: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  cancelText: {
    fontSize: typography.md,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default RoomFeedScreen;

