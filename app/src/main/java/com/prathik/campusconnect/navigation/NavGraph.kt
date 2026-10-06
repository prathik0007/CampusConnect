package com.prathik.campusconnect.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prathik.campusconnect.model.UserRole
import com.prathik.campusconnect.ui.auth.LoginScreen
import com.prathik.campusconnect.ui.auth.RegisterScreen
import com.prathik.campusconnect.ui.organizer.OrganizerMainScreen
import com.prathik.campusconnect.ui.student.StudentMainScreen
import com.prathik.campusconnect.viewmodel.AuthState
import com.prathik.campusconnect.viewmodel.AuthViewModel
import com.prathik.campusconnect.viewmodel.EventViewModel
import com.prathik.campusconnect.viewmodel.RegistrationViewModel

@Composable
fun CampusConnectNavGraph(
    authViewModel: AuthViewModel,
    eventViewModel: EventViewModel,
    registrationViewModel: RegistrationViewModel,
    modifier: Modifier = Modifier
) {
    val authState by authViewModel.authState.collectAsState()
    var authScreenRoute by remember { mutableStateOf(Screen.Login.route) }

    when (val state = authState) {
        is AuthState.Initial, is AuthState.Loading -> {
            Box(
                modifier = modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primary),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.School,
                            contentDescription = "Logo",
                            tint = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.size(44.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "CampusConnect",
                        style = MaterialTheme.typography.headlineLarge,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.primary,
                        strokeWidth = 3.dp
                    )
                }
            }
        }

        is AuthState.Unauthenticated, is AuthState.Error -> {
            if (authScreenRoute == Screen.Register.route) {
                RegisterScreen(
                    authViewModel = authViewModel,
                    onNavigateToLogin = { authScreenRoute = Screen.Login.route },
                    modifier = modifier
                )
            } else {
                LoginScreen(
                    authViewModel = authViewModel,
                    onNavigateToRegister = { authScreenRoute = Screen.Register.route },
                    modifier = modifier
                )
            }
        }

        is AuthState.Authenticated -> {
            when (state.user.role) {
                UserRole.STUDENT -> {
                    StudentMainScreen(
                        user = state.user,
                        authViewModel = authViewModel,
                        eventViewModel = eventViewModel,
                        registrationViewModel = registrationViewModel,
                        modifier = modifier
                    )
                }
                UserRole.ORGANIZER -> {
                    OrganizerMainScreen(
                        user = state.user,
                        authViewModel = authViewModel,
                        eventViewModel = eventViewModel,
                        registrationViewModel = registrationViewModel,
                        modifier = modifier
                    )
                }
            }
        }
    }
}
