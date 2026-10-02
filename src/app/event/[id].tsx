import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { AppButton, EmptyState, StatusBadge } from '@/components/common';
import { CategoryChip, EventStatusBadge } from '@/components/events';
import { BorderRadius, CategoryTheme, Colors, Shadows, Spacing, Typography } from '@/constants/theme';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getEventById, isRegistered, getRegistration, registerForEvent, cancelRegistration } =
    useEvents();

  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load event by dynamic route parameter
  const event = id ? getEventById(id) : undefined;
  const currentStudentId = user?.id || 'usr_student_01';
  const registered = id ? isRegistered(id, currentStudentId) : false;
  const existingRegistration = id ? getRegistration(id, currentStudentId) : undefined;

  // Handle invalid event ID gracefully
  if (!event) {
    return (
      <View style={styles.notFoundContainer}>
        <EmptyState
          icon="alert-circle-outline"
          title="Event Not Found"
          description="The campus event you are trying to view does not exist or has been removed."
          actionTitle="Back to Events"
          onActionPress={() => router.replace('/(student)/events')}
        />
      </View>
    );
  }

  // Derived date/time strings
  const startDateObj = new Date(event.startDate);
  const endDateObj = new Date(event.endDate);

  const formattedDate = !isNaN(startDateObj.getTime())
    ? startDateObj.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : event.startDate;

  const startTimeStr = !isNaN(startDateObj.getTime())
    ? startDateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';

  const endTimeStr = !isNaN(endDateObj.getTime())
    ? endDateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';

  const availableSeats = Math.max(0, event.maxCapacity - event.registeredCount);
  const isFull = availableSeats === 0;
  const capacityPercent = Math.min(
    100,
    Math.round((event.registeredCount / event.maxCapacity) * 100)
  );

  const categoryConfig = CategoryTheme[event.category] ?? CategoryTheme.Other;
  const bannerUri =
    event.bannerUrl ||
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80';

  // Handle Share Event
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out "${event.title}" on CampusConnect! Happening at ${event.venue} on ${formattedDate}.`,
        title: event.title,
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  // Handle Event Registration
  const handleRegister = async () => {
    if (isFull) {
      Alert.alert('Capacity Full', 'This event has reached full capacity.');
      return;
    }

    setIsActionLoading(true);
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
          'Registration Confirmed! 🎉',
          `You have reserved a pass for "${event.title}".\n\nYour Ticket Code is ${result.ticketCode}.\n\nYou can access your pass anytime from My Tickets.`,
          [
            { text: 'Stay Here', style: 'cancel' },
            {
              text: 'View My Ticket',
              onPress: () => router.push('/(student)/my-tickets'),
            },
          ]
        );
      } else {
        Alert.alert('Registration Notice', result.error || 'Failed to complete registration.');
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Event Cancellation
  const handleCancel = () => {
    Alert.alert(
      'Cancel Event Registration',
      `Are you sure you want to cancel your registration for "${event.title}"? Your seat will be released for other students.`,
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Yes, Cancel Registration',
          style: 'destructive',
          onPress: async () => {
            setIsActionLoading(true);
            try {
              const res = await cancelRegistration(event.id, currentStudentId);
              if (res.success) {
                Alert.alert(
                  'Registration Cancelled',
                  'Your registration has been cancelled and your pass is no longer valid.'
                );
              } else {
                Alert.alert('Error', res.error || 'Failed to cancel registration.');
              }
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Hero Banner with Overlay */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: bannerUri }} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroGradient} />

          {/* Top Bar (Back & Share) */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Floating Category and Status Badges */}
          <View style={styles.heroBadgeRow}>
            <CategoryChip category={event.category} size="md" />
            <EventStatusBadge status={event.status} size="md" />
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Active Pass Banner if Registered */}
          {registered && (
            <View style={styles.registeredBanner}>
              <View style={styles.registeredIconCircle}>
                <Ionicons name="checkmark-circle" size={24} color="#059669" />
              </View>
              <View style={styles.registeredBannerContent}>
                <Text style={styles.registeredBannerTitle}>You Are Registered!</Text>
                <Text style={styles.registeredBannerSubtitle}>
                  Pass Code: {existingRegistration?.ticketCode || 'CC-VERIFIED'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(student)/my-tickets')}
                style={styles.viewPassBtn}
              >
                <Text style={styles.viewPassText}>View Pass</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Event Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Organizer Attribution Card */}
          <View style={styles.organizerCard}>
            <View style={styles.organizerAvatar}>
              <Ionicons name="school" size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.organizerTextCol}>
              <Text style={styles.organizerSub}>Organized by</Text>
              <Text style={styles.organizerName}>{event.organizerName}</Text>
              {event.organizerContact && (
                <Text style={styles.organizerContact}>{event.organizerContact}</Text>
              )}
            </View>
          </View>

          {/* Key Schedule & Venue Grid */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="calendar-outline" size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>DATE</Text>
                <Text style={styles.infoMainText}>{formattedDate}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="time-outline" size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>TIME</Text>
                <Text style={styles.infoMainText}>
                  {startTimeStr} {endTimeStr ? `– ${endTimeStr}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="location-outline" size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>VENUE</Text>
                <Text style={styles.infoMainText}>{event.venue}</Text>
              </View>
            </View>
          </View>

          {/* Capacity & Attendance Tracker */}
          <View style={styles.capacitySection}>
            <View style={styles.capacityHeader}>
              <View style={styles.capacityTitleRow}>
                <Ionicons name="people-outline" size={18} color={Colors.light.text} />
                <Text style={styles.capacityTitle}>Seat Capacity & Availability</Text>
              </View>
              <Text
                style={[
                  styles.capacityRemaining,
                  isFull && { color: Colors.light.error, fontWeight: Typography.weight.bold },
                ]}
              >
                {isFull ? 'Sold Out' : `${availableSeats} seats remaining`}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${capacityPercent}%`,
                    backgroundColor: isFull
                      ? Colors.light.error
                      : capacityPercent > 80
                      ? Colors.light.warning
                      : Colors.light.secondary,
                  },
                ]}
              />
            </View>

            <View style={styles.capacityStats}>
              <Text style={styles.capacityStatText}>
                {event.registeredCount} Students Registered
              </Text>
              <Text style={styles.capacityStatText}>Max Capacity: {event.maxCapacity}</Text>
            </View>
          </View>

          {/* Event Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, Shadows.lg]}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomPriceLabel}>REGISTRATION</Text>
          <Text style={styles.bottomPriceVal}>Free for Students</Text>
        </View>

        <View style={styles.bottomActionWrapper}>
          {registered ? (
            <AppButton
              title="Cancel Registration"
              variant="danger"
              size="md"
              icon="close-circle-outline"
              isLoading={isActionLoading}
              onPress={handleCancel}
            />
          ) : (
            <AppButton
              title={isFull ? 'Registration Full' : 'Register for Event'}
              variant="primary"
              size="md"
              icon={isFull ? 'alert-circle-outline' : 'ticket-outline'}
              disabled={isFull}
              isLoading={isActionLoading}
              onPress={handleRegister}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroContainer: {
    width: '100%',
    height: 270,
    position: 'relative',
    backgroundColor: Colors.light.backgroundElement,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: Spacing.three,
    right: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroBadgeRow: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  registeredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  registeredIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registeredBannerContent: {
    flex: 1,
  },
  registeredBannerTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: '#065F46',
  },
  registeredBannerSubtitle: {
    fontSize: Typography.size.xs,
    color: '#047857',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  viewPassBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  viewPassText: {
    color: '#FFFFFF',
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.text,
    lineHeight: 30,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.two,
  },
  organizerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  organizerTextCol: {
    flex: 1,
  },
  organizerSub: {
    fontSize: Typography.size.xs,
    color: Colors.light.textTertiary,
    textTransform: 'uppercase',
    fontWeight: Typography.weight.bold,
  },
  organizerName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
    marginTop: 1,
  },
  organizerContact: {
    fontSize: Typography.size.xs,
    color: Colors.light.primary,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.bold,
    color: Colors.light.textTertiary,
    letterSpacing: 0.5,
  },
  infoMainText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.light.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: Spacing.one,
  },
  capacitySection: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.two,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  capacityTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  capacityRemaining: {
    fontSize: Typography.size.xs,
    color: Colors.light.secondary,
    fontWeight: Typography.weight.semibold,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  capacityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  capacityStatText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  section: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  descriptionText: {
    fontSize: Typography.size.base,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    paddingBottom: Spacing.four,
  },
  bottomInfo: {
    flex: 1,
    marginRight: Spacing.two,
  },
  bottomPriceLabel: {
    fontSize: Typography.size.xs - 1,
    color: Colors.light.textTertiary,
    fontWeight: Typography.weight.bold,
  },
  bottomPriceVal: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.primary,
  },
  bottomActionWrapper: {
    flex: 1.5,
  },
});
