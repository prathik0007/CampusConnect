package com.prathik.campusconnect.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prathik.campusconnect.data.repository.AuthRepository
import com.prathik.campusconnect.model.User
import com.prathik.campusconnect.model.UserRole
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface AuthState {
    object Initial : AuthState
    object Loading : AuthState
    object Unauthenticated : AuthState
    data class Authenticated(val user: User) : AuthState
    data class Error(val message: String) : AuthState
}

class AuthViewModel(
    private val authRepository: AuthRepository? = null
) : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Initial)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    init {
        restoreSession()
    }

    fun restoreSession() {
        if (authRepository == null) {
            _authState.value = AuthState.Unauthenticated
            return
        }

        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val token = authRepository.getStoredToken()
            val cachedUser = authRepository.getCachedUser()

            if (token.isNullOrBlank()) {
                _authState.value = AuthState.Unauthenticated
                return@launch
            }

            // Restore authenticated session immediately from local cached user
            if (cachedUser != null) {
                _authState.value = AuthState.Authenticated(cachedUser)
            }

            // Verify/refresh user profile in background
            val result = authRepository.getCurrentUser()
            result.fold(
                onSuccess = { freshUser ->
                    authRepository.saveUserCache(freshUser)
                    _authState.value = AuthState.Authenticated(freshUser)
                },
                onFailure = { exception ->
                    val errMsg = exception.message ?: ""
                    if (errMsg.contains("401") || errMsg.contains("unauthorized", ignoreCase = true)) {
                        authRepository.logout()
                        _authState.value = AuthState.Unauthenticated
                    } else if (cachedUser == null) {
                        _authState.value = AuthState.Unauthenticated
                    }
                    // If network error/timeout on cold start, retain cachedUser authentication!
                }
            )
        }
    }

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _authState.value = AuthState.Error("Please fill in email and password.")
            return
        }

        if (authRepository == null) {
            _authState.value = AuthState.Error("Auth Repository not initialized.")
            return
        }

        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = authRepository.login(email.trim(), password)
            result.fold(
                onSuccess = { user ->
                    _authState.value = AuthState.Authenticated(user)
                },
                onFailure = { exception ->
                    _authState.value = AuthState.Error(exception.message ?: "Login failed.")
                }
            )
        }
    }

    fun register(name: String, email: String, password: String, confirmPassword: String, role: UserRole) {
        if (name.isBlank() || email.isBlank() || password.isBlank()) {
            _authState.value = AuthState.Error("Please fill in all required fields.")
            return
        }

        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches()) {
            _authState.value = AuthState.Error("Please enter a valid email address.")
            return
        }

        if (password.length < 6) {
            _authState.value = AuthState.Error("Password must be at least 6 characters long.")
            return
        }

        if (password != confirmPassword) {
            _authState.value = AuthState.Error("Passwords do not match.")
            return
        }

        if (authRepository == null) {
            _authState.value = AuthState.Error("Auth Repository not initialized.")
            return
        }

        viewModelScope.launch {
            _authState.value = AuthState.Loading
            val result = authRepository.register(name.trim(), email.trim(), password, role)
            result.fold(
                onSuccess = { user ->
                    _authState.value = AuthState.Authenticated(user)
                },
                onFailure = { exception ->
                    _authState.value = AuthState.Error(exception.message ?: "Registration failed.")
                }
            )
        }
    }

    fun clearError() {
        if (_authState.value is AuthState.Error) {
            _authState.value = AuthState.Unauthenticated
        }
    }

    fun logout() {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            authRepository?.logout()
            _authState.value = AuthState.Unauthenticated
        }
    }
}
