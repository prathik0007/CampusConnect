package com.prathik.campusconnect.ui.student

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
import com.prathik.campusconnect.navigation.studentBottomNavItems
import com.prathik.campusconnect.ui.components.CampusTopBar
import com.prathik.campusconnect.ui.components.StudentBottomNavBar
import com.prathik.campusconnect.viewmodel.AuthViewModel
import com.prathik.campusconnect.viewmodel.EventViewModel

@Composable
fun StudentMainScreen(
    user: User,
    authViewModel: AuthViewModel,
    eventViewModel: EventViewModel,
    modifier: Modifier = Modifier
) {
    var currentScreen by remember { mutableStateOf<Screen>(Screen.StudentHome) }
    val uiState by eventViewModel.uiState.collectAsState()

    Scaffold(
        modifier = modifier,
        topBar = {
            CampusTopBar(
                title = "CampusConnect",
                roleTitle = "Student • ${currentScreen.title}"
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
                onRegisterEvent = { eventId -> eventViewModel.registerForEvent(eventId, user.id) },
                modifier = screenModifier
            )
            Screen.StudentEvents -> StudentEventsScreen(
                user = user,
                uiState = uiState,
                onSearchQueryChange = { query -> eventViewModel.updateSearchQuery(query) },
                onCategorySelect = { cat -> eventViewModel.selectCategory(cat) },
                onRegisterEvent = { eventId -> eventViewModel.registerForEvent(eventId, user.id) },
                modifier = screenModifier
            )
            Screen.StudentCalendar -> StudentCalendarScreen(
                uiState = uiState,
                modifier = screenModifier
            )
            Screen.StudentTickets -> StudentTicketsScreen(
                user = user,
                uiState = uiState,
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
                onRegisterEvent = { eventId -> eventViewModel.registerForEvent(eventId, user.id) },
                modifier = screenModifier
            )
        }
    }
}
