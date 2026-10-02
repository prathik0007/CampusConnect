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

export default function StudentProfileScreen() {
  const router = useRouter();
  const { user, logout, switchRole } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
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

  const handleSwitchToOrganizer = async () => {
    await switchRole('organizer');
    router.replace('/(organizer)/index');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Student Identity Card */}
      <View style={styles.idCard}>
        <View style={styles.avatarWrapper}>
          <Ionicons name="person" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.userName}>{user?.name || 'Prathik Kumar'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'student@campus.edu'}</Text>

        <View style={styles.roleBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#1D4ED8" />
          <Text style={styles.roleBadgeText}>STUDENT ACCOUNT</Text>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>DEPARTMENT</Text>
            <Text style={styles.detailValue}>{user?.department || 'MCA'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>ROLL NUMBER</Text>
            <Text style={styles.detailValue}>{user?.rollNumber || 'MCA2024042'}</Text>
          </View>
        </View>
      </View>

      {/* Switch Role Card (Dev & Demo Feature) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="swap-horizontal" size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>Role Switcher (Demo)</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Switch to the Organizer portal to test event creation, attendee management, and dashboard analytics.
        </Text>
        <TouchableOpacity style={styles.switchButton} onPress={handleSwitchToOrganizer}>
          <Ionicons name="briefcase-outline" size={18} color="#2563EB" />
          <Text style={styles.switchButtonText}>Switch to Organizer View</Text>
        </TouchableOpacity>
      </View>

      {/* App Preferences */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuRow}>
          <View style={styles.menuLeft}>
            <Ionicons name="notifications-outline" size={20} color="#475569" />
            <Text style={styles.menuText}>Push Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow}>
          <View style={styles.menuLeft}>
            <Ionicons name="information-circle-outline" size={20} color="#475569" />
            <Text style={styles.menuText}>About CampusConnect</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuRow, styles.logoutRow]} onPress={handleLogout}>
          <View style={styles.menuLeft}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>
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
  idCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    marginTop: 10,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  detailsGrid: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    width: '100%',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  sectionDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 12,
  },
  switchButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  switchButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  logoutRow: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});
