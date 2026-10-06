package com.prathik.campusconnect.data.repository

import com.google.gson.Gson
import com.prathik.campusconnect.data.remote.EventApiService
import com.prathik.campusconnect.data.remote.dto.CreateEventRequest
import com.prathik.campusconnect.data.remote.dto.UpdateEventRequest
import com.prathik.campusconnect.model.Event
import java.io.IOException

class EventRepository(
    private val apiService: EventApiService
) {

    suspend fun getEvents(): Result<List<Event>> {
        return try {
            val response = apiService.getEvents()
            if (response.isSuccessful) {
                val dtos = response.body() ?: emptyList()
                Result.success(dtos.map { it.toDomainEvent() })
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Please check your connection."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to fetch events."))
        }
    }

    suspend fun getEventById(id: String): Result<Event> {
        return try {
            val response = apiService.getEventById(id)
            if (response.isSuccessful) {
                val dto = response.body()
                if (dto != null) {
                    Result.success(dto.toDomainEvent())
                } else {
                    Result.failure(Exception("Event details not found."))
                }
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Please check your connection."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to load event details."))
        }
    }

    suspend fun createEvent(request: CreateEventRequest): Result<Event> {
        return try {
            val response = apiService.createEvent(request)
            if (response.isSuccessful) {
                val dto = response.body()
                if (dto != null) {
                    Result.success(dto.toDomainEvent())
                } else {
                    Result.failure(Exception("Event created but response format was invalid."))
                }
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Could not reach server to create event."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to create event."))
        }
    }

    suspend fun updateEvent(id: String, request: UpdateEventRequest): Result<Event> {
        return try {
            val response = apiService.updateEvent(id, request)
            if (response.isSuccessful) {
                val dto = response.body()
                if (dto != null) {
                    Result.success(dto.toDomainEvent())
                } else {
                    Result.failure(Exception("Event updated but invalid response payload returned."))
                }
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Could not reach server to update event."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to update event."))
        }
    }

    suspend fun deleteEvent(id: String): Result<Unit> {
        return try {
            val response = apiService.deleteEvent(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Could not delete event."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to delete event."))
        }
    }

    private fun parseError(errorJson: String?, statusCode: Int): String {
        if (errorJson.isNullOrBlank()) {
            return when (statusCode) {
                400 -> "Bad request. Please check input parameters."
                401 -> "Unauthorized. Please log in again."
                403 -> "Forbidden. You do not have permission to perform this event operation."
                404 -> "Requested event not found."
                500 -> "Server error while processing event."
                else -> "API Error (HTTP $statusCode)."
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
