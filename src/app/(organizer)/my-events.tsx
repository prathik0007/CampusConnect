import React from 'react';
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
import { AppButton, EmptyState } from '@/components/common';
import { EventCard } from '@/components/events';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function OrganizerMyEventsScreen() {
  const router = useRouter();
  const { events } = useEvents();

  const handleDeleteEvent = (event: CampusEvent) => {
    Alert.alert(
      'Delete Campus Event',
      `Are you sure you want to delete "${event.title}"? (Phase 4 will enable permanent organizer deletion).`,
      [{ text: 'OK' }]
    );
  };

  const handleEditEvent = (event: CampusEvent) => {
    Alert.alert('Edit Event', `Opening event editor for "${event.title}" in Phase 4.`);
  };

  const handleAttendees = (_event: CampusEvent) => {
    router.push('/(organizer)/attendees');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>Campus Events Roster</Text>
          <Text style={styles.subtitle}>
            Manage, publish, or view registrations for your events
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

      {events.length === 0 ? (
        <EmptyState
          title="No Events Found"
          description="You have not created any events yet. Publish your first event to reach students."
          actionTitle="Create First Event"
          icon="calendar-outline"
          onActionPress={() => router.push('/(organizer)/create-event')}
        />
      ) : (
        events.map((evt) => (
          <EventCard
            key={evt.id}
            event={evt}
            isOrganizerView={true}
            onAttendeesPress={handleAttendees}
            onEditPress={handleEditEvent}
            onDeletePress={handleDeleteEvent}
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
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});
