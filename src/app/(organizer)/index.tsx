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
import { Ionicons } from '@expo/vector-icons';

export default function OrganizerDashboardScreen() {
  const router = useRouter();
  const { user, logout, switchRole } = useAuth();

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerHeader}>
          <View>
            <Text style={styles.roleTag}>ORGANIZER CONSOLE</Text>
            <Text style={styles.organizerName}>{user?.name || 'Tech & Cultural Council'}</Text>
            <Text style={styles.organizerSub}>{user?.email || 'organizer@campus.edu'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {/* Quick Role Switcher Banner */}
        <TouchableOpacity style={styles.switchBar} onPress={handleSwitchToStudent}>
          <Ionicons name="swap-horizontal" size={16} color="#047857" />
          <Text style={styles.switchBarText}>Switch to Student Portal</Text>
        </TouchableOpacity>
      </View>

      {/* Analytics KPI Grid */}
      <Text style={styles.sectionTitle}>Overview Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <View style={[styles.statIconBadge, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="calendar-outline" size={20} color="#059669" />
          </View>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>Active Events</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.statIconBadge, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="people-outline" size={20} color="#2563EB" />
          </View>
          <Text style={styles.statNumber}>456</Text>
          <Text style={styles.statLabel}>Total Registrations</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="pie-chart-outline" size={20} color="#D97706" />
          </View>
          <Text style={styles.statNumber}>78%</Text>
          <Text style={styles.statLabel}>Capacity Filled</Text>
        </View>

        <View style={styles.statBox}>
          <View style={[styles.statIconBadge, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="checkmark-done-circle-outline" size={20} color="#7C3AED" />
          </View>
          <Text style={styles.statNumber}>184</Text>
          <Text style={styles.statLabel}>Checked-in</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Management</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(organizer)/create-event')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="add-circle" size={26} color="#059669" />
          </View>
          <Text style={styles.actionTitle}>Create Event</Text>
          <Text style={styles.actionSub}>Publish new campus event</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(organizer)/attendees')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="list-outline" size={26} color="#2563EB" />
          </View>
          <Text style={styles.actionTitle}>Attendee Roster</Text>
          <Text style={styles.actionSub}>Check-in & student list</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Registrations Activity */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Student Registrations</Text>
        <View style={styles.activityCard}>
          {[
            { name: 'Prathik Kumar', roll: 'MCA2024042', event: 'HackCampus 2026', time: '10 mins ago' },
            { name: 'Sneha Rao', roll: 'MCA2024018', event: 'Verve Cultural Fest', time: '35 mins ago' },
            { name: 'Aditya Sharma', roll: 'MCA2024005', event: 'Cloud & AI Workshop', time: '1 hour ago' },
          ].map((item, idx) => (
            <View key={idx} style={[styles.activityRow, idx > 0 && styles.activityBorder]}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={16} color="#059669" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{item.name}</Text>
                <Text style={styles.activityEvent}>
                  {item.roll} • {item.event}
                </Text>
              </View>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
    gap: 16,
  },
  banner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  organizerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
    marginTop: 2,
  },
  organizerSub: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  switchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  switchBarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  recentSection: {
    marginTop: 4,
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  activityBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  activityEvent: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  activityTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
