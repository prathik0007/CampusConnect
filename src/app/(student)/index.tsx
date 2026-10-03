import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Ionicons } from '@expo/vector-icons';
import { CampusEvent, EventCategory } from '@/types';
import { AppCard, LoadingIndicator } from '@/components/common';
import { CategoryChip, EventCard } from '@/components/events';
import { notificationApi } from '@/services/api';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

const ALL_CATEGORIES: EventCategory[] = [
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
  'Other',
];

export default function StudentHomeScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { events, isLoading, isRegistered, getStudentRegistrations } = useEvents();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (token) {
      notificationApi.getNotifications(token, { limit: 1 }).then((res) => {
        if (res.success && res.data) {
          setUnreadCount(res.data.unreadCount);
        }
      }).catch(() => {});
    }
  }, [token]);

  const currentStudentId = user?.id || 'usr_student_01';
  const myRegistrations = getStudentRegistrations(currentStudentId);

  // Pick first event as featured, and subsequent events as upcoming
  const featuredEvent: CampusEvent | undefined = events[0];
  const upcomingEvents: CampusEvent[] = events.slice(1);

  const navigateToEventDetails = (event: CampusEvent) => {
    router.push(`/event/${event.id}` as any);
  };

  const navigateToEventsWithCategory = (category: EventCategory) => {
    router.push({
      pathname: '/(student)/events',
      params: { category },
    });
  };

  if (isLoading) {
    return <LoadingIndicator fullScreen message="Loading Campus Events..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Student Welcome Banner */}
      <AppCard variant="flat" style={styles.bannerCard} padding="lg">
        <View style={styles.bannerRow}>
          <View style={styles.bannerText}>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.userName}>{user?.name || 'Prathik Kumar'}</Text>
            <Text style={styles.userDept}>
              {user?.department || 'Department of Computer Applications (MCA)'} •{' '}
              {user?.rollNumber || 'MCA2024042'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => router.push('/(student)/notifications' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.light.primary} />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </AppCard>

      {/* Quick Summary Cards */}
      <View style={styles.statsRow}>
        <AppCard
          style={styles.statCard}
          variant="outlined"
          padding="md"
          onPress={() => router.push('/(student)/events')}
        >
          <Ionicons name="calendar-outline" size={22} color={Colors.light.primary} />
          <Text style={styles.statNumber}>{events.length}</Text>
          <Text style={styles.statLabel}>Campus Events</Text>
        </AppCard>

        <AppCard
          style={styles.statCard}
          variant="outlined"
          padding="md"
          onPress={() => router.push('/(student)/my-tickets')}
        >
          <Ionicons name="ticket-outline" size={22} color={Colors.light.secondary} />
          <Text style={styles.statNumber}>{myRegistrations.length}</Text>
          <Text style={styles.statLabel}>My Passes</Text>
        </AppCard>
      </View>

      {/* Category Shortcuts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <TouchableOpacity onPress={() => router.push('/(student)/events')}>
            <Text style={styles.seeAllText}>View All ({events.length})</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {ALL_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              category={cat}
              onPress={() => navigateToEventsWithCategory(cat)}
              size="md"
            />
          ))}
        </ScrollView>
      </View>

      {/* Featured Event Section */}
      {featuredEvent && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Campus Event</Text>
            <TouchableOpacity onPress={() => navigateToEventDetails(featuredEvent)}>
              <Text style={styles.seeAllText}>Details</Text>
            </TouchableOpacity>
          </View>

          <EventCard
            event={featuredEvent}
            isRegistered={isRegistered(featuredEvent.id, currentStudentId)}
            onPress={navigateToEventDetails}
            onRegisterPress={navigateToEventDetails}
          />
        </View>
      )}

      {/* Upcoming Events Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => router.push('/(student)/events')}>
            <Text style={styles.seeAllText}>See all ({upcomingEvents.length})</Text>
          </TouchableOpacity>
        </View>

        {upcomingEvents.slice(0, 3).map((evt) => (
          <EventCard
            key={evt.id}
            event={evt}
            isRegistered={isRegistered(evt.id, currentStudentId)}
            onPress={navigateToEventDetails}
            onRegisterPress={navigateToEventDetails}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  bannerCard: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: '#DBEAFE',
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: {
    flex: 1,
  },
  greeting: {
    fontSize: Typography.size.sm,
    color: Colors.light.primary,
    fontWeight: Typography.weight.semibold,
  },
  userName: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.heavy,
    color: '#1E3A8A',
    marginTop: 2,
  },
  userDept: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: Spacing.one,
    lineHeight: 16,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginLeft: Spacing.two,
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.text,
    marginTop: Spacing.one,
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  seeAllText: {
    fontSize: Typography.size.sm,
    color: Colors.light.primary,
    fontWeight: Typography.weight.semibold,
  },
  categoriesRow: {
    gap: Spacing.two,
    paddingVertical: Spacing.half,
  },
});
