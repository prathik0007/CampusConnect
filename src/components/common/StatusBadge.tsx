import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

export type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface StatusBadgeProps {
  label: string;
  status?: BadgeStatus;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function StatusBadge({
  label,
  status = 'neutral',
  size = 'md',
  icon,
  style,
  textStyle,
}: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return {
          bg: Colors.light.successLight,
          text: Colors.light.successText,
          border: '#A7F3D0',
        };
      case 'warning':
        return {
          bg: Colors.light.warningLight,
          text: Colors.light.warningText,
          border: '#FDE68A',
        };
      case 'error':
        return {
          bg: Colors.light.errorLight,
          text: Colors.light.errorText,
          border: '#FECACA',
        };
      case 'info':
        return {
          bg: Colors.light.infoLight,
          text: Colors.light.infoText,
          border: '#BFDBFE',
        };
      case 'neutral':
      default:
        return {
          bg: Colors.light.backgroundElement,
          text: Colors.light.textSecondary,
          border: Colors.light.border,
        };
    }
  };

  const themeConfig = getStatusStyles();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: themeConfig.bg,
          borderColor: themeConfig.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 8,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isSm ? 10 : 12}
          color={themeConfig.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: themeConfig.text,
            fontSize: isSm ? Typography.size.xs - 1 : Typography.size.xs,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Spacing.half,
  },
  text: {
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
