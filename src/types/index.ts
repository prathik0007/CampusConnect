export type UserRole = 'student' | 'organizer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  rollNumber?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export type EventCategory =
  | 'Technical'
  | 'Cultural'
  | 'Sports'
  | 'Workshop'
  | 'Seminar'
  | 'Other';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  venue: string;
  maxCapacity: number;
  registeredCount: number;
  organizerId: string;
  organizerName: string;
  organizerContact?: string;
  status: EventStatus;
  createdAt?: string;
}

// Alias for convenience
export type Event = CampusEvent;

export type RegistrationStatus = 'registered' | 'cancelled' | 'attended';

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  studentRollNumber?: string;
  studentDepartment?: string;
  eventTitle?: string;
  eventCategory?: EventCategory;
  eventStartDate?: string;
  eventVenue?: string;
  organizerName?: string;
  registrationDate: string;
  status: RegistrationStatus;
  ticketCode: string;
  attendedAt?: string;
}

export type NotificationType =
  | 'registration_success'
  | 'reminder'
  | 'event_update'
  | 'cancellation'
  | 'general';

export interface Notification {
  id: string;
  recipientId?: string;
  eventId?: string;
  title: string;
  message: string;
  isRead: boolean;
  type: NotificationType;
  createdAt: string;
}
