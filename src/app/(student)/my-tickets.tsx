import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { Registration } from '@/types';
import { AppButton, EmptyState, LoadingIndicator, StatusBadge } from '@/components/common';
import { CategoryChip } from '@/components/events';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';

export default function MyTicketsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getStudentRegistrations, cancelRegistration, isLoading } = useEvents();

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const currentStudentId = user?.id || 'usr_student_01';
  const registrations: Registration[] = getStudentRegistrations(currentStudentId);

  const handleCancelPass = (registration: Registration) => {
    Alert.alert(
      'Cancel Event Pass',
      `Are you sure you want to cancel your pass for "${registration.eventTitle}"? Your ticket (${registration.ticketCode}) will be voided.`,
      [
        { text: 'Keep Pass', style: 'cancel' },
        {
          text: 'Yes, Cancel Pass',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(registration.id);
            try {
              const res = await cancelRegistration(registration.eventId, currentStudentId);
              if (res.success) {
                Alert.alert('Pass Cancelled', 'Your registration has been removed.');
              } else {
                Alert.alert('Error', res.error || 'Failed to cancel pass.');
              }
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const handleOpenDetails = (eventId: string) => {
    router.push(`/event/${eventId}` as any);
  };

  if (isLoading) {
    return <LoadingIndicator fullScreen message="Loading your passes..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Digital Passes</Text>
        <Text style={styles.subtitle}>
          Tap any pass to view full event guidelines or show verification code at entry
        </Text>
      </View>

      {registrations.length === 0 ? (
        <EmptyState
          title="No Active Passes Found"
          description="You haven't reserved tickets for any events yet. Explore upcoming campus events and reserve your spot!"
          icon="ticket-outline"
          actionTitle="Browse Campus Events"
          onActionPress={() => router.push('/(student)/events')}
        />
      ) : (
        registrations.map((ticket) => {
          const startDateObj = new Date(ticket.eventStartDate || '');
          const formattedDate = !isNaN(startDateObj.getTime())
            ? startDateObj.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : ticket.eventStartDate || 'Date TBA';

          const formattedTime = !isNaN(startDateObj.getTime())
            ? startDateObj.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '';

          return (
            <TouchableOpacity
              key={ticket.id}
              activeOpacity={0.9}
              onPress={() => handleOpenDetails(ticket.eventId)}
            >
              <View style={[styles.ticketCard, Shadows.md]}>
                {/* Ticket Top Section */}
                <View style={styles.ticketTop}>
                  <View style={styles.badgeRow}>
                    <View style={styles.badgeGroup}>
                      <StatusBadge
                        label="Confirmed Pass"
                        status="success"
                        icon="checkmark-circle"
                        size="sm"
                      />
                      {ticket.eventCategory && (
                        <CategoryChip category={ticket.eventCategory} size="sm" showIcon={false} />
                      )}
                    </View>
                    <Text style={styles.ticketCode}>{ticket.ticketCode}</Text>
                  </View>

                  <Text style={styles.eventTitle}>{ticket.eventTitle}</Text>

                  {ticket.organizerName && (
                    <View style={styles.organizerRow}>
                      <Ionicons name="people-outline" size={13} color={Colors.light.textSecondary} />
                      <Text style={styles.organizerText}>Organized by {ticket.organizerName}</Text>
                    </View>
                  )}
                </View>

                {/* Perforated Divider */}
                <View style={styles.perforationContainer}>
                  <View style={styles.leftCutout} />
                  <View style={styles.dashedLine} />
                  <View style={styles.rightCutout} />
                </View>

                {/* Ticket Bottom Section */}
                <View style={styles.ticketBottom}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>DATE & TIME</Text>
                      <Text style={styles.infoValue}>
                        {formattedDate} {formattedTime ? `• ${formattedTime}` : ''}
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
                      <Text style={styles.qrText}>Digital Pass Verified</Text>
                    </View>

                    <AppButton
                      title="Cancel Pass"
                      variant="danger"
                      size="sm"
                      fullWidth={false}
                      icon="close-circle-outline"
                      isLoading={cancellingId === ticket.id}
                      onPress={() => handleCancelPass(ticket)}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
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
    lineHeight: 18,
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
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
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
    marginBottom: 4,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  organizerText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
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
    gap: Spacing.two,
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
