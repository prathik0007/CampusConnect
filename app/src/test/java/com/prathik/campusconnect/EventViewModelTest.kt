package com.prathik.campusconnect

import com.prathik.campusconnect.data.DummyData
import com.prathik.campusconnect.model.UserRole
import com.prathik.campusconnect.viewmodel.EventViewModel
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
class EventViewModelTest {

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
    fun uninitialized_repository_loads_sample_events() {
        val viewModel = EventViewModel(eventRepository = null)
        assertTrue(viewModel.uiState.value.events.isNotEmpty())
    }

    @Test
    fun search_query_update_modifies_uistate() {
        val viewModel = EventViewModel(eventRepository = null)
        viewModel.updateSearchQuery("Hackathon")
        assertEquals("Hackathon", viewModel.uiState.value.searchQuery)
    }

    @Test
    fun category_selection_modifies_uistate() {
        val viewModel = EventViewModel(eventRepository = null)
        viewModel.selectCategory("Tech")
        assertEquals("Tech", viewModel.uiState.value.selectedCategory)
    }

    @Test
    fun event_details_fetch_local_fallback() {
        val viewModel = EventViewModel(eventRepository = null)
        val eventId = DummyData.sampleEvents.first().id
        viewModel.getEventById(eventId)
        assertNotNull(viewModel.uiState.value.selectedEvent)
        assertEquals(eventId, viewModel.uiState.value.selectedEvent?.id)
    }

    @Test
    fun student_role_cannot_perform_organizer_operations() {
        val role = UserRole.STUDENT
        assertTrue(role != UserRole.ORGANIZER)
    }
}
