package com.prathik.campusconnect.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prathik.campusconnect.data.DummyData
import com.prathik.campusconnect.data.remote.dto.AttendeeDto
import com.prathik.campusconnect.data.repository.RegistrationRepository
import com.prathik.campusconnect.model.Registration
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class RegistrationUiState(
    val isRegistering: Boolean = false,
    val isCancelling: Boolean = false,
    val isTicketsLoading: Boolean = false,
    val myRegistrations: List<Registration> = DummyData.sampleRegistrations,
    val ticketsError: String? = null,
    val isAttendeesLoading: Boolean = false,
    val attendees: List<AttendeeDto> = emptyList(),
    val attendeesError: String? = null,
    val actionMessage: String? = null,
    val actionError: String? = null
)

class RegistrationViewModel(
    private val registrationRepository: RegistrationRepository? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(RegistrationUiState())
    val uiState: StateFlow<RegistrationUiState> = _uiState.asStateFlow()

    init {
        loadMyRegistrations()
    }

    fun loadMyRegistrations() {
        if (registrationRepository == null) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isTicketsLoading = true, ticketsError = null)
            val result = registrationRepository.getMyRegistrations()
            result.fold(
                onSuccess = { regs ->
                    _uiState.value = _uiState.value.copy(
                        isTicketsLoading = false,
                        myRegistrations = regs,
                        ticketsError = null
                    )
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isTicketsLoading = false,
                        ticketsError = exception.message ?: "Failed to load registrations."
                    )
                }
            )
        }
    }

    fun registerForEvent(eventId: String, onSuccess: () -> Unit = {}) {
        if (registrationRepository == null) {
            _uiState.value = _uiState.value.copy(actionMessage = "Registration successful!")
            onSuccess()
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRegistering = true, actionError = null, actionMessage = null)
            val result = registrationRepository.registerForEvent(eventId)
            result.fold(
                onSuccess = { newReg ->
                    val updatedList = _uiState.value.myRegistrations + newReg
                    _uiState.value = _uiState.value.copy(
                        isRegistering = false,
                        myRegistrations = updatedList,
                        actionMessage = "Successfully registered for event!"
                    )
                    loadMyRegistrations()
                    onSuccess()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isRegistering = false,
                        actionError = exception.message ?: "Failed to register for event."
                    )
                }
            )
        }
    }

    fun cancelRegistration(eventId: String, onSuccess: () -> Unit = {}) {
        if (registrationRepository == null) {
            val updated = _uiState.value.myRegistrations.filterNot { it.eventId == eventId }
            _uiState.value = _uiState.value.copy(myRegistrations = updated, actionMessage = "Registration cancelled.")
            onSuccess()
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCancelling = true, actionError = null, actionMessage = null)
            val result = registrationRepository.cancelRegistration(eventId)
            result.fold(
                onSuccess = {
                    val updatedList = _uiState.value.myRegistrations.filterNot { it.eventId == eventId }
                    _uiState.value = _uiState.value.copy(
                        isCancelling = false,
                        myRegistrations = updatedList,
                        actionMessage = "Registration cancelled successfully."
                    )
                    loadMyRegistrations()
                    onSuccess()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isCancelling = false,
                        actionError = exception.message ?: "Failed to cancel registration."
                    )
                }
            )
        }
    }

    fun loadEventAttendees(eventId: String) {
        if (registrationRepository == null) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isAttendeesLoading = true, attendeesError = null)
            val result = registrationRepository.getEventAttendees(eventId)
            result.fold(
                onSuccess = { fetchedAttendees ->
                    _uiState.value = _uiState.value.copy(
                        isAttendeesLoading = false,
                        attendees = fetchedAttendees,
                        attendeesError = null
                    )
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isAttendeesLoading = false,
                        attendeesError = exception.message ?: "Failed to load attendees."
                    )
                }
            )
        }
    }

    fun updateAttendeeStatus(eventId: String, studentId: String, attended: Boolean) {
        if (registrationRepository == null) return

        viewModelScope.launch {
            val result = registrationRepository.updateAttendeeStatus(eventId, studentId, attended)
            result.fold(
                onSuccess = { updatedAttendee ->
                    val updatedList = _uiState.value.attendees.map {
                        if (it.getResolvedStudentId() == studentId) updatedAttendee else it
                    }
                    _uiState.value = _uiState.value.copy(
                        attendees = updatedList,
                        actionMessage = "Attendance status updated."
                    )
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(actionError = exception.message ?: "Failed to update attendance.")
                }
            )
        }
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(actionMessage = null, actionError = null)
    }
}
