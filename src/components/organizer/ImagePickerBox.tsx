import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

export interface ImagePickerBoxProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function ImagePickerBox({ imageUri, onImageSelected, style }: ImagePickerBoxProps) {
  const pickImage = async () => {
    try {
      // Request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'CampusConnect requires media library access to select event posters and banners.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('ImagePicker error:', err);
      Alert.alert('Image Selection Error', 'Could not open photo library.');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
          <TouchableOpacity
            style={styles.replaceButton}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-reverse-outline" size={16} color="#FFFFFF" />
            <Text style={styles.replaceText}>Change Poster</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.emptyBox} onPress={pickImage} activeOpacity={0.8}>
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-upload-outline" size={28} color={Colors.light.secondary} />
          </View>
          <Text style={styles.mainTitle}>Upload Event Poster</Text>
          <Text style={styles.subTitle}>Select from your photos (16:9 ratio recommended)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  previewContainer: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  replaceButton: {
    position: 'absolute',
    bottom: Spacing.two,
    right: Spacing.two,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replaceText: {
    color: '#FFFFFF',
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  emptyBox: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  subTitle: {
    fontSize: Typography.size.xs,
    color: Colors.light.textTertiary,
  },
});
