from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

urlpatterns = [
    # Autenticación y tokens
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.authtoken')),
    
    # Rutas de pacientes
    path('pacientes/', views.PacienteListCreateView.as_view(), name='paciente-list-create'),
    path('pacientes/<str:id_paciente>/', views.PacienteDetailView.as_view(), name='paciente-detail'),
    path('pacientes/qr/buscar/', views.buscar_por_qr, name='buscar-paciente-qr'),
    path('pacientes/<str:id_paciente>/alta/', views.actualizar_estado_alta, name='actualizar-alta-paciente'),

    # Añadir URL para actividades del usuario
    path('actividades/', views.ActividadesUsuarioView.as_view(), name='actividades-usuario'),
]