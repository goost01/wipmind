from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .algorithm import calcular_densidad, obtener_historial_densidad


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def density_current(request):
    resultado = calcular_densidad(request.user)
    return Response(resultado)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def density_history(request):
    dias = int(request.query_params.get('dias', 30))
    historial = obtener_historial_densidad(request.user, dias=dias)
    return Response({'historial': historial, 'dias': dias})
