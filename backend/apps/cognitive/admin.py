from django.contrib import admin
from .models import AcademicDensityLog


@admin.register(AcademicDensityLog)
class AcademicDensityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'nivel', 'score_normalizado', 'tareas_activas', 'timestamp']
    list_filter = ['nivel', 'user']
    ordering = ['-timestamp']
