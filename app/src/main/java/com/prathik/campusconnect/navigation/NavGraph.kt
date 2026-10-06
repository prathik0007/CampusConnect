package com.prathik.campusconnect.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.prathik.campusconnect.model.UserRole
import com.prathik.campusconnect.ui.auth.LoginScreen
import com.prathik.campusconnect.ui.organizer.OrganizerMainScreen
import com.prathik.campusconnect.ui.student.StudentMainScreen
import com.prathik.campusconnect.viewmodel.AuthState
import com.prathik.campusconnect.viewmodel.AuthViewModel
import com.prathik.campusconnect.viewmodel.EventViewModel

@Composable
fun CampusConnectNavGraph(
    authViewModel: AuthViewModel,
    eventViewModel: EventViewModel,
    modifier: Modifier = Modifier
) {
    val authState by authViewModel.authState.collectAsState()

    when (val state = authState) {
        is AuthState.Unauthenticated -> {
            LoginScreen(
                authViewModel = authViewModel,
                modifier = modifier
            )
        }
        is AuthState.Authenticated -> {
            when (state.user.role) {
                UserRole.STUDENT -> {
                    StudentMainScreen(
                        user = state.user,
                        authViewModel = authViewModel,
                        eventViewModel = eventViewModel,
                        modifier = modifier
                    )
                }
                UserRole.ORGANIZER -> {
                    OrganizerMainScreen(
                        user = state.user,
                        authViewModel = authViewModel,
                        eventViewModel = eventViewModel,
                        modifier = modifier
                    )
                }
            }
        }
    }
}
