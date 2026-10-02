import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EventCategory } from '@/types';
import { AppButton, AppTextInput } from '@/components/common';
import { CategoryChip } from '@/components/events';
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

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technical');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('2026-11-15');
  const [time, setTime] = useState('10:00 AM');
  const [capacity, setCapacity] = useState('100');
  const [description, setDescription] = useState('');
  const [bannerUploaded, setBannerUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Missing Field', 'Please provide an event title.');
      return;
    }
    if (!venue.trim()) {
      Alert.alert('Missing Field', 'Please specify the campus venue.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Event Published',
        `"${title}" has been published and is now visible to all students.`,
        [
          {
            text: 'View in My Events',
            onPress: () => router.push('/(organizer)/my-events'),
          },
        ]
      );
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Banner Image Box */}
        <TouchableOpacity
          style={[styles.bannerPicker, bannerUploaded && styles.bannerPickerUploaded]}
          onPress={() => setBannerUploaded(!bannerUploaded)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={bannerUploaded ? 'image' : 'cloud-upload-outline'}
            size={36}
            color={bannerUploaded ? Colors.light.secondary : Colors.light.textSecondary}
          />
          <Text style={styles.bannerPickerTitle}>
            {bannerUploaded ? 'Event Poster Selected (Tap to Replace)' : 'Upload Event Poster / Banner'}
          </Text>
          <Text style={styles.bannerPickerSub}>High quality landscape banner (16:9 ratio)</Text>
        </TouchableOpacity>

        {/* Title Input */}
        <AppTextInput
          label="Event Title *"
          placeholder="e.g. National Hackathon 2026"
          value={title}
          onChangeText={setTitle}
          icon="calendar-outline"
        />

        {/* Category Selector */}
        <View style={styles.categoryContainer}>
          <Text style={styles.label}>Event Category *</Text>
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

        {/* Venue & Max Capacity */}
        <View style={styles.row}>
          <View style={{ flex: 2 }}>
            <AppTextInput
              label="Venue / Room *"
              placeholder="e.g. Main Auditorium"
              value={venue}
              onChangeText={setVenue}
              icon="location-outline"
            />
          </View>

          <View style={{ flex: 1 }}>
            <AppTextInput
              label="Max Seats"
              placeholder="100"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="number-pad"
              icon="people-outline"
            />
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppTextInput
              label="Date"
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              icon="time-outline"
            />
          </View>

          <View style={{ flex: 1 }}>
            <AppTextInput
              label="Start Time"
              placeholder="10:00 AM"
              value={time}
              onChangeText={setTime}
              icon="alarm-outline"
            />
          </View>
        </View>

        {/* Description */}
        <AppTextInput
          label="Description & Event Rules"
          placeholder="Describe rules, prerequisites, prize pool, or schedule breakdown..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        {/* Action Button */}
        <AppButton
          title="Publish Campus Event"
          variant="secondary"
          size="lg"
          icon="sparkles"
          isLoading={isSubmitting}
          onPress={handlePublish}
          style={styles.submitBtn}
        />
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
  bannerPicker: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
    marginBottom: Spacing.three,
  },
  bannerPickerUploaded: {
    borderColor: Colors.light.secondary,
    backgroundColor: Colors.light.secondaryLight,
    borderStyle: 'solid',
  },
  bannerPickerTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  bannerPickerSub: {
    fontSize: Typography.size.xs,
    color: Colors.light.textTertiary,
  },
  categoryContainer: {
    marginBottom: Spacing.three,
  },
  label: {
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
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: Spacing.two,
  },
});
