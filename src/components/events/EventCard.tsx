import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CampusEvent } from '@/types';
import { BorderRadius, CategoryTheme, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { CategoryChip } from './CategoryChip';
import { EventStatusBadge } from './EventStatusBadge';
import { AppButton } from '../common/AppButton';

export interface EventCardProps {
  event: CampusEvent;
  isRegistered?: boolean;
  onPress?: (event: CampusEvent) => void;
  onRegisterPress?: (event: CampusEvent) => void;
  showAction?: boolean;
  actionLoading?: boolean;
  isOrganizerView?: boolean;
  onEditPress?: (event: CampusEvent) => void;
  onDeletePress?: (event: CampusEvent) => void;
  onAttendeesPress?: (event: CampusEvent) => void;
  style?: StyleProp<ViewStyle>;
}

export function EventCard({
  event,
  isRegistered = false,
  onPress,
  onRegisterPress,
  showAction = true,
  actionLoading = false,
  isOrganizerView = false,
  onEditPress,
  onDeletePress,
  onAttendeesPress,
  style,
}: EventCardProps) {
  const categoryConfig = CategoryTheme[event.category] ?? CategoryTheme.Other;

  // Format date and time
  const startDateObj = new Date(event.startDate);
  const formattedDate = !isNaN(startDateObj.getTime())
    ? startDateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : event.startDate;

  const formattedTime = !isNaN(startDateObj.getTime())
    ? startDateObj.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Seats calculation
  const availableSeats = Math.max(0, event.maxCapacity - event.registeredCount);
  const isFull = availableSeats === 0;

  // Placeholder poster image if none provided
  const bannerUri =
    event.bannerUrl ||
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';

  return (
    <View style={[styles.card, Shadows.sm, style]}>
      {/* Event Banner / Poster */}
      <TouchableOpacity
        activeOpacity={onPress ? 0.85 : 1}
        onPress={() => onPress && onPress(event)}
        disabled={!onPress}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: bannerUri }}
            style={styles.bannerImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.imageGradientOverlay} />

          {/* Floating Category & Status Chips */}
          <View style={styles.floatingTopBar}>
            <CategoryChip category={event.category} size="sm" />
            {isOrganizerView ? (
              <EventStatusBadge status={event.status} size="sm" />
            ) : isRegistered ? (
              <View style={styles.registeredPill}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.registeredPillText}>REGISTERED</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>

          {/* Organizer Attribution */}
          <View style={styles.organizerRow}>
            <Ionicons name="people-outline" size={13} color={Colors.light.textSecondary} />
            <Text style={styles.organizerText} numberOfLines={1}>
              {event.organizerName}
            </Text>
          </View>

          {/* Key Event Details Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color={Colors.light.primary} />
              <Text style={styles.metaText}>
                {formattedDate} {formattedTime ? `• ${formattedTime}` : ''}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={Colors.light.primary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {event.venue}
              </Text>
            </View>
          </View>

          {/* Seat Availability Bar */}
          <View style={styles.seatRow}>
            <View style={styles.seatInfo}>
              <Ionicons
                name="ticket-outline"
                size={14}
                color={isFull ? Colors.light.error : Colors.light.textSecondary}
              />
              <Text
                style={[
                  styles.seatText,
                  isFull && { color: Colors.light.error, fontWeight: Typography.weight.bold },
                ]}
              >
                {event.registeredCount}/{event.maxCapacity} seats filled
                {isFull ? ' (Sold Out)' : ` (${availableSeats} left)`}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Card Actions Footer */}
      {showAction && (
        <View style={styles.footer}>
          {isOrganizerView ? (
            <View style={styles.organizerActions}>
              {onAttendeesPress && (
                <AppButton
                  title="Attendees"
                  onPress={() => onAttendeesPress(event)}
                  variant="outline"
                  size="sm"
                  icon="people-outline"
                  style={styles.organizerBtn}
                />
              )}
              {onEditPress && (
                <AppButton
                  title="Edit"
                  onPress={() => onEditPress(event)}
                  variant="secondary"
                  size="sm"
                  icon="create-outline"
                  style={styles.organizerBtn}
                />
              )}
              {onDeletePress && (
                <AppButton
                  title="Delete"
                  onPress={() => onDeletePress(event)}
                  variant="danger"
                  size="sm"
                  icon="trash-outline"
                  style={styles.organizerBtn}
                />
              )}
            </View>
          ) : (
            onRegisterPress && (
              <AppButton
                title={
                  isRegistered
                    ? 'Cancel Registration'
                    : isFull
                    ? 'Registration Full'
                    : 'Register for Event'
                }
                onPress={() => onRegisterPress(event)}
                variant={isRegistered ? 'danger' : isFull ? 'outline' : 'primary'}
                disabled={isFull && !isRegistered}
                isLoading={actionLoading}
                icon={isRegistered ? 'close-circle-outline' : 'ticket-outline'}
                size="md"
              />
            )
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.three,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.light.backgroundElement,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imageGradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  floatingTopBar: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    right: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registeredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  registeredPillText: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.heavy,
    color: '#059669',
  },
  content: {
    padding: Spacing.three,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: Spacing.one,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  organizerText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  metaGrid: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  metaText: {
    fontSize: Typography.size.sm,
    color: Colors.light.text,
    fontWeight: Typography.weight.medium,
    flex: 1,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.half,
  },
  seatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  seatText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.light.card,
  },
  organizerActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  organizerBtn: {
    flex: 1,
  },
});
