from django.urls import path
from . import views

urlpatterns = [
    path('', views.task_list_create, name='api-tasks'),
    path('<int:pk>/', views.task_detail, name='api-task-detail'),
    path('<int:pk>/estado/', views.task_change_status, name='api-task-status'),
    path('pomodoro/', views.pomodoro_sessions, name='api-pomodoro'),
    path('pomodoro/<int:pk>/ciclo/', views.pomodoro_complete_cycle, name='api-pomodoro-cycle'),
]
