package com.prathik.campusconnect.model

enum class EventStatus {
    UPCOMING,
    ONGOING,
    COMPLETED,
    CANCELLED
}

data class Event(
    val id: String,
    val title: String,
    val description: String,
    val category: String,
    val location: String,
    val startDate: String,
    val endDate: String,
    val capacity: Int,
    val registeredCount: Int,
    val imageUrl: String = "",
    val organizerId: String,
    val status: EventStatus = EventStatus.UPCOMING
)
