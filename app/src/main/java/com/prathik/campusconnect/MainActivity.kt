package com.prathik.campusconnect

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.prathik.campusconnect.navigation.CampusConnectNavGraph
import com.prathik.campusconnect.ui.theme.CampusconnectTheme
import com.prathik.campusconnect.viewmodel.AuthViewModel
import com.prathik.campusconnect.viewmodel.EventViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CampusconnectTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val authViewModel: AuthViewModel = viewModel()
                    val eventViewModel: EventViewModel = viewModel()

                    CampusConnectNavGraph(
                        authViewModel = authViewModel,
                        eventViewModel = eventViewModel
                    )
                }
            }
        }
    }
}
