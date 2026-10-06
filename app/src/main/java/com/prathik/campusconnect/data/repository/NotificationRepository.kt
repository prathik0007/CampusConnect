package com.prathik.campusconnect.data.repository

import com.google.gson.Gson
import com.prathik.campusconnect.data.remote.NotificationApiService
import com.prathik.campusconnect.data.remote.dto.RegisterTokenRequest
import com.prathik.campusconnect.model.Notification
import java.io.IOException

class NotificationRepository(
    private val apiService: NotificationApiService
) {

    suspend fun registerDeviceToken(token: String): Result<Unit> {
        return try {
            val response = apiService.registerDeviceToken(RegisterTokenRequest(token = token))
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error registering device token."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to register FCM device token."))
        }
    }

    suspend fun getNotifications(): Result<List<Notification>> {
        return try {
            val response = apiService.getNotifications()
            if (response.isSuccessful) {
                val dtos = response.body() ?: emptyList()
                Result.success(dtos.map { it.toDomainNotification() })
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Failed to load notifications."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to retrieve notifications."))
        }
    }

    suspend fun markNotificationAsRead(id: String): Result<Notification> {
        return try {
            val response = apiService.markNotificationAsRead(id)
            if (response.isSuccessful) {
                val dto = response.body()
                if (dto != null) {
                    Result.success(dto.toDomainNotification())
                } else {
                    Result.failure(Exception("Updated notification payload invalid."))
                }
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error updating notification state."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to mark notification as read."))
        }
    }

    suspend fun markAllNotificationsAsRead(): Result<Unit> {
        return try {
            val response = apiService.markAllNotificationsAsRead()
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error updating notifications."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to mark all as read."))
        }
    }

    private fun parseError(errorJson: String?, statusCode: Int): String {
        if (errorJson.isNullOrBlank()) {
            return when (statusCode) {
                400 -> "Invalid notification request."
                401 -> "Session expired. Please log in again."
                403 -> "Permission denied."
                404 -> "Notification endpoint not found."
                500 -> "Server error processing notification."
                else -> "HTTP $statusCode error."
            }
        }
        return try {
            val map = Gson().fromJson(errorJson, Map::class.java)
            (map["message"] as? String) ?: (map["error"] as? String) ?: "HTTP $statusCode"
        } catch (e: Exception) {
            "HTTP $statusCode"
        }
    }
}
