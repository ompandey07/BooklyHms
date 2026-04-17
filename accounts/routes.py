from django.urls import path
from . import views

urlpatterns = [
    # API endpoints for React + JWT
    path('/login/', views.login_view, name='login'),
   
]