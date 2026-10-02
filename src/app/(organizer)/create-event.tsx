import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { EventCategory, EventStatus } from '@/types';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { AppButton, AppTextInput } from '@/components/common';
import { CategoryChip } from '@/components/events';
import { ImagePickerBox } from '@/components/organizer';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

const CATEGORIES: EventCategory[] = [
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
  'Other',
];

export default function CreateEventScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createEvent } = useEvents();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technical');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endDate, setEndDate] = useState('2026-11-15');
  const [endTime, setEndTime] = useState('04:00 PM');
  const [capacity, setCapacity] = useState('100');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<EventStatus>('published');

  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Event title is required.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters.';
    }

    if (!venue.trim()) {
      newErrors.venue = 'Campus venue / hall location is required.';
    }

    if (!description.trim()) {
      newErrors.description = 'Please provide an event description and guidelines.';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Description should be at least 15 characters.';
    }

    if (!startDate.trim()) {
      newErrors.startDate = 'Start date is required.';
    }

    if (!startTime.trim()) {
      newErrors.startTime = 'Start time is required.';
    }

    if (!endDate.trim()) {
      newErrors.endDate = 'End date is required.';
    }

    if (!endTime.trim()) {
      newErrors.endTime = 'End time is required.';
    }

    const numCapacity = parseInt(capacity, 10);
    if (isNaN(numCapacity) || numCapacity <= 0) {
      newErrors.capacity = 'Capacity must be a positive number greater than 0.';
    }

    // Check date ordering (if valid date formats)
    const startParsed = Date.parse(startDate);
    const endParsed = Date.parse(endDate);
    if (!isNaN(startParsed) && !isNaN(endParsed) && endParsed < startParsed) {
      newErrors.endDate = 'End date cannot be earlier than start date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async (targetStatus: EventStatus = 'published') => {
    if (!validateForm()) {
      Alert.alert('Incomplete Form', 'Please review the highlighted errors before publishing.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build ISO timestamps or structured date strings
      const startDateTimeIso = `${startDate.trim()}T${startTime.includes(':') ? '09:00:00.000Z' : '09:00:00.000Z'}`;
      const endDateTimeIso = `${endDate.trim()}T${endTime.includes(':') ? '17:00:00.000Z' : '17:00:00.000Z'}`;

      const res = await createEvent({
        title: title.trim(),
        description: description.trim(),
        category,
        bannerUrl:
          imageUri ||
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
        startDate: startDateTimeIso,
        endDate: endDateTimeIso,
        venue: venue.trim(),
        maxCapacity: parseInt(capacity, 10),
        organizerId: user?.id || 'usr_organizer_01',
        organizerName: user?.name || 'Tech & Cultural Council',
        organizerContact: user?.email || 'organizer@campus.edu',
        status: targetStatus,
      });

      if (res.success) {
        Alert.alert(
          targetStatus === 'published' ? 'Event Published! 🎉' : 'Draft Saved',
          `"${title}" has been successfully added to your event portfolio.`,
          [
            {
              text: 'View in My Events',
              onPress: () => router.push('/(organizer)/my-events'),
            },
          ]
        );
      } else {
        Alert.alert('Error', res.error || 'Failed to create event.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Publish Campus Event</Text>
          <Text style={styles.headerSubtitle}>
            Create an academic, technical, or cultural event for the student body
          </Text>
        </View>

        {/* Poster / Image Picker */}
        <ImagePickerBox imageUri={imageUri} onImageSelected={setImageUri} />

        {/* Title */}
        <AppTextInput
          label="Event Title *"
          placeholder="e.g. National Hackathon 2026"
          value={title}
          onChangeText={(val) => {
            setTitle(val);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          error={errors.title}
          icon="calendar-outline"
        />

        {/* Category Selector */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat}
                category={cat}
                isSelected={category === cat}
                onPress={(selected) => setCategory(selected)}
                size="md"
              />
            ))}
          </ScrollView>
        </View>

        {/* Venue & Capacity Row */}
        <View style={styles.row}>
          <View style={{ flex: 2 }}>
            <AppTextInput
              label="Venue / Room *"
              placeholder="e.g. Main Auditorium"
              value={venue}
              onChangeText={(val) => {
                setVenue(val);
                if (errors.venue) setErrors((prev) => ({ ...prev, venue: '' }));
              }}
              error={errors.venue}
              icon="location-outline"
            />
          </View>

          <View style={{ flex: 1 }}>
            <AppTextInput
              label="Max Seats *"
              placeholder="100"
              value={capacity}
              onChangeText={(val) => {
                setCapacity(val);
                if (errors.capacity) setErrors((prev) => ({ ...prev, capacity: '' }));
              }}
              error={errors.capacity}
              keyboardType="number-pad"
              icon="people-outline"
            />
          </View>
        </View>

        {/* Start Date & Time */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppTextInput
              label="Start Date *"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={(val) => {
                setStartDate(val);
                if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: '' }));
              }}
              error={errors.startDate}
              icon="calendar"
            />
          </View>

          <View style={{ flex: 1 }}>
            <AppTextInput
              label="Start Time *"
              placeholder="10:00 AM"
              value={startTime}
              onChangeText={(val) => {
                setStartTime(val);
                if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: '' }));
              }}
              error={errors.startTime}
              icon="time-outline"
            />
          </View>
        </View>

        {/* End Date & Time */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppTextInput
              label="End Date *"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={(val) => {
                setEndDate(val);
                if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: '' }));
              }}
              error={errors.endDate}
              icon="calendar"
            />
          </View>

          <View style={{ flex: 1 }}>
            <AppTextInput
              label="End Time *"
              placeholder="04:00 PM"
              value={endTime}
              onChangeText={(val) => {
                setEndTime(val);
                if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: '' }));
              }}
              error={errors.endTime}
              icon="time-outline"
            />
          </View>
        </View>

        {/* Description & Guidelines */}
        <AppTextInput
          label="Description & Event Guidelines *"
          placeholder="Describe rules, prerequisites, prize pool, mentors, or schedule breakdown..."
          value={description}
          onChangeText={(val) => {
            setDescription(val);
            if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
          }}
          error={errors.description}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        {/* Organizer Attribution Banner */}
        <View style={styles.organizerMetaBox}>
          <Text style={styles.organizerMetaTitle}>ORGANIZER INFORMATION</Text>
          <Text style={styles.organizerMetaName}>{user?.name || 'Tech & Cultural Council'}</Text>
          <Text style={styles.organizerMetaSub}>{user?.email || 'organizer@campus.edu'}</Text>
        </View>

        {/* Buttons: Publish vs Save Draft */}
        <View style={styles.buttonStack}>
          <AppButton
            title="Publish Event"
            variant="secondary"
            size="lg"
            icon="sparkles"
            isLoading={isSubmitting}
            onPress={() => handlePublish('published')}
          />

          <AppButton
            title="Save as Draft"
            variant="outline"
            size="md"
            icon="document-text-outline"
            disabled={isSubmitting}
            onPress={() => handlePublish('draft')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  header: {
    marginBottom: Spacing.three,
  },
  headerTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  fieldSection: {
    marginBottom: Spacing.three,
  },
  fieldLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.one,
  },
  categoryRow: {
    gap: Spacing.one,
    paddingVertical: Spacing.half,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  organizerMetaBox: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    marginVertical: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  organizerMetaTitle: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.textTertiary,
    letterSpacing: 0.5,
  },
  organizerMetaName: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
    marginTop: 2,
  },
  organizerMetaSub: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  buttonStack: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
