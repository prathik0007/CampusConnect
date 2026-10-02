import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Registration } from '@/types';
import { AppButton, EmptyState, StatusBadge } from '@/components/common';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';

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
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);

  const handleCancelRegistration = (id: string, title?: string) => {
    Alert.alert(
      'Cancel Event Pass',
      `Are you sure you want to cancel your pass for "${title}"? This ticket will become invalid.`,
      [
        { text: 'Keep My Pass', style: 'cancel' },
        {
          text: 'Yes, Cancel Pass',
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
        <Text style={styles.title}>Your Digital Passes</Text>
        <Text style={styles.subtitle}>
          Present these passes at campus entry gates for digital verification
        </Text>
      </View>

      {registrations.length === 0 ? (
        <EmptyState
          title="No Active Passes Found"
          description="You haven't reserved tickets for any events yet. Explore upcoming campus events and reserve your spot!"
          icon="ticket-outline"
          actionTitle="Browse Events"
          onActionPress={() => router.push('/(student)/events')}
        />
      ) : (
        registrations.map((ticket) => (
          <View key={ticket.id} style={[styles.ticketCard, Shadows.md]}>
            {/* Ticket Header */}
            <View style={styles.ticketTop}>
              <View style={styles.badgeRow}>
                <StatusBadge label="Confirmed Pass" status="success" icon="checkmark-circle" />
                <Text style={styles.ticketCode}>{ticket.ticketCode}</Text>
              </View>

              <Text style={styles.eventTitle}>{ticket.eventTitle}</Text>
            </View>

            {/* Perforated Cutout Divider */}
            <View style={styles.perforationContainer}>
              <View style={styles.leftCutout} />
              <View style={styles.dashedLine} />
              <View style={styles.rightCutout} />
            </View>

            {/* Ticket Details */}
            <View style={styles.ticketBottom}>
              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>DATE</Text>
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
                  <Ionicons name="qr-code-outline" size={24} color={Colors.light.primary} />
                  <Text style={styles.qrText}>Digital QR Verified</Text>
                </View>

                <AppButton
                  title="Cancel Pass"
                  variant="danger"
                  size="sm"
                  fullWidth={false}
                  icon="close-circle-outline"
                  onPress={() => handleCancelRegistration(ticket.id, ticket.eventTitle)}
                />
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
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  header: {
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  ticketCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  ticketTop: {
    padding: Spacing.three,
    backgroundColor: Colors.light.card,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  ticketCode: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eventTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  perforationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
    backgroundColor: Colors.light.card,
  },
  leftCutout: {
    width: 16,
    height: 18,
    backgroundColor: Colors.light.background,
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: Colors.light.border,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginHorizontal: Spacing.two,
  },
  rightCutout: {
    width: 16,
    height: 18,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: Colors.light.border,
  },
  ticketBottom: {
    padding: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.bold,
    color: Colors.light.textTertiary,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.light.text,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.two,
  },
  qrPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  qrText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.light.primary,
  },
});
