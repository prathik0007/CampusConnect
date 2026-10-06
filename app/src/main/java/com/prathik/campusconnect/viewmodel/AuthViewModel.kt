package com.prathik.campusconnect.viewmodel

import androidx.lifecycle.ViewModel
import com.prathik.campusconnect.data.DummyData
import com.prathik.campusconnect.model.User
import com.prathik.campusconnect.model.UserRole
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

sealed interface AuthState {
    object Unauthenticated : AuthState
    data class Authenticated(val user: User) : AuthState
}

class AuthViewModel : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Unauthenticated)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    fun loginWithStudentDemo() {
        _authState.value = AuthState.Authenticated(DummyData.demoStudent)
    }

    fun loginWithOrganizerDemo() {
        _authState.value = AuthState.Authenticated(DummyData.demoOrganizer)
    }

    fun loginWithCredentials(email: String, password: String) {
        val trimmedEmail = email.trim().lowercase()
        val user = if (trimmedEmail == DummyData.demoOrganizer.email || trimmedEmail.contains("organizer")) {
            DummyData.demoOrganizer.copy(email = if (trimmedEmail.isNotBlank()) trimmedEmail else DummyData.demoOrganizer.email)
        } else {
            DummyData.demoStudent.copy(email = if (trimmedEmail.isNotBlank()) trimmedEmail else DummyData.demoStudent.email)
        }
        _authState.value = AuthState.Authenticated(user)
    }

    fun logout() {
        _authState.value = AuthState.Unauthenticated
    }
}
