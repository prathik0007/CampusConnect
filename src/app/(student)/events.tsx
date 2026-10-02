import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CampusEvent, EventCategory } from '@/types';
import { SearchBar, EmptyState } from '@/components/common';
import { CategoryChip, EventCard } from '@/components/events';
import { Colors, Spacing, Typography } from '@/constants/theme';

const MOCK_EVENTS: CampusEvent[] = [
  {
    id: 'evt_1',
    title: 'HackCampus 2026: 24h Hackathon',
    description: 'Build real-world software solutions with team mentorship and win cash prizes.',
    category: 'Technical',
    bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
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
    bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
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
    bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
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
    bannerUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
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

const FILTER_CATEGORIES: (EventCategory | 'All')[] = [
  'All',
  'Technical',
  'Cultural',
  'Workshop',
  'Sports',
  'Seminar',
];

export default function StudentEventsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');
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

  const handleRegisterToggle = (event: CampusEvent) => {
    if (registeredEvents.includes(event.id)) {
      setRegisteredEvents((prev) => prev.filter((id) => id !== event.id));
    } else {
      setRegisteredEvents((prev) => [...prev, event.id]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchHeader}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search events, venues, organizers..."
        />
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              category={cat}
              isSelected={selectedCategory === cat}
              onPress={(selected) => setSelectedCategory(selected)}
              size="sm"
            />
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.countRow}>
          <Text style={styles.resultCount}>
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </Text>
        </View>

        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No Matching Events Found"
            description="Try changing your search terms or selecting a different category."
            actionTitle="Reset Filters"
            onActionPress={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          />
        ) : (
          filteredEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              isRegistered={registeredEvents.includes(evt.id)}
              onRegisterPress={handleRegisterToggle}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  searchHeader: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  filterSection: {
    backgroundColor: Colors.light.card,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterScroll: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
  listContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.seven,
  },
  countRow: {
    marginBottom: Spacing.two,
  },
  resultCount: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.weight.semibold,
  },
});
