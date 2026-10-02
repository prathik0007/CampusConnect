import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';

export interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function LoadingIndicator({
  message = 'Loading...',
  size = 'large',
  color = Colors.light.primary,
  fullScreen = false,
  style,
}: LoadingIndicatorProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  message: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    fontWeight: Typography.weight.medium,
  },
});
