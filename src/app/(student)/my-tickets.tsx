import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Registration } from '@/types';

const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg_1',
    eventId: 'evt_1',
    studentId: 'usr_student_01',
    eventTitle: 'HackCampus 2026: 24h Hackathon',
    eventStartDate: '2026-10-15T09:00:00Z',
    eventVenue: 'Main Auditorium & Lab 4',
    registrationDate: '2026-10-01T14:30:00Z',
    status: 'registered',
    ticketCode: 'CC-HACK-84920',
  },
  {
    id: 'reg_2',
    eventId: 'evt_3',
    studentId: 'usr_student_01',
    eventTitle: 'Cloud & AI Workshop with Industry Experts',
    eventStartDate: '2026-10-28T14:00:00Z',
    eventVenue: 'MCA Computer Lab 3',
    registrationDate: '2026-10-02T11:15:00Z',
    status: 'registered',
    ticketCode: 'CC-AIWS-19342',
  },
];

export default function MyTicketsScreen() {
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);

  const handleCancelRegistration = (id: string, title?: string) => {
    Alert.alert(
      'Cancel Registration',
      `Are you sure you want to cancel your registration for "${title}"?`,
      [
        { text: 'Keep Ticket', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setRegistrations((prev) => prev.filter((r) => r.id !== id));
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Event Passes</Text>
        <Text style={styles.subtitle}>
          Show these digital passes at the event entrance for verification
        </Text>
      </View>

      {registrations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="ticket-outline" size={54} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No Active Registrations</Text>
          <Text style={styles.emptyDesc}>
            You haven't registered for any events yet. Explore upcoming events and reserve your spot!
          </Text>
        </View>
      ) : (
        registrations.map((ticket) => (
          <View key={ticket.id} style={styles.ticketCard}>
            {/* Ticket Header */}
            <View style={styles.ticketTop}>
              <View style={styles.badgeRow}>
                <View style={styles.confirmedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.confirmedBadgeText}>CONFIRMED PASS</Text>
                </View>
                <Text style={styles.ticketCode}>{ticket.ticketCode}</Text>
              </View>

              <Text style={styles.eventTitle}>{ticket.eventTitle}</Text>
            </View>

            {/* Perforated Divider */}
            <View style={styles.perforationContainer}>
              <View style={styles.leftCutout} />
              <View style={styles.dashedLine} />
              <View style={styles.rightCutout} />
            </View>

            {/* Ticket Details */}
            <View style={styles.ticketBottom}>
              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>DATE & TIME</Text>
                  <Text style={styles.infoValue}>
                    {new Date(ticket.eventStartDate || '').toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>VENUE</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {ticket.eventVenue}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code-outline" size={24} color="#2563EB" />
                  <Text style={styles.qrText}>Digital Pass</Text>
                </View>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelRegistration(ticket.id, ticket.eventTitle)}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                  <Text style={styles.cancelText}>Cancel Registration</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
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
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  ticketTop: {
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  confirmedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  ticketCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  perforationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 20,
    backgroundColor: '#FFFFFF',
  },
  leftCutout: {
    width: 16,
    height: 20,
    backgroundColor: '#F8FAFC',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#E2E8F0',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  rightCutout: {
    width: 16,
    height: 20,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '#E2E8F0',
  },
  ticketBottom: {
    padding: 18,
    backgroundColor: '#F8FAFC',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  qrPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qrText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
});
