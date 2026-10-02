import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

export interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
}

export function AppTextInput({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword = false,
  secureTextEntry,
  style,
  ...rest
}: AppTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const shouldHideText = isPassword ? !isPasswordVisible : secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={error ? Colors.light.error : isFocused ? Colors.light.primary : Colors.light.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          placeholderTextColor={Colors.light.textTertiary}
          style={[styles.input, style]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={shouldHideText}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon} size={18} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={13} color={Colors.light.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
    width: '100%',
  },
  label: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.one,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    minHeight: 46,
  },
  inputFocused: {
    borderColor: Colors.light.primary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  leftIcon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: Typography.size.base,
    color: Colors.light.text,
    paddingVertical: Spacing.two,
  },
  rightIconButton: {
    padding: Spacing.one,
    marginLeft: Spacing.one,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.one,
    gap: 4,
  },
  errorText: {
    fontSize: Typography.size.xs,
    color: Colors.light.error,
    fontWeight: Typography.weight.medium,
  },
});
