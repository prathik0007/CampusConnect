package com.prathik.campusconnect.data.remote.dto

import com.google.gson.annotations.SerializedName

data class UploadResponse(
    @SerializedName("imageUrl")
    val imageUrl: String? = null,

    @SerializedName("bannerUrl")
    val bannerUrl: String? = null,

    @SerializedName("url")
    val url: String? = null,

    @SerializedName("image")
    val image: String? = null,

    @SerializedName("message")
    val message: String? = null
) {
    fun getUploadedUrl(): String? = imageUrl ?: bannerUrl ?: url ?: image
}
