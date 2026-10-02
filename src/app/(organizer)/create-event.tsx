import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter an event title.');
      return;
    }
    if (!venue.trim()) {
      Alert.alert('Validation Error', 'Please specify the event venue.');
      return;
    }

    Alert.alert(
      'Event Created Successfully',
      `"${title}" has been published to the student catalog.`,
      [
        {
          text: 'View in My Events',
          onPress: () => router.push('/(organizer)/my-events'),
        },
      ]
    );
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
        >
          <Ionicons
            name={bannerUploaded ? 'image' : 'cloud-upload-outline'}
            size={36}
            color={bannerUploaded ? '#059669' : '#6B7280'}
          />
          <Text style={styles.bannerPickerTitle}>
            {bannerUploaded ? 'Banner Image Selected (Tap to Change)' : 'Upload Event Poster / Banner'}
          </Text>
          <Text style={styles.bannerPickerSub}>PNG, JPG up to 5MB (16:9 ratio recommended)</Text>
        </TouchableOpacity>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. National Level Coding Bootcamp"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Venue & Capacity Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 2 }]}>
            <Text style={styles.label}>Venue / Room *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Auditorium Hall A"
              placeholderTextColor="#9CA3AF"
              value={venue}
              onChangeText={setVenue}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Max Seats</Text>
            <TextInput
              style={styles.textInput}
              placeholder="100"
              placeholderTextColor="#9CA3AF"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Date & Time Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={date}
              onChangeText={setDate}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.textInput}
              placeholder="10:00 AM"
              placeholderTextColor="#9CA3AF"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Description & Guidelines</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Explain event rules, prerequisites, prize pool, or schedule breakdown..."
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text style={styles.publishBtnText}>Publish Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
    gap: 14,
  },
  bannerPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bannerPickerUploaded: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
    borderStyle: 'solid',
  },
  bannerPickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  bannerPickerSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  categoryChipActive: {
    backgroundColor: '#059669',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  publishBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
