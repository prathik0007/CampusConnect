package com.prathik.campusconnect.data.remote

import com.prathik.campusconnect.data.remote.dto.AttendeeDto
import com.prathik.campusconnect.data.remote.dto.RegistrationDto
import com.prathik.campusconnect.data.remote.dto.RegistrationResponse
import com.prathik.campusconnect.data.remote.dto.UpdateAttendanceRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

interface RegistrationApiService {

    @POST("api/events/{id}/register")
    suspend fun registerForEvent(
        @Path("id") eventId: String
    ): Response<RegistrationResponse>

    @DELETE("api/events/{id}/register")
    suspend fun cancelRegistration(
        @Path("id") eventId: String
    ): Response<Unit>

    @GET("api/students/my-registrations")
    suspend fun getMyRegistrations(): Response<List<RegistrationDto>>

    @GET("api/events/{id}/attendees")
    suspend fun getEventAttendees(
        @Path("id") eventId: String
    ): Response<List<AttendeeDto>>

    @PATCH("api/events/{id}/attendees/{studentId}")
    suspend fun updateAttendeeStatus(
        @Path("id") eventId: String,
        @Path("studentId") studentId: String,
        @Body request: UpdateAttendanceRequest
    ): Response<AttendeeDto>
}
