package com.prathik.campusconnect.ui.student

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.EventBusy
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.prathik.campusconnect.data.DummyData
import com.prathik.campusconnect.model.User
import com.prathik.campusconnect.ui.components.EmptyStateView
import com.prathik.campusconnect.ui.components.EventCard
import com.prathik.campusconnect.viewmodel.EventUiState

@Composable
fun StudentEventsScreen(
    user: User,
    uiState: EventUiState,
    onSearchQueryChange: (String) -> Unit,
    onCategorySelect: (String) -> Unit,
    onRegisterEvent: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val filteredEvents = uiState.events.filter { event ->
        val matchesCategory = uiState.selectedCategory == "All" || event.category.equals(uiState.selectedCategory, ignoreCase = true)
        val matchesSearch = uiState.searchQuery.isBlank() ||
                event.title.contains(uiState.searchQuery, ignoreCase = true) ||
                event.description.contains(uiState.searchQuery, ignoreCase = true) ||
                event.location.contains(uiState.searchQuery, ignoreCase = true)
        matchesCategory && matchesSearch
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Search Bar
        OutlinedTextField(
            value = uiState.searchQuery,
            onValueChange = onSearchQueryChange,
            placeholder = { Text("Search events, topics, or venues...") },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "Search",
                    tint = MaterialTheme.colorScheme.primary
                )
            },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Category Filter Chips
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(vertical = 4.dp)
        ) {
            items(DummyData.sampleCategories) { category ->
                val selected = uiState.selectedCategory == category
                FilterChip(
                    selected = selected,
                    onClick = { onCategorySelect(category) },
                    label = { Text(category) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                        selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                    ),
                    shape = RoundedCornerShape(20.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        if (filteredEvents.isEmpty()) {
            EmptyStateView(
                icon = Icons.Default.EventBusy,
                title = "No Events Found",
                description = "Try adjusting your search query or selecting a different category filter.",
                actionButtonText = "Reset Filters",
                onActionClick = {
                    onSearchQueryChange("")
                    onCategorySelect("All")
                }
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                items(filteredEvents, key = { it.id }) { event ->
                    val isRegistered = uiState.registrations.any { it.eventId == event.id && it.studentId == user.id }
                    EventCard(
                        event = event,
                        isRegistered = isRegistered,
                        onRegisterClick = { onRegisterEvent(event.id) }
                    )
                }
            }
        }
    }
}
