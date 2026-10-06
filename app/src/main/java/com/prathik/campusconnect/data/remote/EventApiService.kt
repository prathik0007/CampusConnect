package com.prathik.campusconnect.data.remote

import com.prathik.campusconnect.data.remote.dto.CreateEventRequest
import com.prathik.campusconnect.data.remote.dto.EventDto
import com.prathik.campusconnect.data.remote.dto.UpdateEventRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface EventApiService {

    @GET("api/events")
    suspend fun getEvents(): Response<List<EventDto>>

    @GET("api/events/{id}")
    suspend fun getEventById(
        @Path("id") id: String
    ): Response<EventDto>

    @POST("api/events")
    suspend fun createEvent(
        @Body request: CreateEventRequest
    ): Response<EventDto>

    @PUT("api/events/{id}")
    suspend fun updateEvent(
        @Path("id") id: String,
        @Body request: UpdateEventRequest
    ): Response<EventDto>

    @DELETE("api/events/{id}")
    suspend fun deleteEvent(
        @Path("id") id: String
    ): Response<Unit>
}
