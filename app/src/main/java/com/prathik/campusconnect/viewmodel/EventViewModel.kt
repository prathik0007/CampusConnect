package com.prathik.campusconnect.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prathik.campusconnect.data.DummyData
import com.prathik.campusconnect.data.repository.EventRepository
import com.prathik.campusconnect.data.remote.dto.CreateEventRequest
import com.prathik.campusconnect.data.remote.dto.UpdateEventRequest
import com.prathik.campusconnect.model.Event
import com.prathik.campusconnect.model.Registration
import com.prathik.campusconnect.model.RegistrationStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class EventUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val events: List<Event> = emptyList(),
    val selectedEvent: Event? = null,
    val isDetailLoading: Boolean = false,
    val detailError: String? = null,
    val searchQuery: String = "",
    val selectedCategory: String = "All",
    val registrations: List<Registration> = DummyData.sampleRegistrations,
    val isCreating: Boolean = false,
    val isUpdating: Boolean = false,
    val isDeleting: Boolean = false,
    val actionSuccessMessage: String? = null,
    val actionErrorMessage: String? = null
)

class EventViewModel(
    private val eventRepository: EventRepository? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(EventUiState())
    val uiState: StateFlow<EventUiState> = _uiState.asStateFlow()

    init {
        loadEvents()
    }

    fun loadEvents() {
        if (eventRepository == null) {
            _uiState.value = _uiState.value.copy(events = DummyData.sampleEvents, isLoading = false)
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = eventRepository.getEvents()
            result.fold(
                onSuccess = { fetchedEvents ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        events = fetchedEvents,
                        errorMessage = null
                    )
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = exception.message ?: "Unable to fetch events."
                    )
                }
            )
        }
    }

    fun getEventById(id: String) {
        if (eventRepository == null) {
            val localEvent = _uiState.value.events.find { it.id == id }
            _uiState.value = _uiState.value.copy(selectedEvent = localEvent)
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isDetailLoading = true, detailError = null)
            val result = eventRepository.getEventById(id)
            result.fold(
                onSuccess = { event ->
                    _uiState.value = _uiState.value.copy(
                        isDetailLoading = false,
                        selectedEvent = event,
                        detailError = null
                    )
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isDetailLoading = false,
                        detailError = exception.message ?: "Failed to load event details."
                    )
                }
            )
        }
    }

    fun updateSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
    }

    fun selectCategory(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
    }

    fun createEvent(
        title: String,
        description: String,
        category: String,
        location: String,
        startDate: String,
        endDate: String,
        capacity: Int,
        imageUrl: String = ""
    ) {
        if (title.isBlank() || description.isBlank() || location.isBlank()) {
            _uiState.value = _uiState.value.copy(actionErrorMessage = "Title, description, and location are required.")
            return
        }

        if (eventRepository == null) {
            _uiState.value = _uiState.value.copy(actionSuccessMessage = "Event created successfully!")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCreating = true, actionErrorMessage = null, actionSuccessMessage = null)
            val request = CreateEventRequest(
                title = title,
                description = description,
                category = category.ifBlank { "General" },
                location = location,
                venue = location,
                startDate = startDate,
                endDate = endDate,
                capacity = capacity,
                imageUrl = imageUrl
            )
            val result = eventRepository.createEvent(request)
            result.fold(
                onSuccess = { newEvent ->
                    _uiState.value = _uiState.value.copy(
                        isCreating = false,
                        actionSuccessMessage = "Event published successfully!",
                        events = listOf(newEvent) + _uiState.value.events
                    )
                    loadEvents()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isCreating = false,
                        actionErrorMessage = exception.message ?: "Failed to create event."
                    )
                }
            )
        }
    }

    fun updateEvent(
        id: String,
        title: String,
        description: String,
        category: String,
        location: String,
        startDate: String,
        endDate: String,
        capacity: Int,
        imageUrl: String = ""
    ) {
        if (eventRepository == null) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isUpdating = true, actionErrorMessage = null, actionSuccessMessage = null)
            val request = UpdateEventRequest(
                title = title,
                description = description,
                category = category,
                location = location,
                venue = location,
                startDate = startDate,
                endDate = endDate,
                capacity = capacity,
                imageUrl = imageUrl
            )
            val result = eventRepository.updateEvent(id, request)
            result.fold(
                onSuccess = { updatedEvent ->
                    val updatedList = _uiState.value.events.map { if (it.id == id) updatedEvent else it }
                    _uiState.value = _uiState.value.copy(
                        isUpdating = false,
                        actionSuccessMessage = "Event updated successfully!",
                        events = updatedList,
                        selectedEvent = updatedEvent
                    )
                    loadEvents()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isUpdating = false,
                        actionErrorMessage = exception.message ?: "Failed to update event."
                    )
                }
            )
        }
    }

    fun deleteEvent(id: String) {
        if (eventRepository == null) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isDeleting = true, actionErrorMessage = null, actionSuccessMessage = null)
            val result = eventRepository.deleteEvent(id)
            result.fold(
                onSuccess = {
                    val remainingEvents = _uiState.value.events.filterNot { it.id == id }
                    _uiState.value = _uiState.value.copy(
                        isDeleting = false,
                        actionSuccessMessage = "Event deleted successfully.",
                        events = remainingEvents
                    )
                    loadEvents()
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isDeleting = false,
                        actionErrorMessage = exception.message ?: "Failed to delete event."
                    )
                }
            )
        }
    }

    fun clearActionMessages() {
        _uiState.value = _uiState.value.copy(actionSuccessMessage = null, actionErrorMessage = null)
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
}
