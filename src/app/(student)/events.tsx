import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CampusEvent, EventCategory } from '@/types';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { SearchBar, EmptyState, LoadingIndicator } from '@/components/common';
import { CategoryChip, EventCard } from '@/components/events';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

const ALL_FILTER_CATEGORIES: (EventCategory | 'All')[] = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
  'Other',
];

export default function StudentEventsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { user } = useAuth();
  const {
    events,
    isLoading,
    refreshEvents,
    isRegistered,
    registerForEvent,
    cancelRegistration,
  } = useEvents();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const currentStudentId = user?.id || 'usr_student_01';

  // Handle incoming category param from Home Screen shortcuts
  useEffect(() => {
    if (params.category && ALL_FILTER_CATEGORIES.includes(params.category as any)) {
      setSelectedCategory(params.category as EventCategory);
    }
  }, [params.category]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshEvents();
    setRefreshing(false);
  };

  // Filter events by Search Query (Title, Venue, Organizer) and Category
  const filteredEvents = events.filter((evt) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      evt.title.toLowerCase().includes(q) ||
      evt.venue.toLowerCase().includes(q) ||
      evt.organizerName.toLowerCase().includes(q) ||
      evt.description.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === 'All' || evt.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Navigate to Event Details
  const handleCardPress = (event: CampusEvent) => {
    router.push(`/event/${event.id}` as any);
  };

  // Direct Register/Cancel on Card
  const handleRegisterToggle = async (event: CampusEvent) => {
    const registered = isRegistered(event.id, currentStudentId);

    if (registered) {
      Alert.alert(
        'Cancel Registration',
        `Do you want to release your reserved pass for "${event.title}"?`,
        [
          { text: 'Keep Ticket', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              setActionLoadingId(event.id);
              try {
                await cancelRegistration(event.id, currentStudentId);
              } finally {
                setActionLoadingId(null);
              }
            },
          },
        ]
      );
    } else {
      if (event.registeredCount >= event.maxCapacity) {
        Alert.alert('Capacity Full', 'This event has no remaining seats.');
        return;
      }

      setActionLoadingId(event.id);
      try {
        const studentInfo = {
          id: currentStudentId,
          name: user?.name || 'Prathik Kumar',
          rollNumber: user?.rollNumber || 'MCA2024042',
          department: user?.department || 'MCA',
        };

        const result = await registerForEvent(event.id, studentInfo);
        if (result.success) {
          Alert.alert(
            'Success! 🎉',
            `Pass confirmed for "${event.title}".\n\nTicket Code: ${result.ticketCode}`
          );
        } else {
          Alert.alert('Registration Notice', result.error || 'Unable to register.');
        }
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All';

  if (isLoading && !refreshing) {
    return <LoadingIndicator fullScreen message="Loading events catalog..." />;
  }

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title, venue, or club organizer..."
        />
      </View>

      {/* Category Filter Chips Bar */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {ALL_FILTER_CATEGORIES.map((cat) => (
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

      {/* Events List View */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        }
      >
        <View style={styles.countRow}>
          <Text style={styles.resultCount}>
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </Text>

          {hasActiveFilters && (
            <TouchableOpacity onPress={handleResetFilters} style={styles.resetBtn}>
              <Text style={styles.resetText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No Events Found"
            description={
              hasActiveFilters
                ? 'No campus events match your search query or selected category filter.'
                : 'There are currently no upcoming events published.'
            }
            actionTitle={hasActiveFilters ? 'Clear All Filters' : undefined}
            onActionPress={hasActiveFilters ? handleResetFilters : undefined}
          />
        ) : (
          filteredEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              isRegistered={isRegistered(evt.id, currentStudentId)}
              onPress={handleCardPress}
              onRegisterPress={handleRegisterToggle}
              actionLoading={actionLoadingId === evt.id}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  resultCount: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.weight.semibold,
  },
  resetBtn: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.two,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.backgroundElement,
  },
  resetText: {
    fontSize: Typography.size.xs,
    color: Colors.light.primary,
    fontWeight: Typography.weight.bold,
  },
});
