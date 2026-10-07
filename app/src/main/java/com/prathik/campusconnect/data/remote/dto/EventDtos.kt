package com.prathik.campusconnect.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.prathik.campusconnect.model.Event
import com.prathik.campusconnect.model.EventStatus

data class EventDto(
    @SerializedName("_id")
    val mongoId: String? = null,

    @SerializedName("id")
    val id: String? = null,

    @SerializedName("title")
    val title: String? = null,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("category")
    val category: String? = null,

    @SerializedName("location")
    val location: String? = null,

    @SerializedName("venue")
    val venue: String? = null,

    @SerializedName("startDate")
    val startDate: String? = null,

    @SerializedName("date")
    val date: String? = null,

    @SerializedName("endDate")
    val endDate: String? = null,

    @SerializedName("startTime")
    val startTime: String? = null,

    @SerializedName("endTime")
    val endTime: String? = null,

    @SerializedName("capacity")
    val capacity: Int? = null,

    @SerializedName("registeredCount")
    val registeredCount: Int? = null,

    @SerializedName("registeredStudents")
    val registeredStudents: List<Any>? = null,

    @SerializedName("imageUrl")
    val imageUrl: String? = null,

    @SerializedName("bannerUrl")
    val bannerUrl: String? = null,

    @SerializedName("image")
    val image: String? = null,

    @SerializedName("organizerId")
    val organizerId: String? = null,

    @SerializedName("organizer")
    val organizer: Any? = null,

    @SerializedName("status")
    val status: String? = null
) {
    fun toDomainEvent(): Event {
        val finalId = id ?: mongoId ?: "evt_${System.currentTimeMillis()}"
        val finalTitle = title ?: "Untitled Event"
        val finalDescription = description ?: ""
        val finalCategory = category ?: "General"
        val finalLocation = venue ?: location ?: "Campus Venue"

        val startFormatted = when {
            !startDate.isNullOrBlank() -> startDate
            !date.isNullOrBlank() && !startTime.isNullOrBlank() -> "$date - $startTime"
            !date.isNullOrBlank() -> date
            else -> "TBD"
        }

        val endFormatted = when {
            !endDate.isNullOrBlank() -> endDate
            !endTime.isNullOrBlank() -> endTime
            else -> "TBD"
        }

        val finalCapacity = capacity ?: 100
        val finalRegisteredCount = registeredCount ?: registeredStudents?.size ?: 0
        val finalImage = listOfNotNull(imageUrl, bannerUrl, image).firstOrNull { it.isNotBlank() } ?: ""
        val finalOrgId = organizerId ?: organizer?.toString() ?: "org_default"

        val parsedStatus = when (status?.uppercase()) {
            "ONGOING" -> EventStatus.ONGOING
            "COMPLETED" -> EventStatus.COMPLETED
            "CANCELLED" -> EventStatus.CANCELLED
            else -> EventStatus.UPCOMING
        }

        return Event(
            id = finalId,
            title = finalTitle,
            description = finalDescription,
            category = finalCategory,
            location = finalLocation,
            startDate = startFormatted,
            endDate = endFormatted,
            capacity = finalCapacity,
            registeredCount = finalRegisteredCount,
            imageUrl = finalImage,
            organizerId = finalOrgId,
            status = parsedStatus
        )
    }
}

data class CreateEventRequest(
    val title: String,
    val description: String,
    val category: String,
    val location: String,
    val venue: String = location,
    val startDate: String,
    val endDate: String,
    val capacity: Int,
    val imageUrl: String = ""
)

data class UpdateEventRequest(
    val title: String? = null,
    val description: String? = null,
    val category: String? = null,
    val location: String? = null,
    val venue: String? = location,
    val startDate: String? = null,
    val endDate: String? = null,
    val capacity: Int? = null,
    val imageUrl: String? = null
)
