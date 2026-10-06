package com.prathik.campusconnect

import com.prathik.campusconnect.model.UserRole
import com.prathik.campusconnect.viewmodel.RegistrationViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class RegistrationViewModelTest {

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
    fun uninitialized_repository_initializes_with_local_state() {
        val viewModel = RegistrationViewModel(registrationRepository = null)
        assertNotNull(viewModel.uiState.value.myRegistrations)
    }

    @Test
    fun register_for_event_local_fallback_success() {
        val viewModel = RegistrationViewModel(registrationRepository = null)
        var callbackExecuted = false
        viewModel.registerForEvent("evt_01") {
            callbackExecuted = true
        }
        assertTrue(callbackExecuted)
        assertEquals("Registration successful!", viewModel.uiState.value.actionMessage)
    }

    @Test
    fun cancel_registration_local_fallback_success() {
        val viewModel = RegistrationViewModel(registrationRepository = null)
        var callbackExecuted = false
        viewModel.cancelRegistration("evt_01") {
            callbackExecuted = true
        }
        assertTrue(callbackExecuted)
        assertEquals("Registration cancelled.", viewModel.uiState.value.actionMessage)
    }

    @Test
    fun student_role_is_not_organizer() {
        val role = UserRole.STUDENT
        assertTrue(role != UserRole.ORGANIZER)
    }

    @Test
    fun clear_messages_resets_action_messages() {
        val viewModel = RegistrationViewModel(registrationRepository = null)
        viewModel.registerForEvent("evt_01")
        viewModel.clearMessages()
        assertEquals(null, viewModel.uiState.value.actionMessage)
        assertEquals(null, viewModel.uiState.value.actionError)
    }
}
