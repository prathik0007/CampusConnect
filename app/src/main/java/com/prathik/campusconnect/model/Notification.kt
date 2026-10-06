package com.prathik.campusconnect.model

enum class NotificationType {
    INFO,
    EVENT_UPDATE,
    REMINDER,
    REGISTRATION
}

data class Notification(
    val id: String,
    val title: String,
    val message: String,
    val type: NotificationType = NotificationType.INFO,
    val isRead: Boolean = false,
    val eventId: String? = null,
    val createdAt: String = "Just now"
)
