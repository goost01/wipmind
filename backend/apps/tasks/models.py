from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Task(models.Model):
    class Priority(models.TextChoices):
        HIGH = 'ALTA', 'Alta'
        MEDIUM = 'MEDIA', 'Media'
        LOW = 'BAJA', 'Baja'

    class Status(models.TextChoices):
        TODO = 'TODO', 'Por Hacer'
        IN_PROGRESS = 'IN_PROGRESS', 'En Proceso'
        DONE = 'DONE', 'Terminado'

    PRIORITY_WEIGHTS = {
        Priority.HIGH: 3,
        Priority.MEDIUM: 2,
        Priority.LOW: 1,
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    asignatura = models.CharField(max_length=200)
    fecha_entrega = models.DateField()
    prioridad = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    dificultad_estimada = models.PositiveSmallIntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    estado = models.CharField(max_length=15, choices=Status.choices, default=Status.TODO)
    tiempo_estimado_horas = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['fecha_entrega', '-prioridad']
        verbose_name = 'Tarea'
        verbose_name_plural = 'Tareas'

    def __str__(self):
        return f'[{self.prioridad}] {self.titulo} — {self.asignatura}'

    @property
    def dias_restantes(self):
        delta = self.fecha_entrega - timezone.now().date()
        return max(1, delta.days)

    @property
    def factor_urgencia(self):
        dias = self.dias_restantes
        if dias <= 2:
            return 3.0
        if dias <= 7:
            return 1.5
        return 1.0

    @property
    def peso_cognitivo(self):
        """Contribución individual de esta tarea al score de densidad."""
        peso_prioridad = self.PRIORITY_WEIGHTS.get(self.prioridad, 2)
        return (peso_prioridad * self.dificultad_estimada * self.factor_urgencia) / self.dias_restantes

    @property
    def esta_vencida(self):
        return self.fecha_entrega < timezone.now().date() and self.estado != self.Status.DONE


class PomodoroSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pomodoro_sessions')
    tarea = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='pomodoro_sessions')
    inicio = models.DateTimeField(auto_now_add=True)
    fin = models.DateTimeField(null=True, blank=True)
    ciclos_completados = models.PositiveSmallIntegerField(default=0)
    duracion_trabajo_minutos = models.PositiveSmallIntegerField(default=25)
    duracion_descanso_minutos = models.PositiveSmallIntegerField(default=5)

    class Meta:
        ordering = ['-inicio']
        verbose_name = 'Sesión Pomodoro'
        verbose_name_plural = 'Sesiones Pomodoro'

    def __str__(self):
        return f'Pomodoro {self.user.username} — {self.inicio.strftime("%Y-%m-%d %H:%M")}'
