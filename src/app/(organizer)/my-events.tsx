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
import { AppButton, EmptyState } from '@/components/common';
import { EventCard } from '@/components/events';
import { Colors, Spacing, Typography } from '@/constants/theme';

const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'evt_1',
    title: 'HackCampus 2026: 24h Hackathon',
    description: 'State-level hackathon with mentorship and cash pool.',
    category: 'Technical',
    bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    startDate: '2026-10-15T09:00:00Z',
    endDate: '2026-10-16T09:00:00Z',
    venue: 'Main Auditorium & Lab 4',
    maxCapacity: 150,
    registeredCount: 84,
    organizerId: 'usr_organizer_01',
    organizerName: 'Tech & Cultural Council',
    status: 'published',
  },
  {
    id: 'evt_3',
    title: 'Cloud & AI Workshop with Industry Experts',
    description: 'Practical masterclass on containerization and LLM tooling.',
    category: 'Workshop',
    bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    startDate: '2026-10-28T14:00:00Z',
    endDate: '2026-10-28T17:00:00Z',
    venue: 'MCA Computer Lab 3',
    maxCapacity: 60,
    registeredCount: 45,
    organizerId: 'usr_organizer_01',
    organizerName: 'Dept of Computer Applications',
    status: 'published',
  },
  {
    id: 'evt_draft_1',
    title: 'Inter-College Gaming Championship (VALORANT & FIFA)',
    description: 'E-Sports tournament across 3 campus labs.',
    category: 'Sports',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    startDate: '2026-11-12T10:00:00Z',
    endDate: '2026-11-13T18:00:00Z',
    venue: 'Lab 1 & 2',
    maxCapacity: 120,
    registeredCount: 0,
    organizerId: 'usr_organizer_01',
    organizerName: 'Tech & Cultural Council',
    status: 'draft',
  },
];

export default function OrganizerMyEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);

  const handleDeleteEvent = (event: CampusEvent) => {
    Alert.alert(
      'Delete Campus Event',
      `Are you sure you want to permanently delete "${event.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEvents((prev) => prev.filter((e) => e.id !== event.id));
          },
        },
      ]
    );
  };

  const handleEditEvent = (event: CampusEvent) => {
    Alert.alert('Edit Event', `Opening event editor for "${event.title}".`);
  };

  const handleAttendees = (_event: CampusEvent) => {
    router.push('/(organizer)/attendees');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>Your Campus Events</Text>
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
