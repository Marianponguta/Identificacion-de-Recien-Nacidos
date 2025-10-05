from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Perfil, Paciente, ActividadUsuario
from django.db import models
from .serializers import (
    RegistroUsuarioSerializer, 
    UserSerializer, 
    PacienteSerializer, 
    PacienteListSerializer,
    PacienteQRSerializer,
    ActividadUsuarioSerializer
)
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

# Vistas para la gestión de pacientes

class PacienteListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar todos los pacientes y crear nuevos.
    """
    permission_classes = [IsAuthenticated]
    queryset = Paciente.objects.all()
    
    def get_serializer_class(self):
        """
        Utiliza un serializador diferente para listar vs crear.
        """
        if self.request.method == 'GET':
            return PacienteListSerializer
        return PacienteSerializer
    
    def perform_create(self, serializer):
        paciente = serializer.save()
        # Registrar actividad de creación
        ActividadUsuario.objects.create(
            usuario=self.request.user,
            tipo_actividad='creacion',
            paciente=paciente
        )
        
class PacienteDetailView(generics.RetrieveUpdateAPIView):
    """
    Vista para obtener, actualizar y eliminar un paciente específico.
    """
    permission_classes = [IsAuthenticated]
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    lookup_field = 'id_paciente'  # Usar el ID personalizado para búsquedas
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Registrar actividad de búsqueda por ID
        ActividadUsuario.objects.create(
            usuario=request.user,
            tipo_actividad='busqueda',
            paciente=instance,
            metodo_busqueda='id'
        )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Guardar valores antiguos antes de la actualización
        valores_antiguos = {
            'nombre_madre': instance.nombre_madre,
            'documento_madre': instance.documento_madre,
            'sexo_bebe': instance.sexo_bebe,
            'talla': str(instance.talla),
            'peso': str(instance.peso),
            'fecha_nacimiento': str(instance.fecha_nacimiento),
            'hora_nacimiento': str(instance.hora_nacimiento),
            'dado_alta': instance.dado_alta,
        }
        
        # Actualizar el paciente con los nuevos datos
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Calcular los cambios realizados comparando los valores antiguos con los nuevos
        cambios = {}
        campos_display = {
            'nombre_madre': 'Nombre de la madre',
            'documento_madre': 'Documento de la madre',
            'sexo_bebe': 'Sexo del bebé',
            'talla': 'Talla (cm)',
            'peso': 'Peso (kg)',
            'fecha_nacimiento': 'Fecha de nacimiento',
            'hora_nacimiento': 'Hora de nacimiento',
            'dado_alta': 'Estado de alta'
        }
        
        for campo, valor_antiguo in valores_antiguos.items():
            valor_nuevo = str(getattr(instance, campo))
            if valor_antiguo != valor_nuevo:
                # Formatear valores especiales para mejor legibilidad
                if campo == 'sexo_bebe':
                    valor_antiguo_display = 'Masculino' if valor_antiguo == 'M' else 'Femenino'
                    valor_nuevo_display = 'Masculino' if valor_nuevo == 'M' else 'Femenino'
                elif campo == 'dado_alta':
                    valor_antiguo_display = 'Sí' if valor_antiguo == 'True' else 'No'
                    valor_nuevo_display = 'Sí' if valor_nuevo == 'True' else 'No'
                else:
                    valor_antiguo_display = valor_antiguo
                    valor_nuevo_display = valor_nuevo
                
                cambios[campo] = {
                    'campo_display': campos_display.get(campo, campo),
                    'valor_antiguo': valor_antiguo,
                    'valor_nuevo': valor_nuevo,
                    'valor_antiguo_display': valor_antiguo_display,
                    'valor_nuevo_display': valor_nuevo_display
                }
        
        # Registrar actividad de edición con los cambios detallados
        ActividadUsuario.objects.create(
            usuario=request.user,
            tipo_actividad='edicion',
            paciente=instance,
            detalles_cambio=cambios
        )
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
            
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buscar_por_qr(request):
    """
    Vista para buscar un paciente por su código QR.
    """
    codigo_qr = request.data.get('codigo_qr')
    
    if not codigo_qr:
        return Response(
            {"error": "Se requiere un código QR"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        paciente = Paciente.objects.filter(codigo_qr=codigo_qr).first()
        
        if paciente:
            # Registrar actividad de búsqueda
            ActividadUsuario.objects.create(
                usuario=request.user,
                tipo_actividad='busqueda',
                paciente=paciente,
                metodo_busqueda='qr'
            )
            
            serializer = PacienteSerializer(paciente)
            return Response({
                "existe": True,
                "paciente": serializer.data
            })
        else:
            return Response({
                "existe": False,
                "mensaje": "Paciente no encontrado. Por favor, registre los datos."
            })
    
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def actualizar_estado_alta(request, id_paciente):
    """
    Vista para actualizar el estado de alta de un paciente.
    """
    try:
        paciente = get_object_or_404(Paciente, id_paciente=id_paciente)
        nuevo_estado = request.data.get('dado_alta')
        
        if nuevo_estado is None:
            return Response(
                {"error": "Se requiere especificar el estado de alta"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar el estado
        paciente.dado_alta = nuevo_estado
        paciente.save()
        
        serializer = PacienteSerializer(paciente)
        return Response(serializer.data)
    
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Nueva vista para obtener las actividades recientes del usuario actual
class ActividadUsuarioPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ActividadesUsuarioView(generics.ListAPIView):
    """
    Lista las actividades recientes del usuario autenticado.
    Si el usuario es administrador, muestra todas las actividades.
    """
    serializer_class = ActividadUsuarioSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ActividadUsuarioPagination
    
    def get_queryset(self):
        # Verificar si el usuario es administrador (is_staff o is_superuser)
        user = self.request.user
        
        # Iniciar con la consulta base según el tipo de usuario
        if user.is_superuser or user.is_staff:
            # Si es administrador, mostrar todas las actividades
            queryset = ActividadUsuario.objects.all().order_by('-fecha_hora')
        else:
            # Si es usuario normal, solo mostrar las propias
            queryset = ActividadUsuario.objects.filter(usuario=user).order_by('-fecha_hora')
        
        # Aplicar filtros según los parámetros de la solicitud
        tipo_actividad = self.request.query_params.get('tipo_actividad')
        metodo_busqueda = self.request.query_params.get('metodo_busqueda')
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        search = self.request.query_params.get('search')
        
        if tipo_actividad:
            queryset = queryset.filter(tipo_actividad=tipo_actividad)
        
        if metodo_busqueda:
            queryset = queryset.filter(metodo_busqueda=metodo_busqueda)
        
        if fecha_desde:
            queryset = queryset.filter(fecha_hora__date__gte=fecha_desde)
        
        if fecha_hasta:
            queryset = queryset.filter(fecha_hora__date__lte=fecha_hasta)
        
        if search:
            # Búsqueda en campos relevantes del paciente o usuario
            queryset = queryset.filter(
                models.Q(paciente__id_paciente__icontains=search) |
                models.Q(paciente__nombre_madre__icontains=search) |
                models.Q(paciente__documento_madre__icontains=search) |
                models.Q(usuario__username__icontains=search)
            )
        
        return queryset
    
    def get_serializer_context(self):
        """
        Agregar información adicional al contexto del serializador
        para identificar si el usuario es admin.
        """
        context = super().get_serializer_context()
        context['is_admin'] = self.request.user.is_superuser or self.request.user.is_staff
        return context