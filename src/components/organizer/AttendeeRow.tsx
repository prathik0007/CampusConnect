import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Registration } from '@/types';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { StatusBadge } from '@/components/common/StatusBadge';

export interface AttendeeRowProps {
  attendee: Registration;
  onToggleAttendance: (id: string, currentlyAttended: boolean) => void;
  isLoading?: boolean;
}

export function AttendeeRow({
  attendee,
  onToggleAttendance,
  isLoading = false,
}: AttendeeRowProps) {
  const isPresent = attendee.status === 'attended';

  const regDateStr = attendee.registrationDate
    ? new Date(attendee.registrationDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <View style={styles.card}>
      <View style={styles.mainInfo}>
        <View style={styles.topRow}>
          <Text style={styles.studentName}>{attendee.studentName || 'Student Attendee'}</Text>
          {attendee.studentRollNumber && (
            <View style={styles.rollBadge}>
              <Text style={styles.rollText}>{attendee.studentRollNumber}</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          {attendee.studentDepartment && (
            <Text style={styles.deptText}>{attendee.studentDepartment}</Text>
          )}
          {attendee.studentEmail && (
            <Text style={styles.emailText} numberOfLines={1}>
              • {attendee.studentEmail}
            </Text>
          )}
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.passCode}>Pass: {attendee.ticketCode}</Text>
          {regDateStr ? <Text style={styles.regDate}>Registered {regDateStr}</Text> : null}
        </View>
      </View>

      {/* Attendance Check-in Button */}
      <TouchableOpacity
        style={[
          styles.checkInBtn,
          isPresent ? styles.btnPresent : styles.btnNotPresent,
        ]}
        onPress={() => onToggleAttendance(attendee.id, isPresent)}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isPresent ? '#059669' : '#64748B'} />
        ) : (
          <>
            <Ionicons
              name={isPresent ? 'checkmark-circle' : 'radio-button-off'}
              size={18}
              color={isPresent ? '#059669' : '#64748B'}
            />
            <Text style={[styles.checkInText, isPresent ? styles.textPresent : styles.textNotPresent]}>
              {isPresent ? 'Present' : 'Check In'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.two,
  },
  mainInfo: {
    flex: 1,
    marginRight: Spacing.two,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  studentName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  rollBadge: {
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  rollText: {
    fontSize: Typography.size.xs - 1,
    fontWeight: Typography.weight.bold,
    color: Colors.light.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deptText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  emailText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textTertiary,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 2,
  },
  passCode: {
    fontSize: Typography.size.xs - 1,
    color: Colors.light.textSecondary,
    fontFamily: 'monospace',
    fontWeight: Typography.weight.semibold,
  },
  regDate: {
    fontSize: Typography.size.xs - 1,
    color: Colors.light.textTertiary,
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 95,
    justifyContent: 'center',
  },
  btnPresent: {
    backgroundColor: Colors.light.secondaryLight,
    borderColor: '#A7F3D0',
  },
  btnNotPresent: {
    backgroundColor: Colors.light.backgroundElement,
    borderColor: Colors.light.border,
  },
  checkInText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  textPresent: {
    color: Colors.light.secondary,
  },
  textNotPresent: {
    color: Colors.light.textSecondary,
  },
});
