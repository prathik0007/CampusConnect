import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CampusEvent } from '@/types';

const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'evt_1',
    title: 'HackCampus 2026: 24h Hackathon',
    description: 'State-level hackathon with mentorship and cash pool.',
    category: 'Technical',
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

  const handleDeleteEvent = (id: string, title: string) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to permanently delete "${title}"? This will cancel all student registrations.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEvents((prev) => prev.filter((e) => e.id !== id));
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Your Campus Events</Text>
          <Text style={styles.subtitle}>Manage, edit, or check registrations</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/(organizer)/create-event')}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.createBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {events.map((evt) => (
        <View key={evt.id} style={styles.eventCard}>
          <View style={styles.cardTop}>
            <View
              style={[
                styles.statusBadge,
                evt.status === 'published' ? styles.statusPublished : styles.statusDraft,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  evt.status === 'published' ? styles.textGreen : styles.textAmber,
                ]}
              >
                {evt.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.capacityBadge}>
              {evt.registeredCount}/{evt.maxCapacity} Registered
            </Text>
          </View>

          <Text style={styles.eventTitle}>{evt.title}</Text>
          <Text style={styles.eventDesc} numberOfLines={2}>
            {evt.description}
          </Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.metaText}>
                {new Date(evt.startDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color="#64748B" />
              <Text style={styles.metaText}>{evt.venue}</Text>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(organizer)/attendees')}
            >
              <Ionicons name="people-outline" size={16} color="#2563EB" />
              <Text style={[styles.actionBtnText, { color: '#2563EB' }]}>Attendees</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Edit Event', 'Event editor modal opens in Phase 4.')}
            >
              <Ionicons name="create-outline" size={16} color="#059669" />
              <Text style={[styles.actionBtnText, { color: '#059669' }]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteBtn]}
              onPress={() => handleDeleteEvent(evt.id, evt.title)}
            >
              <Ionicons name="trash-outline" size={16} color="#DC2626" />
              <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 4,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventCard: {
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPublished: {
    backgroundColor: '#ECFDF5',
  },
  statusDraft: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textGreen: {
    color: '#059669',
  },
  textAmber: {
    color: '#D97706',
  },
  capacityBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  eventDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  metaInfo: {
    gap: 6,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
