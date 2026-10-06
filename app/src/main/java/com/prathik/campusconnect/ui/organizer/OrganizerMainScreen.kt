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
import com.prathik.campusconnect.model.Event
import com.prathik.campusconnect.model.User
import com.prathik.campusconnect.navigation.Screen
import com.prathik.campusconnect.navigation.organizerBottomNavItems
import com.prathik.campusconnect.ui.components.CampusTopBar
import com.prathik.campusconnect.ui.components.OrganizerBottomNavBar
import com.prathik.campusconnect.ui.notifications.NotificationScreen
import com.prathik.campusconnect.viewmodel.AuthViewModel
import com.prathik.campusconnect.viewmodel.EventViewModel
import com.prathik.campusconnect.viewmodel.NotificationViewModel
import com.prathik.campusconnect.viewmodel.RegistrationViewModel

@Composable
fun OrganizerMainScreen(
    user: User,
    authViewModel: AuthViewModel,
    eventViewModel: EventViewModel,
    registrationViewModel: RegistrationViewModel,
    notificationViewModel: NotificationViewModel,
    modifier: Modifier = Modifier
) {
    var currentScreen by remember { mutableStateOf<Screen>(Screen.OrganizerDashboard) }
    var editingEvent by remember { mutableStateOf<Event?>(null) }
    var isNotificationCenterOpen by remember { mutableStateOf(false) }

    val uiState by eventViewModel.uiState.collectAsState()
    val notifUiState by notificationViewModel.uiState.collectAsState()

    if (isNotificationCenterOpen) {
        NotificationScreen(
            notificationViewModel = notificationViewModel,
            onBackClick = { isNotificationCenterOpen = false },
            onNavigateToEvent = {
                isNotificationCenterOpen = false
            },
            modifier = modifier
        )
    } else if (editingEvent != null) {
        EditEventScreen(
            event = editingEvent!!,
            eventViewModel = eventViewModel,
            onBackClick = { editingEvent = null },
            modifier = modifier
        )
    } else {
        Scaffold(
            modifier = modifier,
            topBar = {
                CampusTopBar(
                    title = "CampusConnect",
                    roleTitle = "Organizer • ${currentScreen.title}",
                    unreadNotificationCount = notifUiState.unreadCount,
                    onNotificationBellClick = { isNotificationCenterOpen = true }
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
                    onEditEventClick = { event -> editingEvent = event },
                    onDeleteEventClick = { eventId -> eventViewModel.deleteEvent(eventId) },
                    modifier = screenModifier
                )
                Screen.CreateEvent -> CreateEventScreen(
                    user = user,
                    uiState = uiState,
                    onCreateEventWithImage = { context, imageUri, title, description, category, location, startDate, endDate, capacity ->
                        eventViewModel.createEventWithImage(
                            context = context,
                            imageUri = imageUri,
                            title = title,
                            description = description,
                            category = category,
                            location = location,
                            startDate = startDate,
                            endDate = endDate,
                            capacity = capacity
                        )
                    },
                    onEventCreatedSuccessfully = {
                        eventViewModel.clearActionMessages()
                        currentScreen = Screen.OrganizerEvents
                    },
                    modifier = screenModifier
                )
                Screen.Attendees -> AttendeesScreen(
                    eventViewModel = eventViewModel,
                    registrationViewModel = registrationViewModel,
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
}
