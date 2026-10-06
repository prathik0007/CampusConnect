package com.prathik.campusconnect.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.prathik.campusconnect.model.Notification
import com.prathik.campusconnect.model.NotificationType

data class RegisterTokenRequest(
    @SerializedName("token")
    val token: String,

    @SerializedName("deviceToken")
    val deviceToken: String = token,

    @SerializedName("platform")
    val platform: String = "android"
)

data class NotificationDto(
    @SerializedName("_id")
    val mongoId: String? = null,

    @SerializedName("id")
    val id: String? = null,

    @SerializedName("title")
    val title: String? = null,

    @SerializedName("message")
    val message: String? = null,

    @SerializedName("type")
    val type: String? = null,

    @SerializedName("eventId")
    val eventId: String? = null,

    @SerializedName("read")
    val read: Boolean? = null,

    @SerializedName("isRead")
    val isRead: Boolean? = null,

    @SerializedName("createdAt")
    val createdAt: String? = null
) {
    fun toDomainNotification(): Notification {
        val finalId = id ?: mongoId ?: "notif_${System.currentTimeMillis()}"
        val finalTitle = title ?: "CampusConnect Update"
        val finalMessage = message ?: ""
        val parsedType = when (type?.uppercase()) {
            "REGISTRATION_SUCCESS", "REGISTRATION" -> NotificationType.REGISTRATION
            "EVENT_UPDATED", "EVENT_UPDATE" -> NotificationType.EVENT_UPDATE
            "REMINDER" -> NotificationType.REMINDER
            else -> NotificationType.INFO
        }
        val isReadStatus = read == true || isRead == true

        return Notification(
            id = finalId,
            title = finalTitle,
            message = finalMessage,
            type = parsedType,
            isRead = isReadStatus,
            eventId = eventId,
            createdAt = createdAt ?: "Just now"
        )
    }
}

data class NotificationResponse(
    @SerializedName("notifications")
    val notifications: List<NotificationDto>? = null,

    @SerializedName("data")
    val data: List<NotificationDto>? = null,

    @SerializedName("message")
    val message: String? = null
) {
    fun getResolvedNotifications(): List<NotificationDto> {
        return notifications ?: data ?: emptyList()
    }
}
