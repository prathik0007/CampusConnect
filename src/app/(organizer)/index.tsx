import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, AppCard, LoadingIndicator, StatusBadge } from '@/components/common';
import { MetricCard } from '@/components/organizer';
import { EventCard } from '@/components/events';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { CampusEvent } from '@/types';

export default function OrganizerDashboardScreen() {
  const router = useRouter();
  const { user, logout, switchRole } = useAuth();
  const { events, registrations, isLoading } = useEvents();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Sign out of the Organizer Portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleSwitchToStudent = async () => {
    await switchRole('student');
    router.replace('/(student)/index');
  };

  // Dynamic calculations from state
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'published').length;
  const draftEvents = events.filter((e) => e.status === 'draft').length;
  const totalRegistrations = registrations.filter(
    (r) => r.status === 'registered' || r.status === 'attended'
  ).length;
  const totalCheckIns = registrations.filter((r) => r.status === 'attended').length;

  const totalCapacity = events.reduce((sum, e) => sum + e.maxCapacity, 0);
  const totalRegisteredSeats = events.reduce((sum, e) => sum + e.registeredCount, 0);
  const capacityUtilization =
    totalCapacity > 0 ? Math.round((totalRegisteredSeats / totalCapacity) * 100) : 0;

  // Recent 2 events
  const recentEvents = events.slice(0, 2);

  // Recent 4 registrations
  const recentRegistrations = registrations.slice(0, 4);

  const handleNavigateToEvent = (event: CampusEvent) => {
    router.push(`/event/${event.id}` as any);
  };

  if (isLoading) {
    return <LoadingIndicator fullScreen message="Loading organizer metrics..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.roleTagRow}>
              <Text style={styles.roleTag}>ORGANIZER CONSOLE</Text>
              <StatusBadge label="Council Admin" status="success" size="sm" />
            </View>
            <Text style={styles.organizerName}>{user?.name || 'Tech & Cultural Council'}</Text>
            <Text style={styles.organizerSub}>
              {user?.department || 'Department of Computer Applications'} • {user?.email}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={Colors.light.error} />
          </TouchableOpacity>
        </View>

        {/* Quick Role Switcher Banner */}
        <TouchableOpacity style={styles.switchBar} onPress={handleSwitchToStudent} activeOpacity={0.8}>
          <Ionicons name="swap-horizontal" size={16} color={Colors.light.secondary} />
          <Text style={styles.switchBarText}>Switch to Student Portal (Demo Mode)</Text>
        </TouchableOpacity>
      </View>

      {/* Analytics KPI Metric Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Overview Analytics</Text>
        <Text style={styles.sectionSubtitle}>Real-time campus event participation</Text>
      </View>

      <View style={styles.statsGrid}>
        <MetricCard
          title="Total Events"
          value={totalEvents}
          icon="calendar-outline"
          iconColor={Colors.light.secondary}
          iconBg={Colors.light.secondaryLight}
          subtext={`${publishedEvents} published, ${draftEvents} drafts`}
          onPress={() => router.push('/(organizer)/my-events')}
        />

        <MetricCard
          title="Total Passes Issued"
          value={totalRegistrations}
          icon="ticket-outline"
          iconColor={Colors.light.primary}
          iconBg={Colors.light.primaryLight}
          subtext="Across all campus events"
          onPress={() => router.push('/(organizer)/attendees')}
        />

        <MetricCard
          title="Verified Check-ins"
          value={totalCheckIns}
          icon="checkmark-done-circle-outline"
          iconColor="#7C3AED"
          iconBg="#F5F3FF"
          subtext={`${
            totalRegistrations > 0
              ? Math.round((totalCheckIns / totalRegistrations) * 100)
              : 0
          }% attendance rate`}
          onPress={() => router.push('/(organizer)/attendees')}
        />

        <MetricCard
          title="Capacity Filled"
          value={`${capacityUtilization}%`}
          icon="pie-chart-outline"
          iconColor={Colors.light.warningText}
          iconBg={Colors.light.warningLight}
          subtext={`${totalRegisteredSeats}/${totalCapacity} total seats`}
          onPress={() => router.push('/(organizer)/my-events')}
        />
      </View>

      {/* Quick Management Shortcuts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Management</Text>
      </View>

      <View style={styles.actionsRow}>
        <AppCard
          style={styles.actionCard}
          variant="outlined"
          padding="md"
          onPress={() => router.push('/(organizer)/create-event')}
        >
          <View style={[styles.actionIcon, { backgroundColor: Colors.light.secondaryLight }]}>
            <Ionicons name="add-circle" size={26} color={Colors.light.secondary} />
          </View>
          <Text style={styles.actionTitle}>Create Event</Text>
          <Text style={styles.actionSub}>Publish new campus activity</Text>
        </AppCard>

        <AppCard
          style={styles.actionCard}
          variant="outlined"
          padding="md"
          onPress={() => router.push('/(organizer)/attendees')}
        >
          <View style={[styles.actionIcon, { backgroundColor: Colors.light.primaryLight }]}>
            <Ionicons name="people" size={26} color={Colors.light.primary} />
          </View>
          <Text style={styles.actionTitle}>Attendee Roster</Text>
          <Text style={styles.actionSub}>Check-in & student verification</Text>
        </AppCard>
      </View>

      {/* Recent Events Showcase */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Managed Campus Events</Text>
          <TouchableOpacity onPress={() => router.push('/(organizer)/my-events')}>
            <Text style={styles.seeAllText}>View All ({events.length})</Text>
          </TouchableOpacity>
        </View>

        {recentEvents.map((evt) => (
          <EventCard
            key={evt.id}
            event={evt}
            isOrganizerView={true}
            onPress={handleNavigateToEvent}
            onAttendeesPress={() => router.push({ pathname: '/(organizer)/attendees', params: { eventId: evt.id } })}
            onEditPress={() => router.push(`/event-edit/${evt.id}` as any)}
          />
        ))}
      </View>

      {/* Recent Registrations & Check-ins Activity Feed */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Student Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(organizer)/attendees')}>
            <Text style={styles.seeAllText}>Full Roster</Text>
          </TouchableOpacity>
        </View>

        <AppCard variant="outlined" padding="none">
          {recentRegistrations.map((item, idx) => {
            const isAttended = item.status === 'attended';
            return (
              <View
                key={item.id}
                style={[styles.activityRow, idx > 0 && styles.activityBorder]}
              >
                <View
                  style={[
                    styles.userAvatar,
                    {
                      backgroundColor: isAttended
                        ? Colors.light.secondaryLight
                        : Colors.light.primaryLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={isAttended ? 'checkmark-circle' : 'person'}
                    size={16}
                    color={isAttended ? Colors.light.secondary : Colors.light.primary}
                  />
                </View>

                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{item.studentName}</Text>
                  <Text style={styles.activityEvent} numberOfLines={1}>
                    {item.studentRollNumber} • {item.eventTitle}
                  </Text>
                </View>

                <StatusBadge
                  label={isAttended ? 'Present' : 'Registered'}
                  status={isAttended ? 'success' : 'info'}
                  size="sm"
                />
              </View>
            );
          })}
        </AppCard>
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
    gap: Spacing.three,
  },
  banner: {
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: 4,
  },
  roleTag: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.secondaryDark,
    letterSpacing: 0.5,
  },
  organizerName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.heavy,
    color: '#064E3B',
    marginTop: 2,
  },
  organizerSub: {
    fontSize: Typography.size.xs,
    color: Colors.light.secondaryDark,
    marginTop: 2,
    lineHeight: 16,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginLeft: Spacing.two,
  },
  switchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.three,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  switchBarText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.light.secondaryDark,
  },
  sectionHeader: {
    marginBottom: Spacing.half,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  sectionSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  seeAllText: {
    fontSize: Typography.size.sm,
    color: Colors.light.secondary,
    fontWeight: Typography.weight.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionCard: {
    flex: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  actionTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  actionSub: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  section: {
    gap: Spacing.two,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  activityBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  activityEvent: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
});
