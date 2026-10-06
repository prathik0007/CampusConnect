package com.prathik.campusconnect.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.prathik.campusconnect.model.User
import com.prathik.campusconnect.model.UserRole

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val role: String
)

data class LoginResponse(
    @SerializedName("token")
    val token: String? = null,

    @SerializedName("accessToken")
    val accessToken: String? = null,

    @SerializedName("user")
    val user: UserDto? = null,

    @SerializedName("message")
    val message: String? = null
) {
    fun getJwtToken(): String? = token ?: accessToken
}

data class UserDto(
    @SerializedName("id")
    val id: String? = null,

    @SerializedName("_id")
    val mongoId: String? = null,

    @SerializedName("name")
    val name: String? = null,

    @SerializedName("email")
    val email: String? = null,

    @SerializedName("role")
    val role: String? = null
) {
    fun toDomainUser(): User {
        val finalId = id ?: mongoId ?: "user_${System.currentTimeMillis()}"
        val finalName = name ?: "Campus User"
        val finalEmail = email ?: ""
        val parsedRole = if (role.equals("ORGANIZER", ignoreCase = true)) {
            UserRole.ORGANIZER
        } else {
            UserRole.STUDENT
        }
        return User(
            id = finalId,
            name = finalName,
            email = finalEmail,
            role = parsedRole
        )
    }
}

data class UserResponse(
    @SerializedName("user")
    val user: UserDto? = null,

    @SerializedName("data")
    val dataUser: UserDto? = null,

    @SerializedName("id")
    val directId: String? = null,

    @SerializedName("name")
    val directName: String? = null,

    @SerializedName("email")
    val directEmail: String? = null,

    @SerializedName("role")
    val directRole: String? = null
) {
    fun toDomainUser(): User {
        if (user != null) return user.toDomainUser()
        if (dataUser != null) return dataUser.toDomainUser()
        return UserDto(
            id = directId,
            name = directName,
            email = directEmail,
            role = directRole
        ).toDomainUser()
    }
}
