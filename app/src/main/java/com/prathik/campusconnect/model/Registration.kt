package com.prathik.campusconnect.model

enum class RegistrationStatus {
    CONFIRMED,
    CANCELLED,
    WAITLISTED
}

data class Registration(
    val id: String,
    val eventId: String,
    val studentId: String,
    val ticketCode: String,
    val status: RegistrationStatus = RegistrationStatus.CONFIRMED,
    val attended: Boolean = false,
    val event: Event? = null
)
