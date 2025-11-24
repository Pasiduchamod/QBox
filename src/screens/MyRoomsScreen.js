import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { Screen, Card } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

// Mock data for past rooms
const MOCK_ROOMS = [
  {
    id: '1',
    roomName: 'Computer Science 101',
    roomCode: 'ABC123',
    createdAt: '2024-11-20',
    status: 'active',
    questionCount: 24,
    studentsCount: 45,
    questionsVisible: true,
  },
  {
    id: '2',
    roomName: 'Data Structures Lecture',
    roomCode: 'XYZ789',
    createdAt: '2024-11-18',
    status: 'closed',
    questionCount: 18,
    studentsCount: 38,
    questionsVisible: false,
  },
  {
    id: '3',
    roomName: 'Web Development Workshop',
    roomCode: 'DEF456',
    createdAt: '2024-11-15',
    status: 'closed',
    questionCount: 32,
    studentsCount: 52,
    questionsVisible: true,
  },
];

export const MyRoomsScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleRoomPress = (room) => {
    navigation.navigate('LecturerPanel', { 
      roomCode: room.roomCode, 
      roomName: room.roomName,
      roomStatus: room.status,
      questionsVisible: room.questionsVisible
    });
  };

  const renderRoomCard = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleRoomPress(item)}
      activeOpacity={0.7}
    >
      <Card style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <View style={styles.roomTitleContainer}>
            <Text style={styles.roomName}>{item.roomName}</Text>
            <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.closedBadge]}>
              <Text style={[styles.statusText, item.status === 'active' ? styles.activeText : styles.closedText]}>
                {item.status === 'active' ? '🟢 Active' : '🔴 Closed'}
              </Text>
            </View>
          </View>
          <Text style={styles.roomCode}>{item.roomCode}</Text>
        </View>

        <View style={styles.roomStats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statValue}>{item.questionCount}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{item.studentsCount}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.title}>My Rooms</Text>
          <Text style={styles.subtitle}>View and manage your Q&A sessions</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings', { userType: 'lecturer' })}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📚</Text>
      <Text style={styles.emptyTitle}>No rooms yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first room to get started
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateRoom')}
        activeOpacity={0.7}
      >
        <Text style={styles.createButtonText}>+ Create New Room</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={item => item.id}
        renderItem={renderRoomCard}
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
      {rooms.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateRoom')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
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
    paddingBottom: spacing.xxl * 2,
  },
  
  // Header
  header: {
    marginBottom: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  settingsIcon: {
    fontSize: 24,
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
  },
  
  // Room card
  roomCard: {
    marginBottom: spacing.md,
  },
  roomHeader: {
    marginBottom: spacing.md,
  },
  roomTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  roomName: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    marginLeft: spacing.sm,
  },
  activeBadge: {
    backgroundColor: colors.success + '20',
  },
  closedBadge: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
  },
  activeText: {
    color: colors.success,
  },
  closedText: {
    color: colors.error,
  },
  roomCode: {
    fontSize: typography.md,
    fontWeight: typography.bold,
    color: colors.primary,
    letterSpacing: 2,
  },
  
  // Stats
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: typography.lg,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.md,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.xs,
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
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  createButtonText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: spacing.xxl * 2,
    right: spacing.xl,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  fabIcon: {
    fontSize: typography.xxxl,
    color: colors.white,
    fontWeight: typography.bold,
  },
});

export default MyRoomsScreen;
