import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EventCategory, EventStatus } from '@/types';
import { useEvents } from '@/context/EventContext';
import { AppButton, AppTextInput, EmptyState, LoadingIndicator } from '@/components/common';
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

const STATUS_OPTIONS: EventStatus[] = ['published', 'draft', 'cancelled', 'completed'];

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getEventById, updateEvent, uploadBanner, isLoading } = useEvents();

  const event = id ? getEventById(id) : undefined;

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technical');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<EventStatus>('published');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill from existing event data
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setCategory(event.category);
      setVenue(event.venue);
      setCapacity(event.maxCapacity.toString());
      setDescription(event.description);
      setImageUri(event.bannerUrl);
      setStatus(event.status);

      // Extract date and time parts
      const sObj = new Date(event.startDate);
      const eObj = new Date(event.endDate);

      if (!isNaN(sObj.getTime())) {
        setStartDate(sObj.toISOString().split('T')[0]);
        setStartTime(
          sObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        );
      } else {
        setStartDate('2026-11-15');
        setStartTime('10:00 AM');
      }

      if (!isNaN(eObj.getTime())) {
        setEndDate(eObj.toISOString().split('T')[0]);
        setEndTime(
          eObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        );
      } else {
        setEndDate('2026-11-15');
        setEndTime('04:00 PM');
      }
    }
  }, [event]);

  // Gracefully handle invalid ID
  if (!event && !isLoading) {
    return (
      <View style={styles.errorContainer}>
        <EmptyState
          icon="alert-circle-outline"
          title="Event Not Found"
          description="The event you are attempting to edit cannot be found in your catalog."
          actionTitle="Back to My Events"
          onActionPress={() => router.replace('/(organizer)/my-events')}
        />
      </View>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Event title is required.';
    if (!venue.trim()) newErrors.venue = 'Campus venue is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';

    const numCapacity = parseInt(capacity, 10);
    if (isNaN(numCapacity) || numCapacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0.';
    } else if (numCapacity < event!.registeredCount) {
      newErrors.capacity = `Cannot reduce capacity below currently registered students (${event!.registeredCount}).`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check the highlighted form errors.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalBannerUrl = imageUri;

      // If organizer picked a new local image from device, upload it to Cloudinary
      if (imageUri && !imageUri.startsWith('http://') && !imageUri.startsWith('https://')) {
        const uploadRes = await uploadBanner(imageUri);
        if (!uploadRes.success || !uploadRes.url) {
          Alert.alert(
            'Upload Failed',
            uploadRes.error || 'Failed to upload event banner to cloud storage. Please check connection and try again.'
          );
          return;
        }
        finalBannerUrl = uploadRes.url;
      }

      const res = await updateEvent(event!.id, {
        title: title.trim(),
        category,
        venue: venue.trim(),
        maxCapacity: parseInt(capacity, 10),
        description: description.trim(),
        bannerUrl: finalBannerUrl,
        status,
      });

      if (res.success) {
        Alert.alert(
          'Changes Saved',
          `"${title}" has been updated successfully.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(organizer)/my-events'),
            },
          ]
        );
      } else {
        Alert.alert('Error', res.error || 'Failed to update event.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator fullScreen message="Loading event details..." />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Edit Campus Event</Text>
            <Text style={styles.headerSubtitle}>
              {event?.registeredCount} students registered for this event
            </Text>
          </View>
        </View>

        {/* Poster / Image Picker */}
        <ImagePickerBox imageUri={imageUri} onImageSelected={setImageUri} />

        {/* Title */}
        <AppTextInput
          label="Event Title *"
          value={title}
          onChangeText={(val) => {
            setTitle(val);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          error={errors.title}
          icon="calendar-outline"
        />

        {/* Category */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
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

        {/* Status Selector */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Event Status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((st) => {
              const isSelected = status === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.statusPill,
                    isSelected && styles.statusPillSelected,
                  ]}
                  onPress={() => setStatus(st)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      isSelected && styles.statusPillTextSelected,
                    ]}
                  >
                    {st.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Venue & Capacity */}
        <View style={styles.row}>
          <View style={{ flex: 2 }}>
            <AppTextInput
              label="Venue *"
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
              label="Capacity *"
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

        {/* Description */}
        <AppTextInput
          label="Description & Event Guidelines *"
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

        {/* Action Buttons */}
        <View style={styles.buttonStack}>
          <AppButton
            title="Save Changes"
            variant="secondary"
            size="lg"
            icon="checkmark-circle"
            isLoading={isSubmitting}
            onPress={handleSave}
          />

          <AppButton
            title="Cancel"
            variant="outline"
            size="md"
            disabled={isSubmitting}
            onPress={() => router.back()}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.three,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.six,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  headerText: {
    flex: 1,
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
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    flexWrap: 'wrap',
  },
  statusPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statusPillSelected: {
    backgroundColor: Colors.light.secondary,
    borderColor: Colors.light.secondary,
  },
  statusPillText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.light.textSecondary,
  },
  statusPillTextSelected: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonStack: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
});
