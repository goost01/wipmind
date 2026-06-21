from django.urls import path
from . import views

urlpatterns = [
    path('density/', views.density_current, name='api-density'),
    path('density/history/', views.density_history, name='api-density-history'),
]
