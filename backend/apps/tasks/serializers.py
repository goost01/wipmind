from rest_framework import serializers
from django.utils import timezone
from .models import Task, PomodoroSession


class TaskSerializer(serializers.ModelSerializer):
    dias_restantes = serializers.ReadOnlyField()
    factor_urgencia = serializers.ReadOnlyField()
    peso_cognitivo = serializers.ReadOnlyField()
    esta_vencida = serializers.ReadOnlyField()

    class Meta:
        model = Task
        fields = [
            'id', 'titulo', 'descripcion', 'asignatura',
            'fecha_entrega', 'prioridad', 'dificultad_estimada',
            'estado', 'tiempo_estimado_horas',
            'dias_restantes', 'factor_urgencia', 'peso_cognitivo', 'esta_vencida',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_fecha_entrega(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError('La fecha de entrega no puede ser anterior a hoy.')
        return value

    def validate_dificultad_estimada(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('La dificultad debe estar entre 1 y 5.')
        return value


class TaskEstadoSerializer(serializers.ModelSerializer):
    """Serializer específico para cambiar solo el estado con validación WIP."""

    class Meta:
        model = Task
        fields = ['estado']

    def validate_estado(self, value):
        request = self.context.get('request')
        task = self.instance

        if value == Task.Status.IN_PROGRESS and task.estado != Task.Status.IN_PROGRESS:
            wip_limit = request.user.profile.wip_limit
            tareas_en_progreso = request.user.tasks.filter(estado=Task.Status.IN_PROGRESS).count()
            if tareas_en_progreso >= wip_limit:
                raise serializers.ValidationError(
                    f'Límite WIP alcanzado ({tareas_en_progreso}/{wip_limit}). '
                    f'Termina una tarea antes de comenzar otra.'
                )
        return value


class PomodoroSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PomodoroSession
        fields = [
            'id', 'tarea', 'inicio', 'fin',
            'ciclos_completados', 'duracion_trabajo_minutos', 'duracion_descanso_minutos',
        ]
        read_only_fields = ['id', 'inicio']
