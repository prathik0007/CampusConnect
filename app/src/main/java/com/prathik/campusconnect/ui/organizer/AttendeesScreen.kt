package com.prathik.campusconnect.ui.organizer

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.prathik.campusconnect.data.remote.dto.AttendeeDto
import com.prathik.campusconnect.ui.components.EmptyStateView
import com.prathik.campusconnect.viewmodel.EventViewModel
import com.prathik.campusconnect.viewmodel.RegistrationViewModel

@Composable
fun AttendeesScreen(
    eventViewModel: EventViewModel,
    registrationViewModel: RegistrationViewModel,
    modifier: Modifier = Modifier
) {
    val eventUiState by eventViewModel.uiState.collectAsState()
    val regUiState by registrationViewModel.uiState.collectAsState()

    var selectedEventId by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(eventUiState.events) {
        if (selectedEventId == null && eventUiState.events.isNotEmpty()) {
            selectedEventId = eventUiState.events.first().id
        }
    }

    LaunchedEffect(selectedEventId) {
        selectedEventId?.let { id ->
            registrationViewModel.loadEventAttendees(id)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Select Event to View Attendees",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Event Selector Chips
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(vertical = 4.dp)
        ) {
            items(eventUiState.events, key = { it.id }) { event ->
                val selected = selectedEventId == event.id
                FilterChip(
                    selected = selected,
                    onClick = { selectedEventId = event.id },
                    label = { Text(event.title) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                        selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                    ),
                    shape = RoundedCornerShape(20.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        when {
            regUiState.isAttendeesLoading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                }
            }

            regUiState.attendeesError != null -> {
                EmptyStateView(
                    icon = Icons.Default.Info,
                    title = "Failed to Load Attendees",
                    description = regUiState.attendeesError ?: "Could not fetch event attendees.",
                    actionButtonText = "Retry",
                    onActionClick = {
                        selectedEventId?.let { registrationViewModel.loadEventAttendees(it) }
                    }
                )
            }

            regUiState.attendees.isEmpty() -> {
                EmptyStateView(
                    icon = Icons.Default.People,
                    title = "No Students Registered Yet",
                    description = "No students have registered for this event yet. Once registrations arrive, attendee records will appear here."
                )
            }

            else -> {
                Text(
                    text = "Attendees List (${regUiState.attendees.size})",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(8.dp))

                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(regUiState.attendees) { attendee ->
                        AttendeeItemCard(
                            attendee = attendee,
                            onToggleAttendance = { isPresent ->
                                selectedEventId?.let { evtId ->
                                    registrationViewModel.updateAttendeeStatus(
                                        eventId = evtId,
                                        studentId = attendee.getResolvedStudentId(),
                                        attended = isPresent
                                    )
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AttendeeItemCard(
    attendee: AttendeeDto,
    onToggleAttendance: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Person,
                contentDescription = null,
                modifier = Modifier.size(40.dp),
                tint = MaterialTheme.colorScheme.primary
            )

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = attendee.getResolvedName(),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = attendee.getResolvedEmail(),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Badge,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = MaterialTheme.colorScheme.secondary
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = attendee.getResolvedTicketCode(),
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }
            }

            if (attendee.isPresent()) {
                Button(
                    onClick = { onToggleAttendance(false) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                        contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Present")
                }
            } else {
                OutlinedButton(
                    onClick = { onToggleAttendance(true) },
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Mark Present")
                }
            }
        }
    }
}
