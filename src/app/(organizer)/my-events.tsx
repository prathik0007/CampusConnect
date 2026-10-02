import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CampusEvent } from '@/types';
import { useEvents } from '@/context/EventContext';
import { AppButton, EmptyState, LoadingIndicator } from '@/components/common';
import { EventCard } from '@/components/events';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function OrganizerMyEventsScreen() {
  const router = useRouter();
  const { events, cancelOrDeleteEvent, isLoading } = useEvents();

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleNavigateToDetails = (event: CampusEvent) => {
    router.push(`/event/${event.id}` as any);
  };

  const handleEditEvent = (event: CampusEvent) => {
    router.push(`/event-edit/${event.id}` as any);
  };

  const handleViewAttendees = (event: CampusEvent) => {
    router.push({
      pathname: '/(organizer)/attendees',
      params: { eventId: event.id },
    });
  };

  const handleDeleteOrCancel = (event: CampusEvent) => {
    const hasRegistrations = event.registeredCount > 0;
    const isAlreadyCancelled = event.status === 'cancelled';

    if (isAlreadyCancelled) {
      Alert.alert('Notice', 'This event is already marked as cancelled.');
      return;
    }

    const title = hasRegistrations ? 'Cancel Campus Event' : 'Delete Event';
    const message = hasRegistrations
      ? `"${event.title}" already has ${event.registeredCount} registered students. To protect student records, the event will be marked as "Cancelled" and no further registrations will be accepted.`
      : `Are you sure you want to permanently delete draft event "${event.title}"?`;

    Alert.alert(title, message, [
      { text: 'Keep Event', style: 'cancel' },
      {
        text: hasRegistrations ? 'Yes, Cancel Event' : 'Delete Permanently',
        style: 'destructive',
        onPress: async () => {
          setActionLoadingId(event.id);
          try {
            const res = await cancelOrDeleteEvent(event.id);
            if (res.success) {
              const feedbackMsg =
                res.action === 'cancelled'
                  ? `"${event.title}" has been marked as Cancelled.`
                  : `"${event.title}" was deleted.`;
              Alert.alert('Event Updated', feedbackMsg);
            } else {
              Alert.alert('Error', res.error || 'Failed to update event.');
            }
          } finally {
            setActionLoadingId(null);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return <LoadingIndicator fullScreen message="Loading event portfolio..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>Campus Event Portfolio</Text>
          <Text style={styles.subtitle}>
            Publish, edit, view rosters, or manage event cancellations
          </Text>
        </View>
        <AppButton
          title="New Event"
          variant="secondary"
          size="sm"
          icon="add-circle"
          fullWidth={false}
          onPress={() => router.push('/(organizer)/create-event')}
        />
      </View>

      {/* Events List */}
      {events.length === 0 ? (
        <EmptyState
          title="No Campus Events Found"
          description="You have not published any events yet. Create your first event to start accepting student registrations."
          actionTitle="Create Your First Event"
          icon="calendar-outline"
          onActionPress={() => router.push('/(organizer)/create-event')}
        />
      ) : (
        events.map((evt) => (
          <EventCard
            key={evt.id}
            event={evt}
            isOrganizerView={true}
            actionLoading={actionLoadingId === evt.id}
            onPress={handleNavigateToDetails}
            onAttendeesPress={handleViewAttendees}
            onEditPress={handleEditEvent}
            onDeletePress={handleDeleteOrCancel}
          />
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  titleColumn: {
    flex: 1,
    marginRight: Spacing.two,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
