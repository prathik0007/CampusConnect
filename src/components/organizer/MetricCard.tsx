import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  subtext?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function MetricCard({
  title,
  value,
  icon,
  iconColor = Colors.light.secondary,
  iconBg = Colors.light.secondaryLight,
  subtext,
  onPress,
  style,
}: MetricCardProps) {
  const content = (
    <View style={[styles.card, Shadows.sm, style]}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{ flex: 1 }}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: '45%',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  value: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.text,
  },
  title: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontWeight: Typography.weight.semibold,
    marginTop: 2,
  },
  subtext: {
    fontSize: Typography.size.xs - 1,
    color: Colors.light.textTertiary,
    marginTop: Spacing.half,
  },
});
