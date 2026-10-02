import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DayEvent {
  id: string;
  day: number;
  weekday: string;
  hasEvents: boolean;
}

const DAYS_OCTOBER: DayEvent[] = [
  { id: '1', day: 12, weekday: 'Mon', hasEvents: false },
  { id: '2', day: 13, weekday: 'Tue', hasEvents: false },
  { id: '3', day: 14, weekday: 'Wed', hasEvents: true },
  { id: '4', day: 15, weekday: 'Thu', hasEvents: true },
  { id: '5', day: 16, weekday: 'Fri', hasEvents: true },
  { id: '6', day: 17, weekday: 'Sat', hasEvents: false },
  { id: '7', day: 18, weekday: 'Sun', hasEvents: false },
  { id: '8', day: 22, weekday: 'Thu', hasEvents: true },
  { id: '9', day: 28, weekday: 'Wed', hasEvents: true },
];

const SCHEDULE_ITEMS = [
  {
    id: 's1',
    day: 15,
    time: '09:00 AM - 11:30 AM',
    title: 'HackCampus 2026: Opening Ceremony & Problem Release',
    venue: 'Main Auditorium',
    type: 'Keynote & Launch',
    category: 'Technical',
  },
  {
    id: 's2',
    day: 15,
    time: '01:30 PM - 03:00 PM',
    title: 'Round 1 Code Evaluation & Mentorship Clinic',
    venue: 'MCA Lab 4',
    type: 'Hackathon Round',
    category: 'Technical',
  },
  {
    id: 's3',
    day: 16,
    time: '10:00 AM - 01:00 PM',
    title: 'Final Project Demonstrations & Jury Pitching',
    venue: 'Seminar Hall B',
    type: 'Evaluation',
    category: 'Technical',
  },
  {
    id: 's4',
    day: 22,
    time: '10:00 AM - 08:00 PM',
    title: 'Verve Cultural Fest: Day 1 Music & Drama Finals',
    venue: 'Amphitheatre',
    type: 'Cultural Festival',
    category: 'Cultural',
  },
];

export default function StudentCalendarScreen() {
  const [selectedDay, setSelectedDay] = useState(15);

  const selectedEvents = SCHEDULE_ITEMS.filter((item) => item.day === selectedDay);

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.monthTitle}>October 2026</Text>
          <Text style={styles.monthSubtitle}>Campus Academic & Event Calendar</Text>
        </View>
        <View style={styles.monthBadge}>
          <Ionicons name="calendar" size={16} color="#2563EB" />
          <Text style={styles.monthBadgeText}>Semester 3</Text>
        </View>
      </View>

      {/* Date Carousel */}
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselScroll}
        >
          {DAYS_OCTOBER.map((d) => {
            const isSelected = selectedDay === d.day;
            return (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.dayCard,
                  isSelected && styles.dayCardSelected,
                ]}
                onPress={() => setSelectedDay(d.day)}
              >
                <Text style={[styles.weekdayText, isSelected && styles.textWhite]}>
                  {d.weekday}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.textWhite]}>
                  {d.day}
                </Text>
                {d.hasEvents && (
                  <View
                    style={[
                      styles.eventDot,
                      isSelected ? styles.eventDotActive : styles.eventDotInactive,
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Daily Agenda */}
      <ScrollView contentContainerStyle={styles.agendaContent}>
        <View style={styles.agendaHeader}>
          <Text style={styles.agendaTitle}>Schedule for October {selectedDay}</Text>
          <Text style={styles.agendaCount}>{selectedEvents.length} events scheduled</Text>
        </View>

        {selectedEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No events scheduled on this day</Text>
            <Text style={styles.emptySubtitle}>Select another date with event dots to view events</Text>
          </View>
        ) : (
          selectedEvents.map((evt) => (
            <View key={evt.id} style={styles.eventItem}>
              <View style={styles.timeColumn}>
                <Ionicons name="time-outline" size={14} color="#2563EB" />
                <Text style={styles.timeText}>{evt.time}</Text>
              </View>

              <View style={styles.eventDetailsCard}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{evt.category}</Text>
                </View>
                <Text style={styles.eventItemTitle}>{evt.title}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.venueText}>{evt.venue}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  monthSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  monthBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  carouselContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  carouselScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  dayCard: {
    width: 58,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayCardSelected: {
    backgroundColor: '#2563EB',
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
  },
  eventDotInactive: {
    backgroundColor: '#2563EB',
  },
  eventDotActive: {
    backgroundColor: '#FFFFFF',
  },
  agendaContent: {
    padding: 20,
    gap: 14,
  },
  agendaHeader: {
    marginBottom: 4,
  },
  agendaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  agendaCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  eventItem: {
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
  timeColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  eventDetailsCard: {
    gap: 4,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  eventItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  venueText: {
    fontSize: 12,
    color: '#64748B',
  },
});
