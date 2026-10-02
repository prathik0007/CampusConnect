import React, { createContext, useContext, useEffect, useState } from 'react';
import { CampusEvent, Registration } from '@/types';
import { INITIAL_MOCK_EVENTS } from '@/data/mockEvents';
import { appStorage } from '@/utils/storage';

interface RegisterStudentParams {
  id: string;
  name: string;
  rollNumber?: string;
  department?: string;
}

interface EventContextType {
  events: CampusEvent[];
  registrations: Registration[];
  isLoading: boolean;
  refreshEvents: () => Promise<void>;
  getEventById: (id: string) => CampusEvent | undefined;
  isRegistered: (eventId: string, studentId?: string) => boolean;
  getRegistration: (eventId: string, studentId?: string) => Registration | undefined;
  getStudentRegistrations: (studentId?: string) => Registration[];
  registerForEvent: (
    eventId: string,
    student: RegisterStudentParams
  ) => Promise<{ success: boolean; error?: string; ticketCode?: string }>;
  cancelRegistration: (
    eventId: string,
    studentId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const STORAGE_KEYS = {
  EVENTS: 'campusconnect_events_v1',
  REGISTRATIONS: 'campusconnect_registrations_v1',
};

// Default seed registration for testing
const INITIAL_MOCK_REGISTRATIONS: Registration[] = [
  {
    id: 'reg_mock_01',
    eventId: 'evt_1',
    studentId: 'usr_student_01',
    studentName: 'Prathik Kumar',
    studentRollNumber: 'MCA2024042',
    studentDepartment: 'MCA',
    eventTitle: 'HackCampus 2026: 24-Hour National Hackathon',
    eventCategory: 'Technical',
    eventStartDate: '2026-10-15T09:00:00.000Z',
    eventVenue: 'Campus Main Auditorium & Advanced Computing Lab 4',
    organizerName: 'Coding & Robotics Club',
    registrationDate: '2026-10-01T10:00:00.000Z',
    status: 'registered',
    ticketCode: 'CC-TECH-84920',
  },
  {
    id: 'reg_mock_02',
    eventId: 'evt_3',
    studentId: 'usr_student_01',
    studentName: 'Prathik Kumar',
    studentRollNumber: 'MCA2024042',
    studentDepartment: 'MCA',
    eventTitle: 'Hands-on Cloud & Containerization Masterclass',
    eventCategory: 'Workshop',
    eventStartDate: '2026-10-28T14:00:00.000Z',
    eventVenue: 'Department of Computer Applications - Lab 3',
    organizerName: 'Dept of Computer Applications (MCA)',
    registrationDate: '2026-10-02T11:15:00.000Z',
    status: 'registered',
    ticketCode: 'CC-WORK-19342',
  },
];

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_MOCK_EVENTS);
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_MOCK_REGISTRATIONS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and restore state from local storage
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedEvents = await appStorage.getItem(STORAGE_KEYS.EVENTS);
        const storedRegistrations = await appStorage.getItem(STORAGE_KEYS.REGISTRATIONS);

        if (storedEvents) {
          const parsed = JSON.parse(storedEvents);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEvents(parsed);
          }
        } else {
          await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_MOCK_EVENTS));
        }

        if (storedRegistrations) {
          const parsedRegs = JSON.parse(storedRegistrations);
          if (Array.isArray(parsedRegs)) {
            setRegistrations(parsedRegs);
          }
        } else {
          await appStorage.setItem(
            STORAGE_KEYS.REGISTRATIONS,
            JSON.stringify(INITIAL_MOCK_REGISTRATIONS)
          );
        }
      } catch (err) {
        console.warn('[EventContext] Error restoring events cache:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredData();
  }, []);

  const refreshEvents = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulates fetching latest events from server
      await new Promise((resolve) => setTimeout(resolve, 400));
      const storedEvents = await appStorage.getItem(STORAGE_KEYS.EVENTS);
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getEventById = (id: string): CampusEvent | undefined => {
    return events.find((evt) => evt.id === id);
  };

  const isRegistered = (eventId: string, studentId: string = 'usr_student_01'): boolean => {
    return registrations.some(
      (r) => r.eventId === eventId && r.studentId === studentId && r.status === 'registered'
    );
  };

  const getRegistration = (
    eventId: string,
    studentId: string = 'usr_student_01'
  ): Registration | undefined => {
    return registrations.find(
      (r) => r.eventId === eventId && r.studentId === studentId && r.status === 'registered'
    );
  };

  const getStudentRegistrations = (studentId: string = 'usr_student_01'): Registration[] => {
    return registrations.filter(
      (r) => r.studentId === studentId && r.status === 'registered'
    );
  };

  const registerForEvent = async (
    eventId: string,
    student: RegisterStudentParams
  ): Promise<{ success: boolean; error?: string; ticketCode?: string }> => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) {
      return { success: false, error: 'Event not found.' };
    }

    // Capacity verification
    if (targetEvent.registeredCount >= targetEvent.maxCapacity) {
      return {
        success: false,
        error: 'This event has reached full capacity. No seats available.',
      };
    }

    // Duplicate registration verification
    const alreadyRegistered = registrations.some(
      (r) => r.eventId === eventId && r.studentId === student.id && r.status === 'registered'
    );
    if (alreadyRegistered) {
      return {
        success: false,
        error: 'You have already registered for this event. Check My Tickets.',
      };
    }

    // Generate unique verifiable ticket code (e.g. CC-TECH-78321)
    const categoryPrefix = targetEvent.category.substring(0, 4).toUpperCase();
    const uniqueNumber = Math.floor(10000 + Math.random() * 90000);
    const ticketCode = `CC-${categoryPrefix}-${uniqueNumber}`;

    const newRegistration: Registration = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventId,
      studentId: student.id,
      studentName: student.name,
      studentRollNumber: student.rollNumber,
      studentDepartment: student.department,
      eventTitle: targetEvent.title,
      eventCategory: targetEvent.category,
      eventStartDate: targetEvent.startDate,
      eventVenue: targetEvent.venue,
      organizerName: targetEvent.organizerName,
      registrationDate: new Date().toISOString(),
      status: 'registered',
      ticketCode,
    };

    // Update event registered count atomically
    const updatedEvents = events.map((e) =>
      e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
    );

    const updatedRegistrations = [newRegistration, ...registrations];

    setEvents(updatedEvents);
    setRegistrations(updatedRegistrations);

    await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
    await appStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updatedRegistrations));

    return { success: true, ticketCode };
  };

  const cancelRegistration = async (
    eventId: string,
    studentId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const existingRegistration = registrations.find(
      (r) => r.eventId === eventId && r.studentId === studentId && r.status === 'registered'
    );

    if (!existingRegistration) {
      return { success: false, error: 'Registration record not found.' };
    }

    // Decrement event registered count safely
    const updatedEvents = events.map((e) =>
      e.id === eventId
        ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) }
        : e
    );

    // Remove or mark cancelled
    const updatedRegistrations = registrations.filter(
      (r) => !(r.eventId === eventId && r.studentId === studentId)
    );

    setEvents(updatedEvents);
    setRegistrations(updatedRegistrations);

    await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
    await appStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updatedRegistrations));

    return { success: true };
  };

  return (
    <EventContext.Provider
      value={{
        events,
        registrations,
        isLoading,
        refreshEvents,
        getEventById,
        isRegistered,
        getRegistration,
        getStudentRegistrations,
        registerForEvent,
        cancelRegistration,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
