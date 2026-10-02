import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { CampusEvent, EventCategory } from '@/types';
import { AppCard } from '@/components/common/AppCard';
import { CategoryChip, EventCard } from '@/components/events';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

const FEATURED_EVENT: CampusEvent = {
  id: 'evt_1',
  title: 'HackCampus 2026: 24h Hackathon',
  description: 'Annual state-level tech hackathon with cash prizes, mentor sessions, and internship opportunities.',
  category: 'Technical',
  bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
  startDate: '2026-10-15T09:00:00Z',
  endDate: '2026-10-16T09:00:00Z',
  venue: 'Campus Auditorium & Lab 4',
  maxCapacity: 150,
  registeredCount: 84,
  organizerId: 'usr_org_1',
  organizerName: 'Coding Club & MCA Council',
  status: 'published',
};

const CATEGORIES: EventCategory[] = [
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
];

export default function StudentHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Student Welcome Banner */}
      <AppCard variant="flat" style={styles.bannerCard} padding="lg">
        <View style={styles.bannerRow}>
          <View style={styles.bannerText}>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.userName}>{user?.name || 'Prathik Kumar'}</Text>
            <Text style={styles.userDept}>
              {user?.department || 'MCA'} • {user?.rollNumber || 'Student'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => router.push('/(student)/events')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </AppCard>

      {/* Quick Summary Cards */}
      <View style={styles.statsRow}>
        <AppCard style={styles.statCard} variant="outlined" padding="md">
          <Ionicons name="calendar-outline" size={22} color={Colors.light.primary} />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Upcoming Events</Text>
        </AppCard>

        <AppCard style={styles.statCard} variant="outlined" padding="md">
          <Ionicons name="ticket-outline" size={22} color={Colors.light.secondary} />
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Registered Passes</Text>
        </AppCard>
      </View>

      {/* Category Shortcuts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <TouchableOpacity onPress={() => router.push('/(student)/events')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              category={cat}
              onPress={() => router.push('/(student)/events')}
              size="md"
            />
          ))}
        </ScrollView>
      </View>

      {/* Featured Event Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Event</Text>
        </View>

        <EventCard
          event={FEATURED_EVENT}
          isRegistered={true}
          onPress={() => router.push('/(student)/events')}
          onRegisterPress={() => router.push('/(student)/events')}
        />
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
