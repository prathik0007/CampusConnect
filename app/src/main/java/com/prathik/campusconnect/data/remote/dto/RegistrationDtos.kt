package com.prathik.campusconnect.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.prathik.campusconnect.model.Registration
import com.prathik.campusconnect.model.RegistrationStatus

data class RegistrationDto(
    @SerializedName("_id")
    val mongoId: String? = null,

    @SerializedName("id")
    val id: String? = null,

    @SerializedName("eventId")
    val eventId: String? = null,

    @SerializedName("event")
    val event: EventDto? = null,

    @SerializedName("studentId")
    val studentId: String? = null,

    @SerializedName("student")
    val student: UserDto? = null,

    @SerializedName("ticketCode")
    val ticketCode: String? = null,

    @SerializedName("status")
    val status: String? = null,

    @SerializedName("attended")
    val attended: Boolean? = null,

    @SerializedName("attendanceStatus")
    val attendanceStatus: String? = null
) {
    fun toDomainRegistration(): Registration {
        val finalId = id ?: mongoId ?: "reg_${System.currentTimeMillis()}"
        val finalEventId = eventId ?: event?.id ?: event?.mongoId ?: ""
        val finalStudentId = studentId ?: student?.id ?: student?.mongoId ?: ""
        val finalTicketCode = ticketCode ?: "TKT-${finalEventId.takeLast(4).uppercase()}-${(1000..9999).random()}"
        val parsedStatus = when (status?.uppercase()) {
            "CANCELLED" -> RegistrationStatus.CANCELLED
            "WAITLISTED" -> RegistrationStatus.WAITLISTED
            else -> RegistrationStatus.CONFIRMED
        }
        val isAttended = attended == true || attendanceStatus.equals("PRESENT", ignoreCase = true)
        val domainEvent = event?.toDomainEvent()

        return Registration(
            id = finalId,
            eventId = finalEventId,
            studentId = finalStudentId,
            ticketCode = finalTicketCode,
            status = parsedStatus,
            attended = isAttended,
            event = domainEvent
        )
    }
}

data class RegistrationResponse(
    @SerializedName("registration")
    val registration: RegistrationDto? = null,

    @SerializedName("data")
    val data: RegistrationDto? = null,

    @SerializedName("ticket")
    val ticket: RegistrationDto? = null,

    @SerializedName("message")
    val message: String? = null
) {
    fun toDomainRegistration(): Registration? {
        val target = registration ?: data ?: ticket
        return target?.toDomainRegistration()
    }
}

data class AttendeeDto(
    @SerializedName("_id")
    val mongoId: String? = null,

    @SerializedName("id")
    val id: String? = null,

    @SerializedName("studentId")
    val studentId: String? = null,

    @SerializedName("studentName")
    val studentName: String? = null,

    @SerializedName("name")
    val name: String? = null,

    @SerializedName("studentEmail")
    val studentEmail: String? = null,

    @SerializedName("email")
    val email: String? = null,

    @SerializedName("student")
    val student: UserDto? = null,

    @SerializedName("ticketCode")
    val ticketCode: String? = null,

    @SerializedName("status")
    val status: String? = null,

    @SerializedName("attended")
    val attended: Boolean? = null,

    @SerializedName("attendanceStatus")
    val attendanceStatus: String? = null
) {
    fun getResolvedStudentId(): String = studentId ?: student?.id ?: student?.mongoId ?: id ?: mongoId ?: "std_unknown"
    fun getResolvedName(): String = studentName ?: name ?: student?.name ?: "Student"
    fun getResolvedEmail(): String = studentEmail ?: email ?: student?.email ?: "student@campusconnect.com"
    fun getResolvedTicketCode(): String = ticketCode ?: "TKT-${getResolvedStudentId().takeLast(4).uppercase()}"
    fun isPresent(): Boolean = attended == true || attendanceStatus.equals("PRESENT", ignoreCase = true)
}

data class UpdateAttendanceRequest(
    val attended: Boolean? = null,
    val attendanceStatus: String? = null
)

data class CheckInRequest(
    val ticketCode: String
)

data class CheckInResponse(
    @SerializedName("message") val message: String? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("attendee") val attendee: CheckInAttendeeData? = null,
    @SerializedName("event") val event: CheckInEventData? = null,
    @SerializedName("stats") val stats: CheckInStatsData? = null
)

data class CheckInAttendeeData(
    val id: String? = null,
    val studentName: String? = null,
    val studentEmail: String? = null,
    val ticketCode: String? = null,
    val checkInTime: String? = null
)

data class CheckInEventData(
    val id: String? = null,
    val title: String? = null
)

data class CheckInStatsData(
    val totalRegistered: Int? = null,
    val totalCheckedIn: Int? = null
)
