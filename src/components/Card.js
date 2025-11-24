import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, typography, shadows, spacing } from '../theme';

export const Card = ({ 
  children, 
  style = {},
  onPress = null,
  variant = 'default',
  noPadding = false,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'answered':
        return styles.answeredCard;
      case 'pending':
        return styles.pendingCard;
      case 'hidden':
        return styles.hiddenCard;
      default:
        return null;
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.card,
        getVariantStyle(),
        noPadding && styles.noPadding,
        style
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </Container>
  );
};

export const QuestionCard = ({ 
  question, 
  upvotes = 0, 
  status = 'pending',
  studentTag = '',
  isMyQuestion = false,
  onUpvote,
  onPress,
  onReport,
  showStatus = true,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'answered':
        return { label: 'Answered', color: colors.info, bg: colors.answered };
      case 'pending':
        return { label: 'Pending', color: colors.warning, bg: colors.pending };
      case 'hidden':
        return { label: 'Hidden', color: colors.textSecondary, bg: colors.hidden };
      default:
        return { label: 'Pending', color: colors.warning, bg: colors.pending };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card onPress={onPress} style={[
      styles.questionCard,
      isMyQuestion && styles.myQuestionCard
    ]}>
      <View style={styles.questionContent}>
        {/* Student Tag */}
        <View style={styles.questionHeader}>
          <Text style={[styles.studentTag, isMyQuestion && styles.myStudentTag]}>
            {isMyQuestion ? '👤 You' : `👤 ${studentTag}`}
          </Text>
        </View>
        
        <Text style={styles.questionText}>{question}</Text>
        
        <View style={styles.questionFooter}>
          <TouchableOpacity 
            style={styles.upvoteButton}
            onPress={onUpvote}
            activeOpacity={0.7}
          >
            <Text style={styles.upvoteIcon}>👍</Text>
            <Text style={styles.upvoteCount}>{upvotes}</Text>
          </TouchableOpacity>
          
          <View style={styles.rightFooter}>
            {showStatus && (
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
            )}
            
            {onReport && (
              <TouchableOpacity
                style={styles.reportButton}
                onPress={onReport}
                activeOpacity={0.7}
              >
                <Text style={styles.reportIcon}>⋮</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.md,
    marginBottom: spacing.md,
  },
  noPadding: {
    padding: 0,
  },
  
  // Variant styles
  answeredCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  hiddenCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.textTertiary,
    opacity: 0.7,
  },
  
  // Question card specific
  questionCard: {
    marginBottom: spacing.md,
  },
  myQuestionCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  questionHeader: {
    marginBottom: spacing.xs,
  },
  studentTag: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  myStudentTag: {
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: typography.md,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.md,
    marginBottom: spacing.md,
  },
  questionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
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
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  statusText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
  reportButton: {
    padding: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  reportIcon: {
    fontSize: typography.xl,
    color: colors.textSecondary,
    fontWeight: typography.bold,
  },
});

export default Card;
