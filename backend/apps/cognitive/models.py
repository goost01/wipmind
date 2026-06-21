from django.db import models
from django.contrib.auth.models import User


class AcademicDensityLog(models.Model):
    class Level(models.TextChoices):
        LOW = 'BAJO', 'Bajo'
        MEDIUM = 'MEDIO', 'Medio'
        HIGH = 'ALTO', 'Alto'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='density_logs')
    score_raw = models.FloatField()
    score_normalizado = models.FloatField()
    nivel = models.CharField(max_length=10, choices=Level.choices)
    tareas_activas = models.PositiveSmallIntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Registro de Densidad Académica'
        verbose_name_plural = 'Registros de Densidad Académica'

    def __str__(self):
        return f'{self.user.username} — {self.nivel} ({self.score_normalizado:.0f}%) — {self.timestamp.strftime("%Y-%m-%d")}'
