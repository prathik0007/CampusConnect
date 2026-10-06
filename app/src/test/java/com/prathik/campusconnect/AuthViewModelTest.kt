package com.prathik.campusconnect

import com.prathik.campusconnect.model.User
import com.prathik.campusconnect.model.UserRole
import com.prathik.campusconnect.viewmodel.AuthState
import com.prathik.campusconnect.viewmodel.AuthViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class AuthViewModelTest {

    private val testDispatcher = UnconfinedTestDispatcher()

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun uninitialized_repository_defaults_to_unauthenticated() {
        val viewModel = AuthViewModel(authRepository = null)
        assertTrue(viewModel.authState.value is AuthState.Unauthenticated)
    }

    @Test
    fun blank_login_credentials_sets_error_state() {
        val viewModel = AuthViewModel(authRepository = null)
        viewModel.login("", "")
        assertTrue(viewModel.authState.value is AuthState.Error)
        assertEquals("Please fill in email and password.", (viewModel.authState.value as AuthState.Error).message)
    }

    @Test
    fun logout_resets_auth_state_to_unauthenticated() {
        val viewModel = AuthViewModel(authRepository = null)
        viewModel.logout()
        assertTrue(viewModel.authState.value is AuthState.Unauthenticated)
    }

    @Test
    fun student_user_role_verification() {
        val student = User("1", "Student Alex", "student@campusconnect.com", UserRole.STUDENT)
        val state = AuthState.Authenticated(student)
        assertEquals(UserRole.STUDENT, state.user.role)
    }

    @Test
    fun organizer_user_role_verification() {
        val organizer = User("2", "Org Admin", "organizer@campusconnect.com", UserRole.ORGANIZER)
        val state = AuthState.Authenticated(organizer)
        assertEquals(UserRole.ORGANIZER, state.user.role)
    }
}
