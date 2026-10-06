package com.prathik.campusconnect.data.remote

import com.prathik.campusconnect.data.remote.dto.UploadResponse
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface UploadApiService {

    @Multipart
    @POST("api/uploads/event-banner")
    suspend fun uploadEventBanner(
        @Part image: MultipartBody.Part
    ): Response<UploadResponse>
}
