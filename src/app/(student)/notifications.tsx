import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { notificationApi } from '@/services/api';
import { Notification } from '@/types';
import { EmptyState, LoadingIndicator } from '@/components/common';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await notificationApi.getNotifications(token, { limit: 50 });
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.warn('[NotificationsScreen] Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (item: Notification) => {
    // If unread, mark read in the background
    if (!item.isRead && token) {
      notificationApi.markAsRead(item.id, token).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // Navigate to event details if eventId is attached
    if (item.eventId) {
      try {
        router.push(`/event/${item.eventId}` as any);
      } catch (err) {
        Alert.alert('Notice', 'The event linked to this notification could not be opened.');
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (!token || unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      const res = await notificationApi.markAllAsRead(token);
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'registration_success':
        return { name: 'checkmark-circle' as const, color: '#10B981', bg: '#D1FAE5' };
      case 'event_update':
        return { name: 'information-circle' as const, color: '#2563EB', bg: '#DBEAFE' };
      case 'cancellation':
        return { name: 'close-circle' as const, color: '#EF4444', bg: '#FEE2E2' };
      case 'reminder':
        return { name: 'alarm' as const, color: '#F59E0B', bg: '#FEF3C7' };
      default:
        return { name: 'notifications' as const, color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);
    const dateStr = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name} size={22} color={icon.color} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.topRow}>
            <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.message} numberOfLines={3}>
            {item.message}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={styles.timestamp}>{dateStr}</Text>
            {item.eventId && (
              <View style={styles.viewEventBadge}>
                <Text style={styles.viewEventText}>View Event</Text>
                <Ionicons name="chevron-forward" size={12} color="#2563EB" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingIndicator fullScreen message="Loading notifications..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            disabled={isMarkingAll}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#2563EB" />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications Yet"
            description="You are all caught up! Updates about your registered events, reminders, and schedule changes will appear here."
            actionTitle="Explore Events"
            onActionPress={() => router.push('/(student)/events')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.three,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  backButton: {
    padding: Spacing.one,
    marginRight: Spacing.one,
  },
  headerTitle: {
    fontSize: Typography.size.xl,
    fontWeight: '700',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 4,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EFF6FF',
  },
  markAllText: {
    color: '#2563EB',
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.three,
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#BFDBFE',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 6,
  },
  message: {
    fontSize: Typography.size.sm,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestamp: {
    fontSize: Typography.size.xs,
    color: '#94A3B8',
  },
  viewEventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewEventText: {
    fontSize: Typography.size.xs,
    color: '#2563EB',
    fontWeight: '600',
  },
});
