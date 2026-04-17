from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    # API endpoints for React + JWT
    path('api/login/', views.ApiLoginView.as_view(), name='api_login'),
    path('api/register/', views.ApiRegisterView.as_view(), name='api_register'),
    path('api/forgot-password/', views.ApiForgotPasswordView.as_view(), name='api_forgot_password'),
    path('api/profile/', views.ApiProfileView.as_view(), name='api_profile'),

    # JWT refresh
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]