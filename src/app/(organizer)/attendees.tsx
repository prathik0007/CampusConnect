import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppCard, SearchBar, StatusBadge } from '@/components/common';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

interface Attendee {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  eventTitle: string;
  ticketCode: string;
  attended: boolean;
}

const MOCK_ATTENDEES: Attendee[] = [
  {
    id: 'att_1',
    name: 'Prathik Kumar',
    rollNumber: 'MCA2024042',
    department: 'MCA',
    eventTitle: 'HackCampus 2026: 24h Hackathon',
    ticketCode: 'CC-HACK-84920',
    attended: true,
  },
  {
    id: 'att_2',
    name: 'Sneha Rao',
    rollNumber: 'MCA2024018',
    department: 'MCA',
    eventTitle: 'HackCampus 2026: 24h Hackathon',
    ticketCode: 'CC-HACK-84921',
    attended: false,
  },
  {
    id: 'att_3',
    name: 'Aditya Sharma',
    rollNumber: 'MCA2024005',
    department: 'MCA',
    eventTitle: 'HackCampus 2026: 24h Hackathon',
    ticketCode: 'CC-HACK-84922',
    attended: true,
  },
  {
    id: 'att_4',
    name: 'Ananya Verma',
    rollNumber: 'BTECH2023102',
    department: 'CSE',
    eventTitle: 'Cloud & AI Workshop',
    ticketCode: 'CC-AIWS-19342',
    attended: false,
  },
  {
    id: 'att_5',
    name: 'Rahul Deshmukh',
    rollNumber: 'BTECH2023089',
    department: 'ISE',
    eventTitle: 'Cloud & AI Workshop',
    ticketCode: 'CC-AIWS-19343',
    attended: false,
  },
];

export default function OrganizerAttendeesScreen() {
  const [attendees, setAttendees] = useState<Attendee[]>(MOCK_ATTENDEES);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleAttendance = (id: string) => {
    setAttendees((prev) =>
      prev.map((att) =>
        att.id === id ? { ...att, attended: !att.attended } : att
      )
    );
  };

  const filteredAttendees = attendees.filter(
    (att) =>
      att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.ticketCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const checkedInCount = attendees.filter((a) => a.attended).length;
  const attendancePercent = Math.round((checkedInCount / attendees.length) * 100);

  return (
    <View style={styles.container}>
      {/* Header Counter Bar */}
      <View style={styles.counterBar}>
        <View>
          <Text style={styles.counterTitle}>Verification & Check-in</Text>
          <Text style={styles.counterSub}>
            {checkedInCount} of {attendees.length} verified attendance
          </Text>
        </View>
        <StatusBadge
          label={`${attendancePercent}% Present`}
          status={attendancePercent >= 50 ? 'success' : 'warning'}
          size="md"
        />
      </View>

      {/* Search Input using common SearchBar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by student name, roll no, or pass..."
        />
      </View>

      {/* Attendees List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredAttendees.map((student) => (
          <AppCard key={student.id} style={styles.studentCard} padding="md">
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.studentName}>{student.name}</Text>
                <View style={styles.rollBadge}>
                  <Text style={styles.rollText}>{student.rollNumber}</Text>
                </View>
              </View>

              <Text style={styles.eventLabel}>{student.eventTitle}</Text>
              <Text style={styles.passCode}>Pass: {student.ticketCode}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.checkInBtn,
                student.attended ? styles.checkedIn : styles.notCheckedIn,
              ]}
              onPress={() => toggleAttendance(student.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={student.attended ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={student.attended ? Colors.light.secondary : Colors.light.textSecondary}
              />
              <Text
                style={[
                  styles.checkInText,
                  student.attended ? styles.textChecked : styles.textNotChecked,
                ]}
              >
                {student.attended ? 'Present' : 'Check In'}
              </Text>
            </TouchableOpacity>
          </AppCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  counterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  counterTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.light.text,
  },
  counterSub: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  searchWrapper: {
    padding: Spacing.three,
    paddingBottom: Spacing.one,
    backgroundColor: Colors.light.card,
  },
  listContent: {
    padding: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
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
  eventLabel: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  passCode: {
    fontSize: Typography.size.xs - 1,
    color: Colors.light.textTertiary,
    fontFamily: 'monospace',
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  checkedIn: {
    backgroundColor: Colors.light.secondaryLight,
    borderColor: '#A7F3D0',
  },
  notCheckedIn: {
    backgroundColor: Colors.light.backgroundElement,
    borderColor: Colors.light.border,
  },
  checkInText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  textChecked: {
    color: Colors.light.secondary,
  },
  textNotChecked: {
    color: Colors.light.textSecondary,
  },
});
