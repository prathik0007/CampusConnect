import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventCategory } from '@/types';
import { BorderRadius, CategoryTheme, Colors, Spacing, Typography } from '@/constants/theme';

export interface CategoryChipProps {
  category: EventCategory | 'All';
  isSelected?: boolean;
  onPress?: (category: any) => void;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function CategoryChip({
  category,
  isSelected = false,
  onPress,
  showIcon = true,
  size = 'md',
  style,
}: CategoryChipProps) {
  const isAll = category === 'All';
  const categoryConfig = isAll
    ? {
        text: Colors.light.primary,
        bg: Colors.light.primaryLight,
        border: '#BFDBFE',
        icon: 'apps-outline',
      }
    : CategoryTheme[category as EventCategory] ?? CategoryTheme.Other;

  const isSm = size === 'sm';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!onPress}
      onPress={() => onPress && onPress(category)}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? Colors.light.primary : categoryConfig.bg,
          borderColor: isSelected ? Colors.light.primary : categoryConfig.border,
          paddingVertical: isSm ? 5 : 8,
          paddingHorizontal: isSm ? 10 : 14,
        },
        style,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={categoryConfig.icon as any}
          size={isSm ? 13 : 15}
          color={isSelected ? '#FFFFFF' : categoryConfig.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: isSelected ? '#FFFFFF' : categoryConfig.text,
            fontSize: isSm ? Typography.size.xs : Typography.size.sm,
          },
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Spacing.one,
  },
  label: {
    fontWeight: Typography.weight.semibold,
  },
});
