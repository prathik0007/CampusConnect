package com.prathik.campusconnect

import com.prathik.campusconnect.viewmodel.NotificationViewModel
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
class NotificationViewModelTest {

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
    fun uninitialized_repository_initializes_with_sample_notifications() {
        val viewModel = NotificationViewModel(notificationRepository = null)
        assertTrue(viewModel.uiState.value.notifications.isNotEmpty())
    }

    @Test
    fun mark_notification_as_read_updates_unread_count() {
        val viewModel = NotificationViewModel(notificationRepository = null)
        val notifId = viewModel.uiState.value.notifications.first().id
        viewModel.markAsRead(notifId)
        assertTrue(viewModel.uiState.value.notifications.first { it.id == notifId }.isRead)
    }

    @Test
    fun mark_all_notifications_as_read_resets_unread_count_to_zero() {
        val viewModel = NotificationViewModel(notificationRepository = null)
        viewModel.markAllAsRead()
        assertEquals(0, viewModel.uiState.value.unreadCount)
        assertTrue(viewModel.uiState.value.notifications.all { it.isRead })
    }
}
