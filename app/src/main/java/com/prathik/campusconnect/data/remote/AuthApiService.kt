package com.prathik.campusconnect.data.remote

import com.prathik.campusconnect.data.remote.dto.LoginRequest
import com.prathik.campusconnect.data.remote.dto.LoginResponse
import com.prathik.campusconnect.data.remote.dto.RegisterRequest
import com.prathik.campusconnect.data.remote.dto.UserResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApiService {

    @POST("api/auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<LoginResponse>

    @POST("api/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @GET("api/auth/me")
    suspend fun getCurrentUser(): Response<UserResponse>
}
