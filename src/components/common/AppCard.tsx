import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';

export interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function AppCard({
  children,
  style,
  onPress,
  variant = 'outlined',
  padding = 'md',
}: AppCardProps) {
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return Spacing.two;
      case 'lg':
        return Spacing.four;
      case 'md':
      default:
        return Spacing.three;
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return [styles.cardElevated, Shadows.md];
      case 'flat':
        return styles.cardFlat;
      case 'outlined':
      default:
        return styles.cardOutlined;
    }
  };

  const content = (
    <View
      style={[
        styles.baseCard,
        getVariantStyle(),
        { padding: getPaddingStyle() },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  baseCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardElevated: {
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  cardFlat: {
    backgroundColor: Colors.light.backgroundElement,
  },
});
