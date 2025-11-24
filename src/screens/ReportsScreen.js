import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  Alert,
  RefreshControl
} from 'react-native';
import { Screen, Card, Button } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

// Mock reported questions data
const MOCK_REPORTS = [
  {
    id: '1',
    question: 'This is an inappropriate question that needs review',
    reason: 'Inappropriate content',
    reportCount: 3,
    timestamp: '10 min ago',
  },
  {
    id: '2',
    question: 'Is this course going to have more assignments?',
    reason: 'Off-topic',
    reportCount: 1,
    timestamp: '25 min ago',
  },
  {
    id: '3',
    question: 'When will the grades be posted?',
    reason: 'Spam',
    reportCount: 2,
    timestamp: '1 hour ago',
  },
];

export const ReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [refreshing, setRefreshing] = useState(false);

  const handleReview = (reportId) => {
    Alert.alert(
      'Keep Question',
      'The question will remain visible and reports will be dismissed',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Keep',
          onPress: () => {
            setReports(prev => prev.filter(r => r.id !== reportId));
            Alert.alert('✅ Reviewed', 'Question kept and reports dismissed');
          },
        },
      ]
    );
  };

  const handleRemove = (reportId) => {
    Alert.alert(
      'Remove Question',
      'This question will be permanently removed',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setReports(prev => prev.filter(r => r.id !== reportId));
            Alert.alert('🗑️ Removed', 'Question has been removed');
          },
        },
      ]
    );
  };

  const handleDismiss = (reportId) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderReportCard = ({ item }) => (
    <Card style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportBadge}>
          <Text style={styles.reportBadgeText}>
            {item.reportCount} {item.reportCount === 1 ? 'Report' : 'Reports'}
          </Text>
        </View>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>

      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>Reason:</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>

      <Text style={styles.questionText}>{item.question}</Text>

      <View style={styles.actionButtons}>
        <Button
          title="Keep"
          onPress={() => handleReview(item.id)}
          variant="secondary"
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Dismiss"
          onPress={() => handleDismiss(item.id)}
          variant="ghost"
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Remove"
          onPress={() => handleRemove(item.id)}
          variant="danger"
          size="small"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Reported Questions</Text>
      <Text style={styles.description}>
        Review and moderate questions that have been reported by students
      </Text>
      
      {reports.length > 0 && (
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            {reports.length} {reports.length === 1 ? 'question needs' : 'questions need'} your attention
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>✅</Text>
      <Text style={styles.emptyTitle}>No Reports</Text>
      <Text style={styles.emptyDescription}>
        All clear! No reported questions at the moment.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        renderItem={renderReportCard}
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
    marginBottom: spacing.md,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningIcon: {
    fontSize: typography.xl,
    marginRight: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.md,
    fontWeight: typography.medium,
    color: colors.warning,
  },
  
  // Report card
  reportCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reportBadge: {
    backgroundColor: colors.error + '20',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  reportBadgeText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.error,
  },
  timestamp: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  reasonContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  reasonLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  reasonText: {
    fontSize: typography.sm,
    color: colors.error,
    fontWeight: typography.medium,
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
