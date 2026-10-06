package com.prathik.campusconnect.viewmodel

import androidx.lifecycle.ViewModel
import com.prathik.campusconnect.data.DummyData
import com.prathik.campusconnect.model.Event
import com.prathik.campusconnect.model.EventStatus
import com.prathik.campusconnect.model.Registration
import com.prathik.campusconnect.model.RegistrationStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class EventUiState(
    val events: List<Event> = DummyData.sampleEvents,
    val selectedCategory: String = "All",
    val searchQuery: String = "",
    val registrations: List<Registration> = DummyData.sampleRegistrations,
    val isCreatingEvent: Boolean = false,
    val creationSuccess: Boolean = false
)

class EventViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(EventUiState())
    val uiState: StateFlow<EventUiState> = _uiState.asStateFlow()

    fun updateSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
    }

    fun selectCategory(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
    }

    fun registerForEvent(eventId: String, studentId: String) {
        val current = _uiState.value
        val alreadyRegistered = current.registrations.any { it.eventId == eventId && it.studentId == studentId }
        if (!alreadyRegistered) {
            val newRegistration = Registration(
                id = "reg_${System.currentTimeMillis()}",
                eventId = eventId,
                studentId = studentId,
                ticketCode = "TKT-${eventId.takeLast(4).uppercase()}-${(1000..9999).random()}",
                status = RegistrationStatus.CONFIRMED,
                attended = false
            )
            val updatedEvents = current.events.map { evt ->
                if (evt.id == eventId) {
                    evt.copy(registeredCount = evt.registeredCount + 1)
                } else evt
            }
            _uiState.value = current.copy(
                registrations = current.registrations + newRegistration,
                events = updatedEvents
            )
        }
    }

    fun createEvent(
        title: String,
        description: String,
        category: String,
        location: String,
        startDate: String,
        endDate: String,
        capacity: Int,
        organizerId: String
    ): Boolean {
        if (title.isBlank() || description.isBlank() || location.isBlank()) {
            return false
        }
        val newEvent = Event(
            id = "evt_${System.currentTimeMillis()}",
            title = title,
            description = description,
            category = category.ifBlank { "General" },
            location = location,
            startDate = startDate.ifBlank { "TBD" },
            endDate = endDate.ifBlank { "TBD" },
            capacity = capacity,
            registeredCount = 0,
            imageUrl = "",
            organizerId = organizerId,
            status = EventStatus.UPCOMING
        )
        _uiState.value = _uiState.value.copy(
            events = listOf(newEvent) + _uiState.value.events,
            creationSuccess = true
        )
        return true
    }

    fun resetCreationSuccess() {
        _uiState.value = _uiState.value.copy(creationSuccess = false)
    }
}
