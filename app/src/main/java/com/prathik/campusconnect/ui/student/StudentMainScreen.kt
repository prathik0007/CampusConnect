package com.prathik.campusconnect.ui.student

import android.widget.Toast
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.prathik.campusconnect.model.User
import com.prathik.campusconnect.navigation.Screen
import com.prathik.campusconnect.navigation.studentBottomNavItems
import com.prathik.campusconnect.ui.components.CampusTopBar
import com.prathik.campusconnect.ui.components.StudentBottomNavBar
import com.prathik.campusconnect.ui.notifications.NotificationScreen
import com.prathik.campusconnect.viewmodel.AuthViewModel
import com.prathik.campusconnect.viewmodel.EventViewModel
import com.prathik.campusconnect.viewmodel.NotificationViewModel
import com.prathik.campusconnect.viewmodel.RegistrationViewModel

@Composable
fun StudentMainScreen(
    user: User,
    authViewModel: AuthViewModel,
    eventViewModel: EventViewModel,
    registrationViewModel: RegistrationViewModel,
    notificationViewModel: NotificationViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    var currentScreen by remember { mutableStateOf<Screen>(Screen.StudentHome) }
    var selectedDetailEventId by remember { mutableStateOf<String?>(null) }
    var isNotificationCenterOpen by remember { mutableStateOf(false) }

    val uiState by eventViewModel.uiState.collectAsState()
    val regUiState by registrationViewModel.uiState.collectAsState()
    val notifUiState by notificationViewModel.uiState.collectAsState()

    LaunchedEffect(regUiState.actionMessage) {
        regUiState.actionMessage?.let { msg ->
            Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
            registrationViewModel.clearMessages()
        }
    }

    LaunchedEffect(regUiState.actionError) {
        regUiState.actionError?.let { err ->
            Toast.makeText(context, err, Toast.LENGTH_LONG).show()
            registrationViewModel.clearMessages()
        }
    }

    if (isNotificationCenterOpen) {
        NotificationScreen(
            notificationViewModel = notificationViewModel,
            onBackClick = { isNotificationCenterOpen = false },
            onNavigateToEvent = { eventId ->
                isNotificationCenterOpen = false
                if (eventId != null) {
                    selectedDetailEventId = eventId
                }
            },
            modifier = modifier
        )
    } else if (selectedDetailEventId != null) {
        EventDetailsScreen(
            eventId = selectedDetailEventId!!,
            eventViewModel = eventViewModel,
            registrationViewModel = registrationViewModel,
            onBackClick = { selectedDetailEventId = null },
            modifier = modifier
        )
    } else {
        Scaffold(
            modifier = modifier,
            topBar = {
                CampusTopBar(
                    title = "CampusConnect",
                    roleTitle = "Student • ${currentScreen.title}",
                    unreadNotificationCount = notifUiState.unreadCount,
                    onNotificationBellClick = { isNotificationCenterOpen = true }
                )
            },
            bottomBar = {
                StudentBottomNavBar(
                    currentRoute = currentScreen.route,
                    items = studentBottomNavItems,
                    onItemClick = { screen -> currentScreen = screen }
                )
            }
        ) { innerPadding ->
            val screenModifier = Modifier.padding(innerPadding)
            when (currentScreen) {
                Screen.StudentHome -> StudentHomeScreen(
                    user = user,
                    uiState = uiState,
                    onNavigateToEvents = { currentScreen = Screen.StudentEvents },
                    onNavigateToTickets = { currentScreen = Screen.StudentTickets },
                    onRegisterEvent = { eventId ->
                        registrationViewModel.registerForEvent(eventId) {
                            eventViewModel.loadEvents()
                        }
                    },
                    onEventClick = { eventId -> selectedDetailEventId = eventId },
                    modifier = screenModifier
                )
                Screen.StudentEvents -> StudentEventsScreen(
                    user = user,
                    uiState = uiState,
                    onSearchQueryChange = { query -> eventViewModel.updateSearchQuery(query) },
                    onCategorySelect = { cat -> eventViewModel.selectCategory(cat) },
                    onRegisterEvent = { eventId ->
                        registrationViewModel.registerForEvent(eventId) {
                            eventViewModel.loadEvents()
                        }
                    },
                    onEventClick = { eventId -> selectedDetailEventId = eventId },
                    modifier = screenModifier
                )
                Screen.StudentCalendar -> StudentCalendarScreen(
                    uiState = uiState,
                    modifier = screenModifier
                )
                Screen.StudentTickets -> StudentTicketsScreen(
                    user = user,
                    eventViewModel = eventViewModel,
                    registrationViewModel = registrationViewModel,
                    onExploreEventsClick = { currentScreen = Screen.StudentEvents },
                    modifier = screenModifier
                )
                Screen.StudentProfile -> StudentProfileScreen(
                    user = user,
                    onLogoutClick = { authViewModel.logout() },
                    modifier = screenModifier
                )
                else -> StudentHomeScreen(
                    user = user,
                    uiState = uiState,
                    onNavigateToEvents = { currentScreen = Screen.StudentEvents },
                    onNavigateToTickets = { currentScreen = Screen.StudentTickets },
                    onRegisterEvent = { eventId ->
                        registrationViewModel.registerForEvent(eventId) {
                            eventViewModel.loadEvents()
                        }
                    },
                    onEventClick = { eventId -> selectedDetailEventId = eventId },
                    modifier = screenModifier
                )
            }
        }
    }
}
