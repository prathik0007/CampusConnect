package com.prathik.campusconnect.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prathik.campusconnect.data.repository.CalendarRepository
import com.prathik.campusconnect.model.Event
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class CalendarUiState(
    val isAddingToCalendar: Boolean = false,
    val calendarActionMessage: String? = null,
    val calendarActionError: String? = null,
    val addedEventIds: Set<String> = emptySet()
)

class CalendarViewModel(
    private val calendarRepository: CalendarRepository = CalendarRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(CalendarUiState())
    val uiState: StateFlow<CalendarUiState> = _uiState.asStateFlow()

    fun checkIfEventAdded(context: Context, eventId: String, eventTitle: String) {
        viewModelScope.launch {
            val exists = calendarRepository.isEventInCalendar(context, eventId, eventTitle)
            if (exists) {
                _uiState.value = _uiState.value.copy(
                    addedEventIds = _uiState.value.addedEventIds + eventId
                )
            }
        }
    }

    fun addEventToCalendar(context: Context, event: Event) {
        if (_uiState.value.addedEventIds.contains(event.id)) {
            _uiState.value = _uiState.value.copy(
                calendarActionMessage = "Event is already in your calendar."
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isAddingToCalendar = true,
                calendarActionError = null,
                calendarActionMessage = null
            )

            val result = calendarRepository.addEventToCalendar(context, event)
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isAddingToCalendar = false,
                        calendarActionMessage = "Event added to your calendar.",
                        addedEventIds = _uiState.value.addedEventIds + event.id
                    )
                },
                onFailure = { exception ->
                    _uiState.value = _uiState.value.copy(
                        isAddingToCalendar = false,
                        calendarActionError = exception.message ?: "Failed to add event to calendar."
                    )
                }
            )
        }
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(
            calendarActionMessage = null,
            calendarActionError = null
        )
    }
}
