import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { AppButton } from './AppButton';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionTitle?: string;
  onActionPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  description,
  icon = 'albums-outline',
  actionTitle,
  onActionPress,
  containerStyle,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={Colors.light.textTertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}

      {actionTitle && onActionPress && (
        <View style={styles.actionWrapper}>
          <AppButton
            title={actionTitle}
            onPress={onActionPress}
            size="sm"
            variant="outline"
            fullWidth={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginVertical: Spacing.three,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.one,
    lineHeight: 18,
    maxWidth: 280,
  },
  actionWrapper: {
    marginTop: Spacing.four,
  },
});
