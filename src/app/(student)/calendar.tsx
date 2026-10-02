import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '@/context/EventContext';
import { CampusEvent } from '@/types';
import { AppButton, EmptyState } from '@/components/common';
import { CategoryChip } from '@/components/events';
import { BorderRadius, CategoryTheme, Colors, Shadows, Spacing, Typography } from '@/constants/theme';

export default function StudentCalendarScreen() {
  const router = useRouter();
  const { events } = useEvents();

  // Selected Month: 9 for October (0-indexed), 10 for November 2026
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // October
  const [selectedYear] = useState<number>(2026);
  const [selectedDay, setSelectedDay] = useState<number>(15);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Map of days in the selected month that have events
  const daysWithEvents = useMemo(() => {
    const map = new Map<number, CampusEvent[]>();
    events.forEach((evt) => {
      const d = new Date(evt.startDate);
      if (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) {
        const dayNum = d.getDate();
        const existing = map.get(dayNum) || [];
        existing.push(evt);
        map.set(dayNum, existing);
      }
    });
    return map;
  }, [events, selectedMonth, selectedYear]);

  // Generate calendar days for the horizontal strip (1 to daysInMonth)
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Events on the currently selected day
  const eventsForSelectedDay = daysWithEvents.get(selectedDay) || [];

  const handleOpenEvent = (event: CampusEvent) => {
    router.push(`/event/${event.id}` as any);
  };

  const handlePrevMonth = () => {
    if (selectedMonth > 0) {
      setSelectedMonth(selectedMonth - 1);
      setSelectedDay(1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth < 11) {
      setSelectedMonth(selectedMonth + 1);
      setSelectedDay(1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Month Navigator Header */}
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={styles.navArrow}
            onPress={handlePrevMonth}
            disabled={selectedMonth <= 8} // limit to Fall 2026 semester
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={selectedMonth <= 8 ? Colors.light.textTertiary : Colors.light.text}
            />
          </TouchableOpacity>

          <View style={styles.monthDisplay}>
            <Text style={styles.monthTitle}>
              {monthNames[selectedMonth]} {selectedYear}
            </Text>
            <Text style={styles.semesterSubtitle}>Fall Semester 2026</Text>
          </View>

          <TouchableOpacity
            style={styles.navArrow}
            onPress={handleNextMonth}
            disabled={selectedMonth >= 11}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={selectedMonth >= 11 ? Colors.light.textTertiary : Colors.light.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.eventsTallyPill}>
          <Ionicons name="calendar-outline" size={13} color={Colors.light.primary} />
          <Text style={styles.tallyText}>
            {daysWithEvents.size} event {daysWithEvents.size === 1 ? 'date' : 'dates'}
          </Text>
        </View>
      </View>

      {/* Date Selector Carousel */}
      <View style={styles.carouselWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselScroll}
        >
          {daysArray.map((dayNum) => {
            const dateObj = new Date(selectedYear, selectedMonth, dayNum);
            const weekday = dateObj.toLocaleDateString(undefined, { weekday: 'narrow' });
            const isSelected = selectedDay === dayNum;
            const hasEvents = daysWithEvents.has(dayNum);

            return (
              <TouchableOpacity
                key={dayNum}
                style={[
                  styles.dayCard,
                  isSelected && styles.dayCardSelected,
                  hasEvents && !isSelected && styles.dayCardHasEvents,
                ]}
                onPress={() => setSelectedDay(dayNum)}
                activeOpacity={0.8}
              >
                <Text style={[styles.weekdayText, isSelected && styles.textWhite]}>
                  {weekday}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.textWhite]}>
                  {dayNum}
                </Text>
                {hasEvents && (
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

      {/* Daily Agenda List */}
      <ScrollView contentContainerStyle={styles.agendaContent}>
        <View style={styles.agendaHeader}>
          <Text style={styles.agendaDateTitle}>
            {monthNames[selectedMonth]} {selectedDay}, {selectedYear}
          </Text>
          <Text style={styles.agendaEventCount}>
            {eventsForSelectedDay.length} {eventsForSelectedDay.length === 1 ? 'event' : 'events'} scheduled
          </Text>
        </View>

        {eventsForSelectedDay.length === 0 ? (
          <EmptyState
            title="No Events On This Date"
            description="There are no campus activities scheduled on this day. Tap another date marked with a blue indicator dot."
            icon="calendar-clear-outline"
            actionTitle="View All Events"
            onActionPress={() => router.push('/(student)/events')}
          />
        ) : (
          eventsForSelectedDay.map((evt) => {
            const startDate = new Date(evt.startDate);
            const endDate = new Date(evt.endDate);
            const timeStr = `${startDate.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })} - ${endDate.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}`;

            return (
              <TouchableOpacity
                key={evt.id}
                style={[styles.eventAgendaCard, Shadows.sm]}
                onPress={() => handleOpenEvent(evt)}
                activeOpacity={0.85}
              >
                {/* Left Time Column */}
                <View style={styles.timeBadgeColumn}>
                  <Ionicons name="time" size={14} color={Colors.light.primary} />
                  <Text style={styles.agendaTimeText}>{timeStr}</Text>
                </View>

                {/* Event Information */}
                <View style={styles.eventInfoSection}>
                  <View style={styles.chipRow}>
                    <CategoryChip category={evt.category} size="sm" />
                    <Text style={styles.seatsLeftText}>
                      {Math.max(0, evt.maxCapacity - evt.registeredCount)} spots left
                    </Text>
                  </View>

                  <Text style={styles.agendaEventTitle}>{evt.title}</Text>

                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.light.textSecondary} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {evt.venue}
                    </Text>
                  </View>

                  <View style={styles.organizerRow}>
                    <Ionicons name="people-outline" size={13} color={Colors.light.textTertiary} />
                    <Text style={styles.organizerText}>{evt.organizerName}</Text>
                  </View>
                </View>

                {/* Arrow */}
                <View style={styles.arrowCol}>
                  <Ionicons name="chevron-forward" size={18} color={Colors.light.textTertiary} />
                </View>
              </TouchableOpacity>
            );
          })
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    backgroundColor: Colors.light.card,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.backgroundElement,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthDisplay: {
    alignItems: 'flex-start',
  },
  monthTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.text,
  },
  semesterSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
  },
  eventsTallyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  tallyText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.light.primary,
  },
  carouselWrapper: {
    backgroundColor: Colors.light.card,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  carouselScroll: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
  dayCard: {
    width: 52,
    height: 70,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayCardSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  dayCardHasEvents: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F0F7FF',
  },
  weekdayText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    color: Colors.light.textSecondary,
  },
  dayNumber: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.text,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  eventDotInactive: {
    backgroundColor: Colors.light.primary,
  },
  eventDotActive: {
    backgroundColor: '#FFFFFF',
  },
  agendaContent: {
    padding: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  agendaHeader: {
    marginBottom: Spacing.one,
  },
  agendaDateTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.text,
  },
  agendaEventCount: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  eventAgendaCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  timeBadgeColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    minWidth: 80,
    gap: 4,
  },
  agendaTimeText: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.bold,
    color: Colors.light.primary,
    textAlign: 'center',
    lineHeight: 14,
  },
  eventInfoSection: {
    flex: 1,
    gap: 3,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  seatsLeftText: {
    fontSize: Typography.size.xs - 1,
    color: Colors.light.secondary,
    fontWeight: Typography.weight.semibold,
  },
  agendaEventTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  organizerText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textTertiary,
    fontStyle: 'italic',
  },
  arrowCol: {
    paddingLeft: Spacing.one,
  },
});
