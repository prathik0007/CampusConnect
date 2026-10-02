import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search events, clubs, venues...',
  onClear,
  containerStyle,
}: SearchBarProps) {
  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Ionicons name="search-outline" size={18} color={Colors.light.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textTertiary}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={17} color={Colors.light.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.three,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.base,
    color: Colors.light.text,
    height: '100%',
  },
  clearBtn: {
    padding: Spacing.half,
  },
});
