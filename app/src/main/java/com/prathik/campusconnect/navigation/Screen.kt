package com.prathik.campusconnect.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.ConfirmationNumber
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Person
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector? = null) {
    // Auth
    object Login : Screen("login", "Login")

    // Student Screens
    object StudentHome : Screen("student_home", "Home", Icons.Default.Home)
    object StudentEvents : Screen("student_events", "Events", Icons.Default.Event)
    object StudentCalendar : Screen("student_calendar", "Calendar", Icons.Default.CalendarMonth)
    object StudentTickets : Screen("student_tickets", "My Tickets", Icons.Default.ConfirmationNumber)
    object StudentProfile : Screen("student_profile", "Profile", Icons.Default.Person)

    // Organizer Screens
    object OrganizerDashboard : Screen("organizer_dashboard", "Dashboard", Icons.Default.Dashboard)
    object OrganizerEvents : Screen("organizer_events", "My Events", Icons.Default.Event)
    object CreateEvent : Screen("create_event", "Create Event", Icons.Default.AddCircle)
    object Attendees : Screen("attendees", "Attendees", Icons.Default.People)
    object OrganizerProfile : Screen("organizer_profile", "Profile", Icons.Default.Person)
}

val studentBottomNavItems = listOf(
    Screen.StudentHome,
    Screen.StudentEvents,
    Screen.StudentCalendar,
    Screen.StudentTickets,
    Screen.StudentProfile
)

val organizerBottomNavItems = listOf(
    Screen.OrganizerDashboard,
    Screen.OrganizerEvents,
    Screen.CreateEvent,
    Screen.Attendees,
    Screen.OrganizerProfile
)
