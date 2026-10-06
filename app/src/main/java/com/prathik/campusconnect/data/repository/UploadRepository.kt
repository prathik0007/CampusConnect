package com.prathik.campusconnect.data.repository

import android.content.Context
import android.net.Uri
import com.google.gson.Gson
import com.prathik.campusconnect.data.remote.UploadApiService
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

class UploadRepository(
    private val apiService: UploadApiService
) {

    suspend fun uploadEventBanner(context: Context, imageUri: Uri): Result<String> {
        return try {
            val contentResolver = context.contentResolver
            val mimeType = contentResolver.getType(imageUri) ?: "image/jpeg"

            val inputStream = contentResolver.openInputStream(imageUri)
                ?: return Result.failure(Exception("Unable to open selected image file."))

            val bytes = inputStream.readBytes()
            inputStream.close()

            if (bytes.isEmpty()) {
                return Result.failure(Exception("Selected image is empty."))
            }

            // Check file size (e.g. 10MB limit)
            if (bytes.size > 10 * 1024 * 1024) {
                return Result.failure(Exception("Image file size exceeds 10MB limit."))
            }

            val requestFile = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
            val multipartPart = MultipartBody.Part.createFormData("image", "event_banner.jpg", requestFile)

            val response = apiService.uploadEventBanner(multipartPart)
            if (response.isSuccessful) {
                val body = response.body()
                val uploadedUrl = body?.getUploadedUrl()
                if (!uploadedUrl.isNullOrBlank()) {
                    Result.success(uploadedUrl)
                } else {
                    Result.failure(Exception("Image uploaded successfully but no URL was returned."))
                }
            } else {
                Result.failure(Exception(parseError(response.errorBody()?.string(), response.code())))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error while uploading image. Please check your connection."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Image upload failed."))
        }
    }

    private fun parseError(errorJson: String?, statusCode: Int): String {
        if (errorJson.isNullOrBlank()) {
            return when (statusCode) {
                400 -> "Invalid image payload or format."
                401 -> "Session expired. Please log in again."
                413 -> "Image file size is too large."
                500 -> "Server error during image processing."
                else -> "Image upload failed (HTTP $statusCode)."
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
