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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('MCA - Master of Computer Applications');
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid campus email address.');
      return;
    }
    if (!rollNumber.trim()) {
      setError('Please provide your college roll number.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const res = await register({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      department,
      rollNumber: rollNumber.trim().toUpperCase(),
      phone: phone.trim(),
      role: 'student',
    });


    if (res.success) {
      router.replace('/(student)/index');
    } else {
      setError(res.error || 'Registration failed. Try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Registration</Text>
          <Text style={styles.headerSubtitle}>
            Join CampusConnect to discover and attend campus events
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.light.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <AppTextInput
            label="Full Name *"
            placeholder="e.g. Prathik Kumar"
            value={name}
            onChangeText={setName}
            icon="person-outline"
          />

          <AppTextInput
            label="Campus Email *"
            placeholder="student@campus.edu"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Roll / USN No. *"
                placeholder="MCA2024042"
                value={rollNumber}
                onChangeText={setRollNumber}
                autoCapitalize="characters"
                icon="card-outline"
              />
            </View>

            <View style={{ flex: 1 }}>
              <AppTextInput
                label="Phone"
                placeholder="9876543210"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                icon="call-outline"
              />
            </View>
          </View>

          <AppTextInput
            label="Department / Degree"
            value={department}
            onChangeText={setDepartment}
            icon="business-outline"
          />

          <AppTextInput
            label="Create Password *"
            placeholder="Minimum 6 characters"
            value={password}
            onChangeText={setPassword}
            isPassword={true}
            icon="lock-closed-outline"
          />

          <AppButton
            title="Complete Registration"
            onPress={handleRegister}
            isLoading={isLoading}
            size="lg"
            style={styles.submitBtn}
          />

          <View style={styles.footerLinkContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign In</Text>
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
    padding: Spacing.four,
    paddingTop: Spacing.six,
  },
  header: {
    marginBottom: Spacing.four,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.heavy,
    color: Colors.light.text,
  },
  headerSubtitle: {
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
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  submitBtn: {
    marginTop: Spacing.two,
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
