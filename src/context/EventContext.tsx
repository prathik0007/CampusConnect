import React, { createContext, useContext, useEffect, useState } from 'react';
import { CampusEvent, Registration } from '@/types';
import { INITIAL_MOCK_EVENTS } from '@/data/mockEvents';
import { appStorage } from '@/utils/storage';
import { useAuth } from '@/context/AuthContext';
import { eventApi, registrationApi } from '@/services/api';

interface RegisterStudentParams {
  id: string;
  name: string;
  email?: string;
  rollNumber?: string;
  department?: string;
}

export type CreateEventInput = Omit<CampusEvent, 'id' | 'registeredCount' | 'createdAt'>;

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
  // Organizer Operations
  createEvent: (
    eventData: CreateEventInput
  ) => Promise<{ success: boolean; event?: CampusEvent; error?: string }>;
  updateEvent: (
    id: string,
    updatedFields: Partial<CampusEvent>
  ) => Promise<{ success: boolean; error?: string }>;
  cancelOrDeleteEvent: (
    id: string
  ) => Promise<{ success: boolean; action: 'cancelled' | 'deleted'; error?: string }>;
  markAttendance: (
    registrationId: string,
    attended: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  getAttendeesForEvent: (eventId: string) => Registration[];
  fetchAttendeesForEvent: (eventId: string) => Promise<Registration[]>;
}


const STORAGE_KEYS = {
  EVENTS: 'campusconnect_events_v2',
  REGISTRATIONS: 'campusconnect_registrations_v2',
};

// Seed registrations for testing both student pass viewing and organizer attendee rosters
const INITIAL_MOCK_REGISTRATIONS: Registration[] = [
  {
    id: 'reg_mock_01',
    eventId: 'evt_1',
    studentId: 'usr_student_01',
    studentName: 'Prathik Kumar',
    studentEmail: 'student@campus.edu',
    studentRollNumber: 'MCA2024042',
    studentDepartment: 'MCA',
    eventTitle: 'HackCampus 2026: 24-Hour National Hackathon',
    eventCategory: 'Technical',
    eventStartDate: '2026-10-15T09:00:00.000Z',
    eventVenue: 'Campus Main Auditorium & Advanced Computing Lab 4',
    organizerName: 'Coding & Robotics Club',
    registrationDate: '2026-10-01T10:00:00.000Z',
    status: 'attended',
    ticketCode: 'CC-TECH-84920',
    attendedAt: '2026-10-15T09:15:00.000Z',
  },
  {
    id: 'reg_mock_02',
    eventId: 'evt_1',
    studentId: 'usr_student_02',
    studentName: 'Sneha Rao',
    studentEmail: 'sneha.rao@campus.edu',
    studentRollNumber: 'MCA2024018',
    studentDepartment: 'MCA',
    eventTitle: 'HackCampus 2026: 24-Hour National Hackathon',
    eventCategory: 'Technical',
    eventStartDate: '2026-10-15T09:00:00.000Z',
    eventVenue: 'Campus Main Auditorium & Advanced Computing Lab 4',
    organizerName: 'Coding & Robotics Club',
    registrationDate: '2026-10-01T11:20:00.000Z',
    status: 'registered',
    ticketCode: 'CC-TECH-84921',
  },
  {
    id: 'reg_mock_03',
    eventId: 'evt_1',
    studentId: 'usr_student_03',
    studentName: 'Aditya Sharma',
    studentEmail: 'aditya.sharma@campus.edu',
    studentRollNumber: 'MCA2024005',
    studentDepartment: 'MCA',
    eventTitle: 'HackCampus 2026: 24-Hour National Hackathon',
    eventCategory: 'Technical',
    eventStartDate: '2026-10-15T09:00:00.000Z',
    eventVenue: 'Campus Main Auditorium & Advanced Computing Lab 4',
    organizerName: 'Coding & Robotics Club',
    registrationDate: '2026-10-01T12:05:00.000Z',
    status: 'attended',
    ticketCode: 'CC-TECH-84922',
    attendedAt: '2026-10-15T09:20:00.000Z',
  },
  {
    id: 'reg_mock_04',
    eventId: 'evt_3',
    studentId: 'usr_student_01',
    studentName: 'Prathik Kumar',
    studentEmail: 'student@campus.edu',
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
  {
    id: 'reg_mock_05',
    eventId: 'evt_3',
    studentId: 'usr_student_04',
    studentName: 'Ananya Verma',
    studentEmail: 'ananya.v@campus.edu',
    studentRollNumber: 'BTECH2023102',
    studentDepartment: 'CSE',
    eventTitle: 'Hands-on Cloud & Containerization Masterclass',
    eventCategory: 'Workshop',
    eventStartDate: '2026-10-28T14:00:00.000Z',
    eventVenue: 'Department of Computer Applications - Lab 3',
    organizerName: 'Dept of Computer Applications (MCA)',
    registrationDate: '2026-10-02T12:40:00.000Z',
    status: 'registered',
    ticketCode: 'CC-WORK-19343',
  },
  {
    id: 'reg_mock_06',
    eventId: 'evt_3',
    studentId: 'usr_student_05',
    studentName: 'Rahul Deshmukh',
    studentEmail: 'rahul.d@campus.edu',
    studentRollNumber: 'BTECH2023089',
    studentDepartment: 'ISE',
    eventTitle: 'Hands-on Cloud & Containerization Masterclass',
    eventCategory: 'Workshop',
    eventStartDate: '2026-10-28T14:00:00.000Z',
    eventVenue: 'Department of Computer Applications - Lab 3',
    organizerName: 'Dept of Computer Applications (MCA)',
    registrationDate: '2026-10-02T14:00:00.000Z',
    status: 'attended',
    ticketCode: 'CC-WORK-19344',
    attendedAt: '2026-10-28T14:05:00.000Z',
  },
];

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_MOCK_EVENTS);
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_MOCK_REGISTRATIONS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and restore state from local storage and backend API
  useEffect(() => {
    async function loadStoredData() {
      try {
        // 1. Initial cached render from local storage for fast response
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

        // 2. Fetch live events from real MongoDB backend
        const res = await eventApi.getEvents({ limit: 50 }, token);
        if (res.success && res.data?.events && res.data.events.length > 0) {
          setEvents(res.data.events);
          await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(res.data.events));
        }

        // 3. If authenticated as student, fetch real MongoDB tickets/registrations
        if (token && user?.role === 'student') {
          const regRes = await registrationApi.getMyRegistrations(token);
          if (regRes.success && regRes.data?.registrations) {
            setRegistrations(regRes.data.registrations);
            await appStorage.setItem(
              STORAGE_KEYS.REGISTRATIONS,
              JSON.stringify(regRes.data.registrations)
            );
          }
        }
      } catch (err) {
        console.warn('[EventContext] Error loading events from backend:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredData();
  }, [token, user?.role]);

  const refreshEvents = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await eventApi.getEvents({ limit: 50 }, token);
      if (res.success && res.data?.events) {
        setEvents(res.data.events);
        await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(res.data.events));
      } else {
        const storedEvents = await appStorage.getItem(STORAGE_KEYS.EVENTS);
        if (storedEvents) {
          setEvents(JSON.parse(storedEvents));
        }
      }

      if (token && user?.role === 'student') {
        const regRes = await registrationApi.getMyRegistrations(token);
        if (regRes.success && regRes.data?.registrations) {
          setRegistrations(regRes.data.registrations);
          await appStorage.setItem(
            STORAGE_KEYS.REGISTRATIONS,
            JSON.stringify(regRes.data.registrations)
          );
        }
      }
    } catch (err) {
      console.warn('[EventContext] Refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventById = (id: string): CampusEvent | undefined => {
    return events.find((evt) => evt.id === id);
  };

  const isRegistered = (eventId: string, studentId: string = 'usr_student_01'): boolean => {
    return registrations.some(
      (r) =>
        r.eventId === eventId &&
        r.studentId === studentId &&
        (r.status === 'registered' || r.status === 'attended')
    );
  };

  const getRegistration = (
    eventId: string,
    studentId: string = 'usr_student_01'
  ): Registration | undefined => {
    return registrations.find(
      (r) =>
        r.eventId === eventId &&
        r.studentId === studentId &&
        (r.status === 'registered' || r.status === 'attended')
    );
  };

  const getStudentRegistrations = (studentId: string = 'usr_student_01'): Registration[] => {
    return registrations.filter(
      (r) => r.studentId === studentId && (r.status === 'registered' || r.status === 'attended')
    );
  };

  const registerForEvent = async (
    eventId: string,
    student: RegisterStudentParams
  ): Promise<{ success: boolean; error?: string; ticketCode?: string }> => {
    try {
      if (token && eventId.length === 24) {
        const res = await registrationApi.registerForEvent(eventId, token);
        if (res.success && res.data) {
          const newReg = res.data.registration;
          const ticketCode = res.data.ticketCode;

          // Update registrations list
          const updatedRegistrations = [
            newReg,
            ...registrations.filter((r) => r.eventId !== eventId),
          ];
          setRegistrations(updatedRegistrations);
          await appStorage.setItem(
            STORAGE_KEYS.REGISTRATIONS,
            JSON.stringify(updatedRegistrations)
          );

          // Update event registered count in state
          const updatedEvents = events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  registeredCount: res.data?.event?.registeredCount ?? e.registeredCount + 1,
                }
              : e
          );
          setEvents(updatedEvents);
          await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));

          return { success: true, ticketCode };
        } else {
          return { success: false, error: res.message || 'Registration failed' };
        }
      }

      // Offline / fallback verification
      const targetEvent = events.find((e) => e.id === eventId);
      if (!targetEvent) {
        return { success: false, error: 'Event not found.' };
      }

      if (targetEvent.status === 'cancelled') {
        return { success: false, error: 'This event has been cancelled by the organizer.' };
      }

      if (targetEvent.registeredCount >= targetEvent.maxCapacity) {
        return {
          success: false,
          error: 'This event has reached full capacity. No seats available.',
        };
      }

      const alreadyRegistered = registrations.some(
        (r) =>
          r.eventId === eventId &&
          r.studentId === student.id &&
          (r.status === 'registered' || r.status === 'attended')
      );
      if (alreadyRegistered) {
        return {
          success: false,
          error: 'You are already registered for this event. Check My Tickets.',
        };
      }

      const ticketCode = `CC-MOCK-${Math.floor(1000 + Math.random() * 9000)}`;

      const newRegistration: Registration = {
        id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email || `${student.name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
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

      const updatedEvents = events.map((e) =>
        e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
      );

      const updatedRegistrations = [newRegistration, ...registrations];

      setEvents(updatedEvents);
      setRegistrations(updatedRegistrations);

      await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
      await appStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updatedRegistrations));

      return { success: true, ticketCode };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const cancelRegistration = async (
    eventId: string,
    studentId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (token && eventId.length === 24) {
        const res = await registrationApi.cancelRegistration(eventId, token);
        if (res.success) {
          const updatedRegistrations = registrations.map((r) =>
            r.eventId === eventId ? { ...r, status: 'cancelled' as const } : r
          );
          setRegistrations(updatedRegistrations);
          await appStorage.setItem(
            STORAGE_KEYS.REGISTRATIONS,
            JSON.stringify(updatedRegistrations)
          );

          const updatedEvents = events.map((e) =>
            e.id === eventId
              ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) }
              : e
          );
          setEvents(updatedEvents);
          await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));

          return { success: true };
        } else {
          return { success: false, error: res.message || 'Failed to cancel registration' };
        }
      }

      const existingRegistration = registrations.find(
        (r) =>
          r.eventId === eventId &&
          r.studentId === studentId &&
          (r.status === 'registered' || r.status === 'attended')
      );

      if (!existingRegistration) {
        return { success: false, error: 'Registration record not found.' };
      }

      const updatedEvents = events.map((e) =>
        e.id === eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e
      );

      const updatedRegistrations = registrations.map((r) =>
        r.eventId === eventId && r.studentId === studentId
          ? { ...r, status: 'cancelled' as const }
          : r
      );

      setEvents(updatedEvents);
      setRegistrations(updatedRegistrations);

      await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
      await appStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updatedRegistrations));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to cancel registration.' };
    }
  };


  // -------------------------------------------------------------
  // Organizer Operations
  // -------------------------------------------------------------

  const createEvent = async (
    eventData: CreateEventInput
  ): Promise<{ success: boolean; event?: CampusEvent; error?: string }> => {
    try {
      if (token) {
        const res = await eventApi.createEvent(
          {
            title: eventData.title,
            description: eventData.description,
            category: eventData.category,
            bannerUrl: eventData.bannerUrl,
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            venue: eventData.venue,
            maxCapacity: eventData.maxCapacity,
            status: eventData.status === 'draft' ? 'draft' : 'published',
          },
          token
        );

        if (res.success && res.data?.event) {
          const created = res.data.event;
          const updatedEvents = [created, ...events];
          setEvents(updatedEvents);
          await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
          return { success: true, event: created };
        } else {
          return { success: false, error: res.message || 'Failed to create event on server.' };
        }
      }

      // Offline / fallback creation
      const newEvent: CampusEvent = {
        ...eventData,
        id: `evt_${Date.now()}`,
        registeredCount: 0,
        createdAt: new Date().toISOString(),
      };

      const updatedEvents = [newEvent, ...events];
      setEvents(updatedEvents);
      await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));

      return { success: true, event: newEvent };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create event.' };
    }
  };

  const updateEvent = async (
    id: string,
    updatedFields: Partial<CampusEvent>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (token && id.length === 24) {
        const res = await eventApi.updateEvent(
          id,
          {
            title: updatedFields.title,
            description: updatedFields.description,
            category: updatedFields.category,
            bannerUrl: updatedFields.bannerUrl,
            startDate: updatedFields.startDate,
            endDate: updatedFields.endDate,
            venue: updatedFields.venue,
            maxCapacity: updatedFields.maxCapacity,
            status: updatedFields.status,
          },
          token
        );

        if (!res.success) {
          return { success: false, error: res.message || 'Failed to update event on server.' };
        }
      }

      const targetIndex = events.findIndex((e) => e.id === id);
      if (targetIndex === -1) {
        return { success: false, error: 'Event not found.' };
      }

      const updatedEvent: CampusEvent = {
        ...events[targetIndex],
        ...updatedFields,
      };

      const updatedEvents = [...events];
      updatedEvents[targetIndex] = updatedEvent;

      // Also sync event title/venue across existing registrations if updated
      const updatedRegistrations = registrations.map((r) =>
        r.eventId === id
          ? {
              ...r,
              eventTitle: updatedFields.title || r.eventTitle,
              eventVenue: updatedFields.venue || r.eventVenue,
              eventStartDate: updatedFields.startDate || r.eventStartDate,
              eventCategory: updatedFields.category || r.eventCategory,
            }
          : r
      );

      setEvents(updatedEvents);
      setRegistrations(updatedRegistrations);

      await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
      await appStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updatedRegistrations));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update event.' };
    }
  };

  const cancelOrDeleteEvent = async (
    id: string
  ): Promise<{ success: boolean; action: 'cancelled' | 'deleted'; error?: string }> => {
    try {
      if (token && id.length === 24) {
        const res = await eventApi.cancelEvent(id, token);
        if (!res.success) {
          return {
            success: false,
            action: 'cancelled',
            error: res.message || 'Failed to cancel event on server.',
          };
        }
      }

      const targetEvent = events.find((e) => e.id === id);
      if (!targetEvent) {
        return { success: false, action: 'cancelled', error: 'Event not found.' };
      }

      // Safe cancellation: mark as cancelled instead of permanently deleting
      const updatedEvents = events.map((e) =>
        e.id === id ? { ...e, status: 'cancelled' as const } : e
      );
      setEvents(updatedEvents);
      await appStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
      return { success: true, action: 'cancelled' };
    } catch (err: any) {
      return { success: false, action: 'cancelled', error: err.message || 'Action failed.' };
    }
  };


  const markAttendance = async (
    registrationId: string,
    attended: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const reg = registrations.find((r) => r.id === registrationId);
      if (token && reg && reg.eventId?.length === 24 && reg.studentId?.length === 24) {
        const newStatus = attended ? 'attended' : 'registered';
        const res = await registrationApi.updateAttendance(
          reg.eventId,
          reg.studentId,
          newStatus,
          token
        );
        if (!res.success) {
          return { success: false, error: res.message || 'Failed to update attendance on server' };
        }
      }

      const updatedRegistrations = registrations.map((r) =>
        r.id === registrationId
          ? {
              ...r,
              status: attended ? ('attended' as const) : ('registered' as const),
              attendedAt: attended ? new Date().toISOString() : undefined,
            }
          : r
      );

      setRegistrations(updatedRegistrations);
      await appStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updatedRegistrations));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update attendance.' };
    }
  };

  const getAttendeesForEvent = (eventId: string): Registration[] => {
    return registrations.filter((r) => r.eventId === eventId);
  };

  const fetchAttendeesForEvent = async (eventId: string): Promise<Registration[]> => {
    try {
      if (token && eventId.length === 24) {
        const res = await registrationApi.getEventAttendees(eventId, token);
        if (res.success && res.data?.attendees) {
          const liveAttendees = res.data.attendees;
          const otherRegs = registrations.filter((r) => r.eventId !== eventId);
          const merged = [...liveAttendees, ...otherRegs];
          setRegistrations(merged);
          await appStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(merged));
          return liveAttendees;
        }
      }
    } catch (err) {
      console.warn('[EventContext] Error fetching attendees from server:', err);
    }
    return registrations.filter((r) => r.eventId === eventId);
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
        createEvent,
        updateEvent,
        cancelOrDeleteEvent,
        markAttendance,
        getAttendeesForEvent,
        fetchAttendeesForEvent,
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
