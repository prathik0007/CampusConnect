import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CampusEvent } from '@/types';

const MOCK_EVENTS: CampusEvent[] = [
  {
    id: 'evt_1',
    title: 'HackCampus 2026: 24h Hackathon',
    description: 'Build real-world software solutions with team mentorship and win cash prizes.',
    category: 'Technical',
    startDate: '2026-10-15T09:00:00Z',
    endDate: '2026-10-16T09:00:00Z',
    venue: 'Campus Main Auditorium',
    maxCapacity: 150,
    registeredCount: 84,
    organizerId: 'usr_org_1',
    organizerName: 'Coding & Robotics Club',
    status: 'published',
  },
  {
    id: 'evt_2',
    title: 'Verve 2026: Inter-College Cultural Fest',
    description: 'Music, dance, street play, and fine arts competitions with celebrity performances.',
    category: 'Cultural',
    startDate: '2026-10-22T10:00:00Z',
    endDate: '2026-10-23T20:00:00Z',
    venue: 'Open Air Amphitheatre',
    maxCapacity: 500,
    registeredCount: 320,
    organizerId: 'usr_org_2',
    organizerName: 'Student Cultural Committee',
    status: 'published',
  },
  {
    id: 'evt_3',
    title: 'Cloud & AI Workshop with Industry Experts',
    description: 'Hands-on masterclass on building LLM agents and containerized microservices.',
    category: 'Workshop',
    startDate: '2026-10-28T14:00:00Z',
    endDate: '2026-10-28T17:00:00Z',
    venue: 'MCA Computer Lab 3',
    maxCapacity: 60,
    registeredCount: 45,
    organizerId: 'usr_org_1',
    organizerName: 'Dept of Computer Applications',
    status: 'published',
  },
  {
    id: 'evt_4',
    title: 'Inter-Department Badminton Tournament',
    description: 'Singles and doubles knockout tournament for boys and girls.',
    category: 'Sports',
    startDate: '2026-11-04T08:30:00Z',
    endDate: '2026-11-05T18:00:00Z',
    venue: 'Indoor Sports Complex Court 1 & 2',
    maxCapacity: 64,
    registeredCount: 52,
    organizerId: 'usr_org_3',
    organizerName: 'Sports Department',
    status: 'published',
  },
];

const FILTER_TABS = ['All', 'Technical', 'Cultural', 'Workshop', 'Sports'];

export default function StudentEventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [registeredEvents, setRegisteredEvents] = useState<string[]>(['evt_1']);

  const filteredEvents = MOCK_EVENTS.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || evt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleRegistration = (eventId: string) => {
    if (registeredEvents.includes(eventId)) {
      setRegisteredEvents(registeredEvents.filter((id) => id !== eventId));
    } else {
      setRegisteredEvents([...registeredEvents, eventId]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, venues, clubs..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterChip,
                selectedCategory === tab && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(tab)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === tab && styles.filterChipTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <ScrollView contentContainerStyle={styles.eventList}>
        <Text style={styles.resultCount}>
          Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
        </Text>

        {filteredEvents.map((evt) => {
          const isRegistered = registeredEvents.includes(evt.id);
          return (
            <View key={evt.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{evt.category}</Text>
                </View>
                <Text style={styles.capacityText}>
                  {evt.registeredCount}/{evt.maxCapacity} spots filled
                </Text>
              </View>

              <Text style={styles.eventTitle}>{evt.title}</Text>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {evt.description}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Ionicons name="calendar-outline" size={15} color="#4B5563" />
                  <Text style={styles.metaText}>
                    {new Date(evt.startDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Ionicons name="location-outline" size={15} color="#4B5563" />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {evt.venue}
                  </Text>
                </View>
              </View>

              <View style={styles.organizerRow}>
                <Ionicons name="people-outline" size={14} color="#6B7280" />
                <Text style={styles.organizerText}>Organized by {evt.organizerName}</Text>
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    isRegistered ? styles.cancelButton : styles.registerButton,
                  ]}
                  onPress={() => toggleRegistration(evt.id)}
                >
                  <Ionicons
                    name={isRegistered ? 'checkmark-circle' : 'ticket-outline'}
                    size={16}
                    color={isRegistered ? '#059669' : '#FFFFFF'}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      isRegistered ? styles.cancelButtonText : styles.registerButtonText,
                    ]}
                  >
                    {isRegistered ? 'Registered (Tap to Cancel)' : 'Register for Event'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  filterWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  eventList: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  resultCount: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  capacityText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  eventDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    gap: 6,
    marginBottom: 8,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  organizerText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  actionButton: {
    height: 42,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  registerButton: {
    backgroundColor: '#2563EB',
  },
  cancelButton: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  registerButtonText: {
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#059669',
  },
});
