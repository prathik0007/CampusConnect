package com.prathik.campusconnect

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.prathik.campusconnect.data.local.AuthDataStore
import com.prathik.campusconnect.data.remote.RetrofitClient
import com.prathik.campusconnect.data.repository.AuthRepository
import com.prathik.campusconnect.data.repository.EventRepository
import com.prathik.campusconnect.data.repository.RegistrationRepository
import com.prathik.campusconnect.navigation.CampusConnectNavGraph
import com.prathik.campusconnect.ui.theme.CampusconnectTheme
import com.prathik.campusconnect.viewmodel.AuthViewModel
import com.prathik.campusconnect.viewmodel.AuthViewModelFactory
import com.prathik.campusconnect.viewmodel.EventViewModel
import com.prathik.campusconnect.viewmodel.EventViewModelFactory
import com.prathik.campusconnect.viewmodel.RegistrationViewModel
import com.prathik.campusconnect.viewmodel.RegistrationViewModelFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val authDataStore = AuthDataStore(applicationContext)
        val authApiService = RetrofitClient.createAuthApiService(authDataStore)
        val authRepository = AuthRepository(authApiService, authDataStore)
        val authViewModelFactory = AuthViewModelFactory(authRepository)

        val eventApiService = RetrofitClient.createEventApiService(authDataStore)
        val eventRepository = EventRepository(eventApiService)
        val eventViewModelFactory = EventViewModelFactory(eventRepository)

        val registrationApiService = RetrofitClient.createRegistrationApiService(authDataStore)
        val registrationRepository = RegistrationRepository(registrationApiService)
        val registrationViewModelFactory = RegistrationViewModelFactory(registrationRepository)

        setContent {
            CampusconnectTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val authViewModel: AuthViewModel = viewModel(factory = authViewModelFactory)
                    val eventViewModel: EventViewModel = viewModel(factory = eventViewModelFactory)
                    val registrationViewModel: RegistrationViewModel = viewModel(factory = registrationViewModelFactory)

                    CampusConnectNavGraph(
                        authViewModel = authViewModel,
                        eventViewModel = eventViewModel,
                        registrationViewModel = registrationViewModel
                    )
                }
            }
        }
    }
}
