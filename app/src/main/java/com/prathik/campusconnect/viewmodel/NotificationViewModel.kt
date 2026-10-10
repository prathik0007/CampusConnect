package com.prathik.campusconnect.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prathik.campusconnect.data.DummyData
import com.prathik.campusconnect.data.repository.NotificationRepository
import com.prathik.campusconnect.model.Notification
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class NotificationUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val notifications: List<Notification> = DummyData.sampleNotifications,
    val unreadCount: Int = DummyData.sampleNotifications.count { !it.isRead },
    val isTokenRegistered: Boolean = false
)

class NotificationViewModel(
    private val notificationRepository: NotificationRepository? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationUiState())
    val uiState: StateFlow<NotificationUiState> = _uiState.asStateFlow()

    init {
        loadNotifications()
    }

    fun registerDeviceToken(fcmToken: String) {
        if (fcmToken.isBlank() || notificationRepository == null) return

        viewModelScope.launch {
            val result = notificationRepository.registerDeviceToken(fcmToken)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(isTokenRegistered = true)
                },
                onFailure = {
                    // Fail silently so push token issues do not block core app flows
                }
            )
        }
    }

    fun loadNotifications() {
        if (notificationRepository == null) return

        viewModelScope.launch {
            if (_uiState.value.notifications.isEmpty()) {
                _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            }
            val result = notificationRepository.getNotifications()
            result.fold(
                onSuccess = { list ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        notifications = list,
                        unreadCount = list.count { !it.isRead },
                        errorMessage = null
                    )
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = if (_uiState.value.notifications.isEmpty()) exception.message ?: "Failed to load notifications." else null
                    )
                }
            )
        }
    }

    fun markAsRead(id: String, onNavigateToEvent: (String?) -> Unit = {}) {
        val targetNotif = _uiState.value.notifications.find { it.id == id }

        // 1. Immediately update local UI state so it shows as read instantly
        val updated = _uiState.value.notifications.map {
            if (it.id == id) it.copy(isRead = true) else it
        }
        _uiState.value = _uiState.value.copy(
            notifications = updated,
            unreadCount = updated.count { !it.isRead }
        )

        // 2. Trigger instant navigation to the target event immediately
        onNavigateToEvent(targetNotif?.eventId)

        // 3. Perform background API call to update backend database
        if (notificationRepository != null) {
            viewModelScope.launch {
                notificationRepository.markNotificationAsRead(id)
            }
        }
    }

    fun markAllAsRead() {
        val updated = _uiState.value.notifications.map { it.copy(isRead = true) }
        _uiState.value = _uiState.value.copy(
            notifications = updated,
            unreadCount = 0
        )

        if (notificationRepository != null) {
            viewModelScope.launch {
                notificationRepository.markAllNotificationsAsRead()
            }
        }
    }
}
