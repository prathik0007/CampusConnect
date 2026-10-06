package com.prathik.campusconnect.ui.organizer

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.prathik.campusconnect.model.User
import com.prathik.campusconnect.navigation.Screen
import com.prathik.campusconnect.navigation.organizerBottomNavItems
import com.prathik.campusconnect.ui.components.CampusTopBar
import com.prathik.campusconnect.ui.components.OrganizerBottomNavBar
import com.prathik.campusconnect.viewmodel.AuthViewModel
import com.prathik.campusconnect.viewmodel.EventViewModel

@Composable
fun OrganizerMainScreen(
    user: User,
    authViewModel: AuthViewModel,
    eventViewModel: EventViewModel,
    modifier: Modifier = Modifier
) {
    var currentScreen by remember { mutableStateOf<Screen>(Screen.OrganizerDashboard) }
    val uiState by eventViewModel.uiState.collectAsState()

    Scaffold(
        modifier = modifier,
        topBar = {
            CampusTopBar(
                title = "CampusConnect",
                roleTitle = "Organizer • ${currentScreen.title}"
            )
        },
        bottomBar = {
            OrganizerBottomNavBar(
                currentRoute = currentScreen.route,
                items = organizerBottomNavItems,
                onItemClick = { screen -> currentScreen = screen }
            )
        }
    ) { innerPadding ->
        val screenModifier = Modifier.padding(innerPadding)
        when (currentScreen) {
            Screen.OrganizerDashboard -> OrganizerDashboardScreen(
                user = user,
                uiState = uiState,
                onNavigateToCreateEvent = { currentScreen = Screen.CreateEvent },
                onNavigateToMyEvents = { currentScreen = Screen.OrganizerEvents },
                onNavigateToAttendees = { currentScreen = Screen.Attendees },
                modifier = screenModifier
            )
            Screen.OrganizerEvents -> OrganizerEventsScreen(
                user = user,
                uiState = uiState,
                onAddEventClick = { currentScreen = Screen.CreateEvent },
                modifier = screenModifier
            )
            Screen.CreateEvent -> CreateEventScreen(
                user = user,
                uiState = uiState,
                onCreateEvent = { title, description, category, location, startDate, endDate, capacity, organizerId ->
                    eventViewModel.createEvent(
                        title = title,
                        description = description,
                        category = category,
                        location = location,
                        startDate = startDate,
                        endDate = endDate,
                        capacity = capacity,
                        organizerId = organizerId
                    )
                },
                onEventCreatedSuccessfully = {
                    eventViewModel.resetCreationSuccess()
                    currentScreen = Screen.OrganizerEvents
                },
                modifier = screenModifier
            )
            Screen.Attendees -> AttendeesScreen(
                uiState = uiState,
                modifier = screenModifier
            )
            Screen.OrganizerProfile -> OrganizerProfileScreen(
                user = user,
                onLogoutClick = { authViewModel.logout() },
                modifier = screenModifier
            )
            else -> OrganizerDashboardScreen(
                user = user,
                uiState = uiState,
                onNavigateToCreateEvent = { currentScreen = Screen.CreateEvent },
                onNavigateToMyEvents = { currentScreen = Screen.OrganizerEvents },
                onNavigateToAttendees = { currentScreen = Screen.Attendees },
                modifier = screenModifier
            )
        }
    }
}
