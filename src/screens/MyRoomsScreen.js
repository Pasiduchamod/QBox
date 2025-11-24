import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Screen, Card } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { roomAPI, authAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export const MyRoomsScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getMyRooms();
      
      if (response.success) {
        setRooms(response.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        await authAPI.logout();
        navigation.replace('Login');
      } else {
        Alert.alert('Error', 'Failed to load rooms');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const handleRoomPress = (room) => {
    navigation.navigate('LecturerPanel', { 
      roomId: room._id,
      roomCode: room.roomCode, 
      roomName: room.roomName,
      roomStatus: room.status,
      questionsVisible: room.questionsVisible
    });
  };

  const handleDeleteRoom = (room) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${room.roomName}"? This will permanently delete all questions in this room.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await roomAPI.deleteRoom(room._id);
              if (response.success) {
                Alert.alert('Success', 'Room deleted successfully');
                fetchRooms(); // Refresh the list
              } else {
                Alert.alert('Error', response.message || 'Failed to delete room');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete room');
            }
          }
        }
      ]
    );
  };

  const renderRoomCard = ({ item }) => (
    <Card style={styles.roomCard}>
      <TouchableOpacity 
        onPress={() => handleRoomPress(item)}
        activeOpacity={0.7}
        style={styles.roomCardTouchable}
      >
        <View style={styles.roomHeader}>
          <View style={styles.roomTitleContainer}>
            <Text style={styles.roomName} numberOfLines={1}>{item.roomName}</Text>
          </View>
          <View style={styles.roomCodeRow}>
            <Text style={styles.roomCode}>{item.roomCode}</Text>
            <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.closedBadge]}>
              <Text style={[styles.statusText, item.status === 'active' ? styles.activeText : styles.closedText]}>
                {item.status === 'active' ? '🟢 Active' : '🔴 Closed'}
              </Text>
            </View>
          </View>
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
            <Text style={styles.statLabel}>Enrollments</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteRoom(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </Card>
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

  if (loading) {
    return (
      <Screen>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading rooms...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={item => item._id}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: colors.textSecondary,
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
    position: 'relative',
  },
  roomCardTouchable: {
    flex: 1,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  deleteButtonText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  roomHeader: {
    marginBottom: spacing.md,
  },
  roomTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingRight: 44, // Space for delete button
  },
  roomName: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  roomCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomCode: {
    fontSize: typography.md,
    fontWeight: typography.bold,
    color: colors.primary,
    letterSpacing: 2,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
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
