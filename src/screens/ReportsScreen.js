import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Card } from '../components';
import { colors, spacing, typography, borderRadius } from '../theme';
import { roomAPI } from '../services/api';

export const ReportsScreen = ({ route, navigation }) => {
  const { roomId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
    } else {
      setLoading(false);
    }
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      const room = await roomAPI.getRoom(roomId);
      setRoomData(room);
      
      const questionsData = await roomAPI.getQuestions(roomId);
      setQuestions(questionsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch room data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRoomData();
    setRefreshing(false);
  };

  if (!roomId) {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorEmoji}>❌</Text>
          <Text style={styles.errorTitle}>No Room Selected</Text>
          <Text style={styles.errorDescription}>
            Please select a room from the Lecturer Panel to view reports.
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading room data...</Text>
        </View>
      </View>
    );
  }

  const pendingQuestions = questions.filter(q => q.status === 'pending');
  const answeredQuestions = questions.filter(q => q.status === 'answered');
  const rejectedQuestions = questions.filter(q => q.status === 'rejected');
  
  const totalQuestions = questions.length;
  const avgUpvotes = questions.length > 0 
    ? (questions.reduce((sum, q) => sum + (q.upvotes || 0), 0) / questions.length).toFixed(1)
    : 0;
  
  const mostUpvoted = questions.length > 0
    ? questions.reduce((max, q) => q.upvotes > max.upvotes ? q : max, questions[0])
    : null;

  const renderStatCard = ({ title, value, subtitle, color = colors.primary, icon = '📊' }) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <View style={styles.statContent}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Room Analytics</Text>
      {roomData && (
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{roomData.name}</Text>
          <Text style={styles.roomCode}>Code: {roomData.code}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {renderHeader()}

        <View style={styles.statsGrid}>
          {renderStatCard({
            title: 'Total Questions',
            value: totalQuestions,
            subtitle: 'All time',
            color: colors.primary,
            icon: '📝'
          })}

          {renderStatCard({
            title: 'Pending',
            value: pendingQuestions.length,
            subtitle: `${((pendingQuestions.length / totalQuestions) * 100 || 0).toFixed(0)}% of total`,
            color: colors.warning,
            icon: '⏳'
          })}

          {renderStatCard({
            title: 'Answered',
            value: answeredQuestions.length,
            subtitle: `${((answeredQuestions.length / totalQuestions) * 100 || 0).toFixed(0)}% of total`,
            color: colors.success,
            icon: '✅'
          })}

          {renderStatCard({
            title: 'Deleted',
            value: rejectedQuestions.length,
            subtitle: `${((rejectedQuestions.length / totalQuestions) * 100 || 0).toFixed(0)}% of total`,
            color: colors.error,
            icon: '🗑️'
          })}
        </View>

        <Card style={styles.engagementCard}>
          <Text style={styles.sectionTitle}>📊 Engagement Metrics</Text>
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Average Upvotes</Text>
            <Text style={styles.metricValue}>{avgUpvotes}</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Upvotes</Text>
            <Text style={styles.metricValue}>
              {questions.reduce((sum, q) => sum + (q.upvotes || 0), 0)}
            </Text>
          </View>

          {roomData && (
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Room Status</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: roomData.isActive ? colors.success + '20' : colors.error + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: roomData.isActive ? colors.success : colors.error }
                ]}>
                  {roomData.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {mostUpvoted && (
          <Card style={styles.topQuestionCard}>
            <Text style={styles.sectionTitle}>🔥 Most Popular Question</Text>
            <Text style={styles.topQuestionText}>{mostUpvoted.question}</Text>
            <View style={styles.topQuestionFooter}>
              <Text style={styles.upvoteCount}>👍 {mostUpvoted.upvotes} upvotes</Text>
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: mostUpvoted.status === 'answered' 
                    ? colors.success + '20' 
                    : mostUpvoted.status === 'rejected'
                    ? colors.error + '20'
                    : colors.warning + '20'
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  { 
                    color: mostUpvoted.status === 'answered' 
                      ? colors.success 
                      : mostUpvoted.status === 'rejected'
                      ? colors.error
                      : colors.warning
                  }
                ]}>
                  {mostUpvoted.status.charAt(0).toUpperCase() + mostUpvoted.status.slice(1)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {totalQuestions === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptyDescription}>
              No questions have been asked in this room yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorDescription: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Header
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  roomInfo: {
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  roomName: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  roomCode: {
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  
  // Stats Grid
  statsGrid: {
    marginBottom: spacing.lg,
  },
  statCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
  },
  statSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  
  // Engagement Card
  engagementCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metricLabel: {
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  statusText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  
  // Top Question Card
  topQuestionCard: {
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  topQuestionText: {
    fontSize: typography.md,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.md,
    marginBottom: spacing.md,
  },
  topQuestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upvoteCount: {
    fontSize: typography.md,
    color: colors.textSecondary,
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

export default ReportsScreen;
