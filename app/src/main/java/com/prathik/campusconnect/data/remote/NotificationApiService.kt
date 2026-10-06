package com.prathik.campusconnect.data.remote

import com.prathik.campusconnect.data.remote.dto.NotificationDto
import com.prathik.campusconnect.data.remote.dto.RegisterTokenRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

interface NotificationApiService {

    @POST("api/notifications/register-token")
    suspend fun registerDeviceToken(
        @Body request: RegisterTokenRequest
    ): Response<Unit>

    @GET("api/notifications")
    suspend fun getNotifications(): Response<List<NotificationDto>>

    @PATCH("api/notifications/{id}/read")
    suspend fun markNotificationAsRead(
        @Path("id") id: String
    ): Response<NotificationDto>

    @PATCH("api/notifications/read-all")
    suspend fun markAllNotificationsAsRead(): Response<Unit>
}
