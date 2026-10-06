package com.prathik.campusconnect

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.prathik.campusconnect.data.local.AuthDataStore
import com.prathik.campusconnect.data.remote.RetrofitClient
import com.prathik.campusconnect.data.repository.AuthRepository
import com.prathik.campusconnect.data.repository.EventRepository
import com.prathik.campusconnect.data.repository.NotificationRepository
import com.prathik.campusconnect.data.repository.RegistrationRepository
import com.prathik.campusconnect.data.repository.UploadRepository
import com.prathik.campusconnect.navigation.CampusConnectNavGraph
import com.prathik.campusconnect.service.CampusFirebaseMessagingService
import com.prathik.campusconnect.ui.theme.CampusconnectTheme
import com.prathik.campusconnect.viewmodel.AuthViewModel
import com.prathik.campusconnect.viewmodel.AuthViewModelFactory
import com.prathik.campusconnect.viewmodel.EventViewModel
import com.prathik.campusconnect.viewmodel.EventViewModelFactory
import com.prathik.campusconnect.viewmodel.NotificationViewModel
import com.prathik.campusconnect.viewmodel.NotificationViewModelFactory
import com.prathik.campusconnect.viewmodel.RegistrationViewModel
import com.prathik.campusconnect.viewmodel.RegistrationViewModelFactory

class MainActivity : ComponentActivity() {

    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        // Permission status handled
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        requestNotificationPermissionIfNeeded()

        val authDataStore = AuthDataStore(applicationContext)
        val authApiService = RetrofitClient.createAuthApiService(authDataStore)
        val authRepository = AuthRepository(authApiService, authDataStore)
        val authViewModelFactory = AuthViewModelFactory(authRepository)

        val uploadApiService = RetrofitClient.createUploadApiService(authDataStore)
        val uploadRepository = UploadRepository(uploadApiService)

        val eventApiService = RetrofitClient.createEventApiService(authDataStore)
        val eventRepository = EventRepository(eventApiService)
        val eventViewModelFactory = EventViewModelFactory(eventRepository, uploadRepository)

        val registrationApiService = RetrofitClient.createRegistrationApiService(authDataStore)
        val registrationRepository = RegistrationRepository(registrationApiService)
        val registrationViewModelFactory = RegistrationViewModelFactory(registrationRepository)

        val notificationApiService = RetrofitClient.createNotificationApiService(authDataStore)
        val notificationRepository = NotificationRepository(notificationApiService)
        val notificationViewModelFactory = NotificationViewModelFactory(notificationRepository)

        setContent {
            CampusconnectTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val authViewModel: AuthViewModel = viewModel(factory = authViewModelFactory)
                    val eventViewModel: EventViewModel = viewModel(factory = eventViewModelFactory)
                    val registrationViewModel: RegistrationViewModel = viewModel(factory = registrationViewModelFactory)
                    val notificationViewModel: NotificationViewModel = viewModel(factory = notificationViewModelFactory)

                    // Register latest FCM token with backend if available
                    CampusFirebaseMessagingService.latestFcmToken?.let { token ->
                        notificationViewModel.registerDeviceToken(token)
                    }

                    CampusConnectNavGraph(
                        authViewModel = authViewModel,
                        eventViewModel = eventViewModel,
                        registrationViewModel = registrationViewModel,
                        notificationViewModel = notificationViewModel
                    )
                }
            }
        }
    }

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val permission = Manifest.permission.POST_NOTIFICATIONS
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                requestNotificationPermissionLauncher.launch(permission)
            }
        }
    }
}
