package com.prathik.campusconnect.data

import com.prathik.campusconnect.model.Event
import com.prathik.campusconnect.model.EventStatus
import com.prathik.campusconnect.model.Notification
import com.prathik.campusconnect.model.NotificationType
import com.prathik.campusconnect.model.Registration
import com.prathik.campusconnect.model.RegistrationStatus
import com.prathik.campusconnect.model.User
import com.prathik.campusconnect.model.UserRole

object DummyData {

    val demoStudent = User(
        id = "std_101",
        name = "Alex Johnson",
        email = "student@campusconnect.com",
        role = UserRole.STUDENT
    )

    val demoOrganizer = User(
        id = "org_201",
        name = "Campus Events Council",
        email = "organizer@campusconnect.com",
        role = UserRole.ORGANIZER
    )

    val sampleCategories = listOf("All", "Tech", "Cultural", "Sports", "Workshops", "Academic")

    val sampleEvents = listOf(
        Event(
            id = "evt_01",
            title = "Annual Hackathon 2025",
            description = "A 24-hour coding challenge for developers, designers, and innovators to solve real-world campus problems.",
            category = "Tech",
            location = "Main Auditorium & Innovation Lab",
            startDate = "Oct 25, 2025 - 09:00 AM",
            endDate = "Oct 26, 2025 - 09:00 AM",
            capacity = 150,
            registeredCount = 112,
            imageUrl = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
            organizerId = "org_201",
            status = EventStatus.UPCOMING
        ),
        Event(
            id = "evt_02",
            title = "Campus Cultural Fest: Resonance",
            description = "An evening of music, dance, art, and drama showcasing the diverse artistic talents on campus.",
            category = "Cultural",
            location = "Open Air Theatre",
            startDate = "Nov 02, 2025 - 05:00 PM",
            endDate = "Nov 02, 2025 - 10:00 PM",
            capacity = 500,
            registeredCount = 340,
            imageUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
            organizerId = "org_201",
            status = EventStatus.UPCOMING
        ),
        Event(
            id = "evt_03",
            title = "AI & Machine Learning Workshop",
            description = "Hands-on session covering basics of neural networks, LLMs, and building Compose AI apps.",
            category = "Workshops",
            location = "CS Block Hall 3",
            startDate = "Nov 10, 2025 - 02:00 PM",
            endDate = "Nov 10, 2025 - 05:00 PM",
            capacity = 60,
            registeredCount = 60,
            imageUrl = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
            organizerId = "org_201",
            status = EventStatus.UPCOMING
        ),
        Event(
            id = "evt_04",
            title = "Inter-College Football Tournament",
            description = "Annual sports tournament with top teams competing for the coveted Championship Trophy.",
            category = "Sports",
            location = "Sports Complex Ground",
            startDate = "Nov 18, 2025 - 08:00 AM",
            endDate = "Nov 20, 2025 - 06:00 PM",
            capacity = 200,
            registeredCount = 85,
            imageUrl = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
            organizerId = "org_201",
            status = EventStatus.UPCOMING
        )
    )

    val sampleRegistrations = listOf(
        Registration(
            id = "reg_1001",
            eventId = "evt_01",
            studentId = "std_101",
            ticketCode = "TKT-HACK-8839",
            status = RegistrationStatus.CONFIRMED,
            attended = false
        ),
        Registration(
            id = "reg_1002",
            eventId = "evt_02",
            studentId = "std_101",
            ticketCode = "TKT-FEST-4421",
            status = RegistrationStatus.CONFIRMED,
            attended = false
        )
    )

    val sampleNotifications = listOf(
        Notification(
            id = "notif_01",
            title = "Registration Confirmed!",
            message = "You have successfully registered for Annual Hackathon 2025.",
            type = NotificationType.REGISTRATION,
            isRead = false
        ),
        Notification(
            id = "notif_02",
            title = "Venue Update",
            message = "AI Workshop will take place in CS Block Hall 3.",
            type = NotificationType.EVENT_UPDATE,
            isRead = true
        )
    )
}
