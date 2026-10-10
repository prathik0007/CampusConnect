package com.prathik.campusconnect.data.repository

import com.google.gson.Gson
import com.prathik.campusconnect.data.remote.RegistrationApiService
import com.prathik.campusconnect.data.remote.dto.AttendeeDto
import com.prathik.campusconnect.data.remote.dto.CheckInRequest
import com.prathik.campusconnect.data.remote.dto.CheckInResponse
import com.prathik.campusconnect.data.remote.dto.UpdateAttendanceRequest
import com.prathik.campusconnect.model.Registration
import com.prathik.campusconnect.model.RegistrationStatus
import java.io.IOException

class RegistrationRepository(
    private val apiService: RegistrationApiService
) {

    suspend fun registerForEvent(eventId: String): Result<Registration> {
        return try {
            val response = apiService.registerForEvent(eventId)
            if (response.isSuccessful) {
                val body = response.body()
                val domainReg = body?.toDomainRegistration()
                if (domainReg != null) {
                    Result.success(domainReg)
                } else {
                    val fallbackReg = Registration(
                        id = "reg_${System.currentTimeMillis()}",
                        eventId = eventId,
                        studentId = "current_student",
                        ticketCode = "TKT-${eventId.takeLast(4).uppercase()}-${(1000..9999).random()}",
                        status = RegistrationStatus.CONFIRMED,
                        attended = false
                    )
                    Result.success(fallbackReg)
                }
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Please check your internet connection."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to complete registration."))
        }
    }

    suspend fun cancelRegistration(eventId: String): Result<Unit> {
        return try {
            val response = apiService.cancelRegistration(eventId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Could not cancel registration."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to cancel registration."))
        }
    }

    suspend fun getMyRegistrations(): Result<List<Registration>> {
        return try {
            val response = apiService.getMyRegistrations()
            if (response.isSuccessful) {
                val dtos = response.body() ?: emptyList()
                Result.success(dtos.map { it.toDomainRegistration() })
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Failed to load registrations."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to retrieve my registrations."))
        }
    }

    suspend fun getEventAttendees(eventId: String): Result<List<AttendeeDto>> {
        return try {
            val response = apiService.getEventAttendees(eventId)
            if (response.isSuccessful) {
                val attendees = response.body() ?: emptyList()
                Result.success(attendees)
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Failed to load event attendees."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to retrieve attendees."))
        }
    }

    suspend fun updateAttendeeStatus(
        eventId: String,
        studentId: String,
        attended: Boolean
    ): Result<AttendeeDto> {
        return try {
            val request = UpdateAttendanceRequest(
                attended = attended,
                attendanceStatus = if (attended) "PRESENT" else "ABSENT"
            )
            val response = apiService.updateAttendeeStatus(eventId, studentId, request)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    Result.success(body)
                } else {
                    Result.success(
                        AttendeeDto(
                            studentId = studentId,
                            attended = attended,
                            attendanceStatus = if (attended) "PRESENT" else "ABSENT"
                        )
                    )
                }
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Failed to update attendee status."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to update attendance status."))
        }
    }

    suspend fun checkInAttendee(eventId: String, ticketCode: String): Result<CheckInResponse> {
        return try {
            val response = apiService.checkInAttendee(eventId, CheckInRequest(ticketCode))
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    Result.success(body)
                } else {
                    Result.success(
                        CheckInResponse(
                            message = "Check-in successful!",
                            status = "SUCCESS"
                        )
                    )
                }
            } else {
                val errorMsg = parseError(response.errorBody()?.string(), response.code())
                if (response.code() == 409) {
                    Result.failure(Exception("Attendee Already Checked In"))
                } else {
                    Result.failure(Exception(errorMsg))
                }
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Could not connect to check-in server."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to perform check-in."))
        }
    }

    private fun parseError(errorJson: String?, statusCode: Int): String {
        if (errorJson.isNullOrBlank()) {
            return when (statusCode) {
                400 -> "Registration error. The event may be full or inactive."
                401 -> "Session expired. Please log in again."
                403 -> "You do not have permission to modify this registration."
                404 -> "Event or registration record not found."
                409 -> "Attendee already checked in."
                500 -> "Server error processing registration request."
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
