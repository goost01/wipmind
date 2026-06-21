"""
Motor de cálculo de densidad académica de WipMind.

Fórmula:
    DA = Σ [ (Peso_Prioridad × Peso_Dificultad × Factor_Urgencia) / dias_restantes ]

La normalización usa el máximo score histórico del usuario (mínimo de referencia: 15)
para expresar el resultado como porcentaje (0–100%).
"""

from django.utils import timezone
from .models import AcademicDensityLog

DENSITY_HIGH = 67
DENSITY_MEDIUM = 34
REFERENCE_SCORE_MIN = 15.0  # score base mínimo de normalización


def calcular_densidad(user):
    """
    Calcula la densidad académica actual del usuario.

    Solo considera tareas en estado TODO o IN_PROGRESS.
    Guarda un registro en AcademicDensityLog.

    Returns:
        dict con: score_raw, score_normalizado, nivel, tareas_activas, detalle_tareas
    """
    tareas_activas = user.tasks.filter(
        estado__in=['TODO', 'IN_PROGRESS'],
        fecha_entrega__gte=timezone.now().date()
    )

    score_raw = sum(t.peso_cognitivo for t in tareas_activas)

    score_normalizado = _normalizar_score(score_raw, user)

    nivel = _clasificar_nivel(score_normalizado)

    log = AcademicDensityLog.objects.create(
        user=user,
        score_raw=score_raw,
        score_normalizado=score_normalizado,
        nivel=nivel,
        tareas_activas=tareas_activas.count(),
    )

    detalle = [
        {
            'id': t.id,
            'titulo': t.titulo,
            'peso_cognitivo': round(t.peso_cognitivo, 3),
            'dias_restantes': t.dias_restantes,
            'factor_urgencia': t.factor_urgencia,
        }
        for t in tareas_activas
    ]

    return {
        'score_raw': round(score_raw, 3),
        'score_normalizado': round(score_normalizado, 1),
        'nivel': nivel,
        'tareas_activas': tareas_activas.count(),
        'detalle_tareas': detalle,
        'log_id': log.id,
    }


def _normalizar_score(score_raw, user):
    """
    Normaliza score_raw a 0–100% usando el máximo histórico del usuario.
    El denominador mínimo es REFERENCE_SCORE_MIN para evitar que un usuario
    nuevo sin historial siempre vea 100%.
    """
    max_historico = (
        AcademicDensityLog.objects
        .filter(user=user)
        .order_by('-score_raw')
        .values_list('score_raw', flat=True)
        .first()
    ) or 0.0

    denominador = max(score_raw, max_historico, REFERENCE_SCORE_MIN)

    return min((score_raw / denominador) * 100, 100.0)


def _clasificar_nivel(score_normalizado):
    if score_normalizado >= DENSITY_HIGH:
        return AcademicDensityLog.Level.HIGH
    if score_normalizado >= DENSITY_MEDIUM:
        return AcademicDensityLog.Level.MEDIUM
    return AcademicDensityLog.Level.LOW


def obtener_historial_densidad(user, dias=30):
    """
    Retorna el historial de densidad de los últimos N días.
    Un registro por día (el más reciente de cada día).
    """
    from django.db.models import DateField
    from django.db.models.functions import TruncDate

    registros = (
        AcademicDensityLog.objects
        .filter(user=user)
        .annotate(fecha=TruncDate('timestamp'))
        .order_by('fecha', '-timestamp')
    )

    vistos = set()
    resultado = []
    for r in registros:
        if r.fecha not in vistos:
            vistos.add(r.fecha)
            resultado.append({
                'fecha': r.fecha.isoformat(),
                'score': round(r.score_normalizado, 1),
                'nivel': r.nivel,
            })

    return sorted(resultado, key=lambda x: x['fecha'])[-dias:]
