package com.prathik.campusconnect.data.repository

import com.google.gson.Gson
import com.prathik.campusconnect.data.local.AuthDataStore
import com.prathik.campusconnect.data.remote.AuthApiService
import com.prathik.campusconnect.data.remote.dto.LoginRequest
import com.prathik.campusconnect.data.remote.dto.RegisterRequest
import com.prathik.campusconnect.model.User
import com.prathik.campusconnect.model.UserRole
import java.io.IOException

class AuthRepository(
    private val apiService: AuthApiService,
    private val authDataStore: AuthDataStore
) {

    suspend fun getStoredToken(): String? {
        return authDataStore.getToken()
    }

    suspend fun getCachedUser(): User? {
        return authDataStore.getCachedUser()
    }

    suspend fun saveUserCache(user: User) {
        authDataStore.saveUserCache(user)
    }

    suspend fun login(email: String, password: String): Result<User> {
        return try {
            val response = apiService.login(LoginRequest(email = email, password = password))
            if (response.isSuccessful) {
                val body = response.body()
                val token = body?.getJwtToken()
                val user = body?.user?.toDomainUser()

                if (!token.isNullOrBlank()) {
                    authDataStore.saveToken(token, user)
                }

                if (user != null) {
                    Result.success(user)
                } else if (!token.isNullOrBlank()) {
                    // If backend only returned token on login, fetch /me
                    getCurrentUser()
                } else {
                    Result.failure(Exception("Login succeeded but no user data or token was returned"))
                }
            } else {
                val errorMessage = parseErrorMessage(response.errorBody()?.string(), response.code())
                Result.failure(Exception(errorMessage))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network unavailable. Please check your connection."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "An unexpected error occurred during login."))
        }
    }

    suspend fun register(name: String, email: String, password: String, role: UserRole): Result<User> {
        return try {
            val request = RegisterRequest(
                name = name,
                email = email,
                password = password,
                role = role.name
            )
            val response = apiService.register(request)
            if (response.isSuccessful) {
                val body = response.body()
                val token = body?.getJwtToken()
                val user = body?.user?.toDomainUser()

                if (!token.isNullOrBlank()) {
                    authDataStore.saveToken(token, user)
                }

                if (user != null) {
                    Result.success(user)
                } else if (!token.isNullOrBlank()) {
                    getCurrentUser()
                } else {
                    // Registration succeeded without auto-login token; perform login
                    login(email, password)
                }
            } else {
                val errorMessage = parseErrorMessage(response.errorBody()?.string(), response.code())
                Result.failure(Exception(errorMessage))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network unavailable. Please check your connection."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "An unexpected error occurred during registration."))
        }
    }

    suspend fun getCurrentUser(): Result<User> {
        return try {
            val response = apiService.getCurrentUser()
            if (response.isSuccessful) {
                val body = response.body()
                val user = body?.toDomainUser()
                if (user != null) {
                    authDataStore.saveUserCache(user)
                    Result.success(user)
                } else {
                    Result.failure(Exception("Invalid response format from user session"))
                }
            } else {
                if (response.code() == 401) {
                    authDataStore.clearToken()
                }
                val errorMessage = parseErrorMessage(response.errorBody()?.string(), response.code())
                Result.failure(Exception(errorMessage))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network unavailable. Please check your connection."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to retrieve user profile."))
        }
    }

    suspend fun logout() {
        authDataStore.clearToken()
    }

    private fun parseErrorMessage(errorJson: String?, statusCode: Int): String {
        if (errorJson.isNullOrBlank()) {
            return when (statusCode) {
                400 -> "Invalid request. Please check input details."
                401 -> "Invalid credentials or unauthorized access."
                403 -> "Access forbidden."
                404 -> "Authentication endpoint not found."
                409 -> "An account with this email already exists."
                500 -> "Server error. Please try again later."
                else -> "Authentication failed (HTTP $statusCode)."
            }
        }
        return try {
            val map = Gson().fromJson(errorJson, Map::class.java)
            (map["message"] as? String) ?: (map["error"] as? String) ?: "HTTP Error $statusCode"
        } catch (e: Exception) {
            "HTTP Error $statusCode"
        }
    }
}
