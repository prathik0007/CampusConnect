import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>
            {Math.round((checkedInCount / attendees.length) * 100)}%
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, roll number, or pass code..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Attendees List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredAttendees.map((student) => (
          <View key={student.id} style={styles.studentCard}>
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.rollBadge}>{student.rollNumber}</Text>
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
            >
              <Ionicons
                name={student.attended ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={student.attended ? '#059669' : '#6B7280'}
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
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  counterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  counterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  counterSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  percentageBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 10,
    paddingBottom: 32,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  rollBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  passCode: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkedIn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  notCheckedIn: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  checkInText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textChecked: {
    color: '#059669',
  },
  textNotChecked: {
    color: '#64748B',
  },
});
