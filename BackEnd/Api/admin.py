from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Perfil, Paciente, ActividadUsuario

# Registramos el modelo Perfil
@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'cargo', 'usuario')
    search_fields = ('nombre', 'apellido', 'usuario__username')
    list_filter = ('cargo',)

# Personalizamos la visualización de Usuario para mostrar información del perfil
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'get_nombre', 'get_apellido', 'get_cargo', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'perfil__cargo')
    search_fields = ('username', 'email', 'perfil__nombre', 'perfil__apellido')
    
    def get_nombre(self, obj):
        return obj.perfil.nombre if hasattr(obj, 'perfil') else ''
    
    def get_apellido(self, obj):
        return obj.perfil.apellido if hasattr(obj, 'perfil') else ''
    
    def get_cargo(self, obj):
        return obj.perfil.cargo if hasattr(obj, 'perfil') else ''
        
    get_nombre.short_description = 'Nombre'
    get_apellido.short_description = 'Apellido'
    get_cargo.short_description = 'Cargo'

# Desregistramos el UserAdmin predeterminado y registramos nuestro CustomUserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# Registrar el modelo Paciente
@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('id_paciente', 'nombre_madre', 'documento_madre', 'sexo_bebe', 
                   'fecha_nacimiento', 'hora_nacimiento', 'peso', 'talla', 'dado_alta')
    search_fields = ('id_paciente', 'nombre_madre', 'documento_madre')
    list_filter = ('sexo_bebe', 'dado_alta', 'fecha_nacimiento')
    readonly_fields = ('id_paciente', 'fecha_hora_registro')
    fieldsets = (
        ('Información de la madre', {
            'fields': ('nombre_madre', 'documento_madre')
        }),
        ('Información del bebé', {
            'fields': ('sexo_bebe', 'talla', 'peso', 'fecha_nacimiento', 'hora_nacimiento')
        }),
        ('Información administrativa', {
            'fields': ('id_paciente', 'codigo_qr', 'dado_alta', 'fecha_hora_registro')
        }),
    )

# Registrar el modelo ActividadUsuario
@admin.register(ActividadUsuario)
class ActividadUsuarioAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'tipo_actividad', 'paciente', 'fecha_hora', 'metodo_busqueda')
    list_filter = ('tipo_actividad', 'fecha_hora', 'metodo_busqueda', 'usuario')
    search_fields = ('usuario__username', 'paciente__id_paciente', 'paciente__nombre_madre')
    readonly_fields = ('fecha_hora',)
    
    def get_readonly_fields(self, request, obj=None):
        # Hacer todos los campos de solo lectura si el objeto ya existe
        if obj:
            return self.readonly_fields + ('usuario', 'tipo_actividad', 'paciente', 'metodo_busqueda')
        return self.readonly_fields