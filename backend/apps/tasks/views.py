from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Task, PomodoroSession
from .serializers import TaskSerializer, TaskEstadoSerializer, PomodoroSessionSerializer
from apps.cognitive.algorithm import calcular_densidad


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list_create(request):
    if request.method == 'GET':
        tareas = request.user.tasks.all()

        estado = request.query_params.get('estado')
        prioridad = request.query_params.get('prioridad')
        asignatura = request.query_params.get('asignatura')

        if estado:
            tareas = tareas.filter(estado=estado)
        if prioridad:
            tareas = tareas.filter(prioridad=prioridad)
        if asignatura:
            tareas = tareas.filter(asignatura__icontains=asignatura)

        serializer = TaskSerializer(tareas, many=True)
        return Response(serializer.data)

    serializer = TaskSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    tarea = serializer.save(user=request.user)

    densidad = calcular_densidad(request.user)

    return Response({
        'tarea': TaskSerializer(tarea).data,
        'densidad_actualizada': densidad,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    tarea = get_object_or_404(Task, pk=pk, user=request.user)

    if request.method == 'GET':
        return Response(TaskSerializer(tarea).data)

    if request.method == 'PUT':
        serializer = TaskSerializer(tarea, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        tarea = serializer.save()
        densidad = calcular_densidad(request.user)
        return Response({
            'tarea': TaskSerializer(tarea).data,
            'densidad_actualizada': densidad,
        })

    tarea.delete()
    densidad = calcular_densidad(request.user)
    return Response({
        'message': 'Tarea eliminada.',
        'densidad_actualizada': densidad,
    }, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def task_change_status(request, pk):
    """
    Cambia el estado de una tarea con validación WIP.
    Si se intenta mover a IN_PROGRESS y se supera el límite WIP,
    retorna 409 con mensaje descriptivo.
    """
    tarea = get_object_or_404(Task, pk=pk, user=request.user)

    serializer = TaskEstadoSerializer(tarea, data=request.data, context={'request': request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_409_CONFLICT)

    tarea = serializer.save()
    densidad = calcular_densidad(request.user)

    wip_actual = request.user.tasks.filter(estado=Task.Status.IN_PROGRESS).count()
    wip_limit = request.user.profile.wip_limit

    return Response({
        'tarea': TaskSerializer(tarea).data,
        'wip_actual': wip_actual,
        'wip_limit': wip_limit,
        'densidad_actualizada': densidad,
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def pomodoro_sessions(request):
    if request.method == 'GET':
        sesiones = PomodoroSession.objects.filter(user=request.user)[:10]
        return Response(PomodoroSessionSerializer(sesiones, many=True).data)

    perfil = request.user.profile
    sesion = PomodoroSession.objects.create(
        user=request.user,
        tarea_id=request.data.get('tarea_id'),
        duracion_trabajo_minutos=perfil.pomodoro_work_minutes,
        duracion_descanso_minutos=perfil.pomodoro_break_minutes,
    )
    return Response(PomodoroSessionSerializer(sesion).data, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def pomodoro_complete_cycle(request, pk):
    sesion = get_object_or_404(PomodoroSession, pk=pk, user=request.user)
    sesion.ciclos_completados += 1
    if request.data.get('finalizar'):
        sesion.fin = timezone.now()
    sesion.save()
    return Response(PomodoroSessionSerializer(sesion).data)
