from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from apps.tasks.models import Task
from apps.cognitive.algorithm import calcular_densidad


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """
    Retorna la lista de notificaciones activas para el usuario.
    Las notificaciones son generadas dinámicamente, no persistidas.
    """
    notificaciones = []
    hoy = timezone.now().date()
    manana = hoy + timedelta(days=1)

    tareas_urgentes = request.user.tasks.filter(
        estado__in=[Task.Status.TODO, Task.Status.IN_PROGRESS],
        fecha_entrega__lte=manana,
    )
    for tarea in tareas_urgentes:
        if tarea.fecha_entrega <= hoy:
            notificaciones.append({
                'tipo': 'VENCIDA',
                'titulo': f'Tarea vencida: {tarea.titulo}',
                'mensaje': f'La tarea "{tarea.titulo}" de {tarea.asignatura} venció hoy.',
                'tarea_id': tarea.id,
                'urgencia': 'CRITICA',
            })
        else:
            notificaciones.append({
                'tipo': 'PROXIMA',
                'titulo': f'Entrega mañana: {tarea.titulo}',
                'mensaje': f'La tarea "{tarea.titulo}" de {tarea.asignatura} vence mañana.',
                'tarea_id': tarea.id,
                'urgencia': 'ALTA',
            })

    densidad = calcular_densidad(request.user)
    if densidad['nivel'] == 'ALTO':
        notificaciones.append({
            'tipo': 'CARGA_COGNITIVA',
            'titulo': '¡Sobrecarga cognitiva detectada!',
            'mensaje': (
                f'Tu densidad académica es {densidad["score_normalizado"]:.0f}%. '
                'Considera hacer una pausa o reorganizar tus tareas.'
            ),
            'urgencia': 'ALTA',
        })

    wip_actual = request.user.tasks.filter(estado=Task.Status.IN_PROGRESS).count()
    wip_limit = request.user.profile.wip_limit
    if wip_actual >= wip_limit:
        notificaciones.append({
            'tipo': 'WIP_LIMITE',
            'titulo': f'Límite WIP alcanzado ({wip_actual}/{wip_limit})',
            'mensaje': 'Tienes el máximo de tareas en proceso. Termina alguna antes de comenzar otra.',
            'urgencia': 'MEDIA',
        })

    return Response({
        'notificaciones': notificaciones,
        'total': len(notificaciones),
    })
