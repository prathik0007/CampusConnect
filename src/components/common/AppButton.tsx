import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = true,
}: AppButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          btn: styles.btnSecondary,
          text: styles.textSecondary,
          spinner: Colors.light.primaryText,
          iconColor: Colors.light.primaryText,
        };
      case 'outline':
        return {
          btn: styles.btnOutline,
          text: styles.textOutline,
          spinner: Colors.light.primary,
          iconColor: Colors.light.primary,
        };
      case 'danger':
        return {
          btn: styles.btnDanger,
          text: styles.textDanger,
          spinner: '#FFFFFF',
          iconColor: '#FFFFFF',
        };
      case 'success':
        return {
          btn: styles.btnSuccess,
          text: styles.textSuccess,
          spinner: '#FFFFFF',
          iconColor: '#FFFFFF',
        };
      case 'ghost':
        return {
          btn: styles.btnGhost,
          text: styles.textGhost,
          spinner: Colors.light.primary,
          iconColor: Colors.light.primary,
        };
      case 'primary':
      default:
        return {
          btn: styles.btnPrimary,
          text: styles.textPrimary,
          spinner: '#FFFFFF',
          iconColor: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          btn: styles.btnSm,
          text: styles.textSm,
          iconSize: 14,
        };
      case 'lg':
        return {
          btn: styles.btnLg,
          text: styles.textLg,
          iconSize: 20,
        };
      case 'md':
      default:
        return {
          btn: styles.btnMd,
          text: styles.textMd,
          iconSize: 16,
        };
    }
  };

  const currentVariant = getVariantStyles();
  const currentSize = getSizeStyles();
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.baseButton,
        currentVariant.btn,
        currentSize.btn,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={currentVariant.spinner} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={currentSize.iconSize}
              color={currentVariant.iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.baseText, currentVariant.text, currentSize.text, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={currentSize.iconSize}
              color={currentVariant.iconColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: Typography.weight.bold,
  },
  disabled: {
    opacity: 0.55,
  },
  iconLeft: {
    marginRight: Spacing.two,
  },
  iconRight: {
    marginLeft: Spacing.two,
  },

  // Variants
  btnPrimary: {
    backgroundColor: Colors.light.primary,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  btnSecondary: {
    backgroundColor: Colors.light.secondary,
  },
  textSecondary: {
    color: '#FFFFFF',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  textOutline: {
    color: Colors.light.primary,
  },
  btnDanger: {
    backgroundColor: Colors.light.error,
  },
  textDanger: {
    color: '#FFFFFF',
  },
  btnSuccess: {
    backgroundColor: Colors.light.success,
  },
  textSuccess: {
    color: '#FFFFFF',
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  textGhost: {
    color: Colors.light.primary,
  },

  // Sizes
  btnSm: {
    paddingVertical: 7,
    paddingHorizontal: Spacing.two,
    minHeight: 34,
    borderRadius: BorderRadius.sm,
  },
  textSm: {
    fontSize: Typography.size.sm,
  },
  btnMd: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    minHeight: 46,
  },
  textMd: {
    fontSize: Typography.size.base,
  },
  btnLg: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    minHeight: 52,
    borderRadius: BorderRadius.lg,
  },
  textLg: {
    fontSize: Typography.size.md,
  },
});
