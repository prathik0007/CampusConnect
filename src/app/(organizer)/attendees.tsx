import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '@/context/EventContext';
import { Registration } from '@/types';
import { EmptyState, LoadingIndicator, SearchBar, StatusBadge } from '@/components/common';
import { AttendeeRow } from '@/components/organizer';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

type AttendanceFilter = 'All' | 'Present' | 'Pending';

export default function OrganizerAttendeesScreen() {
  const params = useLocalSearchParams<{ eventId?: string }>();
  const { events, getAttendeesForEvent, fetchAttendeesForEvent, markAttendance, isLoading } = useEvents();

  // Selected event (default to passed param or first event)
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Initialize selected event
  useEffect(() => {
    if (params.eventId && events.some((e) => e.id === params.eventId)) {
      setSelectedEventId(params.eventId);
    } else if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [params.eventId, events]);

  // Fetch attendees from real backend whenever selected event changes
  useEffect(() => {
    if (selectedEventId) {
      fetchAttendeesForEvent(selectedEventId);
    }
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const attendees: Registration[] = selectedEvent ? getAttendeesForEvent(selectedEvent.id) : [];

  const handleToggleAttendance = async (registrationId: string, currentlyAttended: boolean) => {
    setUpdatingId(registrationId);
    try {
      await markAttendance(registrationId, !currentlyAttended);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter attendees by search query and attendance filter
  const filteredAttendees = attendees.filter((att) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      (att.studentName && att.studentName.toLowerCase().includes(q)) ||
      (att.studentRollNumber && att.studentRollNumber.toLowerCase().includes(q)) ||
      (att.ticketCode && att.ticketCode.toLowerCase().includes(q)) ||
      (att.studentEmail && att.studentEmail.toLowerCase().includes(q));

    const matchesFilter =
      attendanceFilter === 'All'
        ? true
        : attendanceFilter === 'Present'
        ? att.status === 'attended'
        : att.status !== 'attended';

    return matchesSearch && matchesFilter;
  });

  const checkedInCount = attendees.filter((a) => a.status === 'attended').length;
  const attendanceRate =
    attendees.length > 0 ? Math.round((checkedInCount / attendees.length) * 100) : 0;

  if (isLoading) {
    return <LoadingIndicator fullScreen message="Loading attendee roster..." />;
  }

  return (
    <View style={styles.container}>
      {/* Event Selection Carousel */}
      <View style={styles.eventPickerContainer}>
        <Text style={styles.pickerLabel}>SELECT CAMPUS EVENT:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventPickerScroll}
        >
          {events.map((evt) => {
            const isSelected = selectedEventId === evt.id;
            return (
              <TouchableOpacity
                key={evt.id}
                style={[
                  styles.eventPill,
                  isSelected && styles.eventPillSelected,
                ]}
                onPress={() => {
                  setSelectedEventId(evt.id);
                  setSearchQuery('');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.eventPillText,
                    isSelected && styles.eventPillTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {evt.title}
                </Text>
                <View
                  style={[
                    styles.eventCountDot,
                    isSelected && { backgroundColor: '#FFFFFF' },
                  ]}
                >
                  <Text
                    style={[
                      styles.eventCountDotText,
                      isSelected && { color: Colors.light.secondary },
                    ]}
                  >
                    {evt.registeredCount}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Roster Overview Bar */}
      {selectedEvent && (
        <View style={styles.overviewBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedEventTitle} numberOfLines={1}>
              {selectedEvent.title}
            </Text>
            <Text style={styles.selectedEventVenue}>
              {selectedEvent.venue} • {selectedEvent.maxCapacity} Max Capacity
            </Text>
          </View>
          <StatusBadge
            label={`${checkedInCount}/${attendees.length} Checked In (${attendanceRate}%)`}
            status={attendanceRate >= 50 ? 'success' : 'warning'}
            size="md"
          />
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by student name, roll number, or pass code..."
        />
      </View>

      {/* Attendance Status Filter Tabs */}
      <View style={styles.filterTabsRow}>
        {(['All', 'Present', 'Pending'] as AttendanceFilter[]).map((tab) => {
          const isSelected = attendanceFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, isSelected && styles.filterTabSelected]}
              onPress={() => setAttendanceFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, isSelected && styles.filterTabTextSelected]}>
                {tab === 'All'
                  ? `All (${attendees.length})`
                  : tab === 'Present'
                  ? `Present (${checkedInCount})`
                  : `Pending (${attendees.length - checkedInCount})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Attendees List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {attendees.length === 0 ? (
          <EmptyState
            title="No Students Registered Yet"
            description={`No registrations have been received yet for "${selectedEvent?.title}". Once students reserve passes, they will appear here.`}
            icon="people-outline"
          />
        ) : filteredAttendees.length === 0 ? (
          <EmptyState
            title="No Matching Attendees"
            description="No students match your search criteria or attendance filter."
            actionTitle="Reset Search"
            onActionPress={() => {
              setSearchQuery('');
              setAttendanceFilter('All');
            }}
          />
        ) : (
          filteredAttendees.map((student) => (
            <AttendeeRow
              key={student.id}
              attendee={student}
              isLoading={updatingId === student.id}
              onToggleAttendance={handleToggleAttendance}
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
  eventPickerContainer: {
    backgroundColor: Colors.light.card,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  pickerLabel: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.textTertiary,
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.one,
  },
  eventPickerScroll: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingVertical: 7,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
    maxWidth: 240,
    gap: Spacing.one,
  },
  eventPillSelected: {
    backgroundColor: Colors.light.secondary,
    borderColor: Colors.light.secondary,
  },
  eventPillText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.light.textSecondary,
    flexShrink: 1,
  },
  eventPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: Typography.weight.bold,
  },
  eventCountDot: {
    backgroundColor: '#CBD5E1',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  eventCountDotText: {
    fontSize: Typography.size.xs - 2,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.text,
  },
  overviewBar: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    gap: Spacing.two,
  },
  selectedEventTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  selectedEventVenue: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    backgroundColor: Colors.light.background,
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterTabSelected: {
    backgroundColor: Colors.light.card,
    borderColor: Colors.light.secondary,
  },
  filterTabText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.light.textSecondary,
  },
  filterTabTextSelected: {
    color: Colors.light.secondary,
    fontWeight: Typography.weight.bold,
  },
  listContent: {
    padding: Spacing.three,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.six,
  },
});
