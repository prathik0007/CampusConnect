import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { EventStatus } from '@/types';
import { StatusBadge, BadgeStatus } from '@/components/common/StatusBadge';
import { Ionicons } from '@expo/vector-icons';

export interface EventStatusBadgeProps {
  status: EventStatus;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function EventStatusBadge({ status, size = 'sm', style }: EventStatusBadgeProps) {
  const getBadgeProps = (): {
    label: string;
    badgeStatus: BadgeStatus;
    icon: keyof typeof Ionicons.glyphMap;
  } => {
    switch (status) {
      case 'published':
        return { label: 'Published', badgeStatus: 'success', icon: 'checkmark-circle' };
      case 'draft':
        return { label: 'Draft', badgeStatus: 'warning', icon: 'document-text-outline' };
      case 'cancelled':
        return { label: 'Cancelled', badgeStatus: 'error', icon: 'close-circle-outline' };
      case 'completed':
        return { label: 'Completed', badgeStatus: 'info', icon: 'flag-outline' };
      default:
        return { label: status, badgeStatus: 'neutral', icon: 'help-circle-outline' };
    }
  };

  const config = getBadgeProps();

  return (
    <StatusBadge
      label={config.label}
      status={config.badgeStatus}
      icon={config.icon}
      size={size}
      style={style}
    />
  );
}
