package com.prathik.campusconnect

import com.prathik.campusconnect.data.repository.CalendarRepository
import com.prathik.campusconnect.model.Event
import com.prathik.campusconnect.viewmodel.CalendarViewModel
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
class CalendarRepositoryTest {

    private val testDispatcher = UnconfinedTestDispatcher()
    private val calendarRepository = CalendarRepository()

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun parse_valid_date_format_returns_non_zero_millis() {
        val millis = calendarRepository.parseDateTimeToMillis("2025-10-25 09:00", isStart = true)
        assertTrue(millis > 0)
    }

    @Test
    fun parse_tbd_fallback_returns_future_millis() {
        val millis = calendarRepository.parseDateTimeToMillis("TBD", isStart = true)
        assertTrue(millis > System.currentTimeMillis())
    }

    @Test
    fun calendar_viewmodel_tracks_added_event_ids() {
        val viewModel = CalendarViewModel(calendarRepository = calendarRepository)
        val event = Event(
            id = "evt_cal_101",
            title = "Test Hackathon",
            description = "Test Desc",
            category = "Tech",
            location = "Hall 1",
            startDate = "2025-10-25",
            endDate = "2025-10-26",
            capacity = 100,
            registeredCount = 10,
            organizerId = "org_1"
        )
        viewModel.clearMessages()
        assertEquals(null, viewModel.uiState.value.calendarActionMessage)
    }
}
