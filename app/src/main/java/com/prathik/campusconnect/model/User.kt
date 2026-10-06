package com.prathik.campusconnect.model

enum class UserRole {
    STUDENT,
    ORGANIZER
}

data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: UserRole
)
