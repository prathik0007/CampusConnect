import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { AppButton, AppTextInput } from '@/components/common';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (roleOverride?: 'student' | 'organizer') => {
    setError(null);
    const loginEmail = roleOverride === 'organizer' 
      ? 'organizer@campus.edu' 
      : roleOverride === 'student' 
        ? 'student@campus.edu' 
        : email;

    if (!loginEmail.trim()) {
      setError('Please enter your campus email address.');
      return;
    }

    const res = await login(loginEmail, password, roleOverride);
    if (res.success && res.user) {
      if (res.user.role === 'organizer') {
        router.replace('/(organizer)/index');
      } else {
        router.replace('/(student)/index');
      }
    } else {
      setError(res.error || 'Login failed. Please check credentials.');
    }

  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="school-outline" size={38} color={Colors.light.primary} />
          </View>
          <Text style={styles.appName}>CampusConnect</Text>
          <Text style={styles.tagline}>Campus Event Management Platform</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to view and register for events</Text>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.light.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <AppTextInput
            label="Campus Email / Roll No"
            placeholder="student@campus.edu or organizer@campus.edu"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            icon="mail-outline"
          />

          <AppTextInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword={true}
            icon="lock-closed-outline"
          />

          <AppButton
            title="Sign In"
            onPress={() => handleLogin()}
            isLoading={isLoading}
            size="lg"
            style={styles.primaryButton}
          />

          {/* Quick Demo Access */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>QUICK DEMO ACCESS</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.quickAccessRow}>
            <View style={{ flex: 1 }}>
              <AppButton
                title="Demo Student"
                variant="outline"
                size="sm"
                icon="person-outline"
                onPress={() => handleLogin('student')}
              />
            </View>

            <View style={{ flex: 1 }}>
              <AppButton
                title="Demo Organizer"
                variant="secondary"
                size="sm"
                icon="shield-checkmark-outline"
                onPress={() => handleLogin('organizer')}
              />
            </View>
          </View>

          <View style={styles.footerLinkContainer}>
            <Text style={styles.footerText}>New student? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Create an Account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  appName: {
    fontSize: Typography.size.display,
    fontWeight: Typography.weight.heavy,
    color: '#1E3A8A',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  formTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  formSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.three,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.errorLight,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  errorText: {
    color: Colors.light.errorText,
    fontSize: Typography.size.sm,
    flex: 1,
  },
  primaryButton: {
    marginTop: Spacing.two,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.four,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    marginHorizontal: Spacing.two,
    fontSize: Typography.size.xs,
    color: Colors.light.textTertiary,
    fontWeight: Typography.weight.semibold,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  footerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  footerText: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
  },
  linkText: {
    fontSize: Typography.size.sm,
    color: Colors.light.primary,
    fontWeight: Typography.weight.bold,
  },
});
