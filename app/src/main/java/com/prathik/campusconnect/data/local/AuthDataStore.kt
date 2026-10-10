package com.prathik.campusconnect.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.prathik.campusconnect.model.User
import com.prathik.campusconnect.model.UserRole
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

class AuthDataStore(private val context: Context) {

    companion object {
        private val JWT_TOKEN_KEY = stringPreferencesKey("jwt_token")
        private val USER_ID_KEY = stringPreferencesKey("user_id")
        private val USER_NAME_KEY = stringPreferencesKey("user_name")
        private val USER_EMAIL_KEY = stringPreferencesKey("user_email")
        private val USER_ROLE_KEY = stringPreferencesKey("user_role")
    }

    val tokenFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[JWT_TOKEN_KEY]
    }

    suspend fun saveToken(token: String, user: User? = null) {
        context.dataStore.edit { preferences ->
            preferences[JWT_TOKEN_KEY] = token
            if (user != null) {
                preferences[USER_ID_KEY] = user.id
                preferences[USER_NAME_KEY] = user.name
                preferences[USER_EMAIL_KEY] = user.email
                preferences[USER_ROLE_KEY] = user.role.name
            }
        }
    }

    suspend fun saveUserCache(user: User) {
        context.dataStore.edit { preferences ->
            preferences[USER_ID_KEY] = user.id
            preferences[USER_NAME_KEY] = user.name
            preferences[USER_EMAIL_KEY] = user.email
            preferences[USER_ROLE_KEY] = user.role.name
        }
    }

    suspend fun getToken(): String? {
        return context.dataStore.data.map { preferences ->
            preferences[JWT_TOKEN_KEY]
        }.firstOrNull()
    }

    suspend fun getCachedUser(): User? {
        return context.dataStore.data.map { preferences ->
            val id = preferences[USER_ID_KEY]
            val name = preferences[USER_NAME_KEY]
            val email = preferences[USER_EMAIL_KEY]
            val roleStr = preferences[USER_ROLE_KEY]

            if (!id.isNullOrBlank() && !email.isNullOrBlank()) {
                val parsedRole = if (roleStr.equals("ORGANIZER", ignoreCase = true)) {
                    UserRole.ORGANIZER
                } else {
                    UserRole.STUDENT
                }
                User(
                    id = id,
                    name = name ?: "Campus User",
                    email = email,
                    role = parsedRole
                )
            } else {
                null
            }
        }.firstOrNull()
    }

    suspend fun clearToken() {
        context.dataStore.edit { preferences ->
            preferences.remove(JWT_TOKEN_KEY)
            preferences.remove(USER_ID_KEY)
            preferences.remove(USER_NAME_KEY)
            preferences.remove(USER_EMAIL_KEY)
            preferences.remove(USER_ROLE_KEY)
        }
    }
}
