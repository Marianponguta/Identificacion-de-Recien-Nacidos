from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import datetime

class Perfil(models.Model):
    OPCIONES_CARGO = (
        ('Doctor(a)', 'Doctor(a)'),
        ('Enfermero(a)', 'Enfermero(a)'),
    )
    
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    cargo = models.CharField(max_length=20, choices=OPCIONES_CARGO)
    
    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.cargo}"

@receiver(post_save, sender=User)
def crear_perfil_usuario(sender, instance, created, **kwargs):
    if created:
        Perfil.objects.create(usuario=instance)

@receiver(post_save, sender=User)
def guardar_perfil_usuario(sender, instance, **kwargs):
    instance.perfil.save()

def generar_id_paciente():
    """Genera un ID único para cada paciente con el formato FOSB##"""
    ultimo_paciente = Paciente.objects.order_by('-id').first()
    if ultimo_paciente is None:
        # Si no hay pacientes en la base de datos, comienza con FOSB01
        return 'FOSB01'
    
    # Extrae el número del último ID y lo incrementa
    ultimo_id = ultimo_paciente.id_paciente
    num = int(ultimo_id[4:])
    nuevo_num = num + 1
    return f'FOSB{nuevo_num:02d}'  # Asegura que siempre tenga al menos 2 dígitos

class Paciente(models.Model):
    OPCIONES_SEXO = (
        ('M', 'Masculino'),
        ('F', 'Femenino'),
    )
    
    OPCIONES_ALTA = (
        ('True', 'Sí'),
        ('False', 'No'),
    )
    
    id_paciente = models.CharField(max_length=10, unique=True, default=generar_id_paciente, editable=False)
    nombre_madre = models.CharField(max_length=150, verbose_name="Nombre de la madre")
    documento_madre = models.CharField(max_length=20, verbose_name="Documento de la madre")
    sexo_bebe = models.CharField(max_length=1, choices=OPCIONES_SEXO, verbose_name="Sexo del bebé")
    talla = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Talla (cm)")
    peso = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Peso (kg)")
    fecha_nacimiento = models.DateField(verbose_name="Fecha de nacimiento")
    hora_nacimiento = models.TimeField(verbose_name="Hora de nacimiento")
    fecha_hora_registro = models.DateTimeField(auto_now_add=True, verbose_name="Fecha y hora de registro")
    dado_alta = models.CharField(max_length=5, choices=OPCIONES_ALTA, default='False', verbose_name="¿Dado de alta?")
    codigo_qr = models.CharField(max_length=100, unique=True, blank=True, null=True, verbose_name="Código QR")
    
    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"
        ordering = ['-fecha_hora_registro']
    
    def __str__(self):
        return f"{self.id_paciente} - {self.nombre_madre} - Bebé {self.sexo_bebe}"
    
    def save(self, *args, **kwargs):
        # Si es un nuevo registro sin ID asignado
        if not self.pk and not self.id_paciente:
            self.id_paciente = generar_id_paciente()
        super().save(*args, **kwargs)

class ActividadUsuario(models.Model):
    TIPO_ACTIVIDAD = (
        ('busqueda', 'Búsqueda'),
        ('creacion', 'Creación'),
        ('edicion', 'Edición'),
    )
    
    METODO_BUSQUEDA = (
        ('qr', 'Código QR'),
        ('id', 'ID de Paciente'),
    )
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='actividades')
    tipo_actividad = models.CharField(max_length=10, choices=TIPO_ACTIVIDAD)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='actividades')
    fecha_hora = models.DateTimeField(auto_now_add=True)
    metodo_busqueda = models.CharField(max_length=10, choices=METODO_BUSQUEDA, null=True, blank=True)
    detalles_cambio = models.JSONField(null=True, blank=True, verbose_name="Detalles del cambio")
    
    class Meta:
        verbose_name = "Actividad de Usuario"
        verbose_name_plural = "Actividades de Usuarios"
        ordering = ['-fecha_hora']  # Ordenar del más reciente al más antiguo
    
    def __str__(self):
        return f"{self.usuario.username} - {self.get_tipo_actividad_display()} - {self.paciente.id_paciente} - {self.fecha_hora.strftime('%d/%m/%Y %H:%M')}"