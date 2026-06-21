from django.contrib import admin
from .models import Task, PomodoroSession


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'asignatura', 'user', 'estado', 'prioridad', 'fecha_entrega', 'dificultad_estimada']
    list_filter = ['estado', 'prioridad', 'asignatura']
    search_fields = ['titulo', 'asignatura', 'user__username']
    ordering = ['fecha_entrega']


@admin.register(PomodoroSession)
class PomodoroSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'inicio', 'fin', 'ciclos_completados']
    list_filter = ['user']
