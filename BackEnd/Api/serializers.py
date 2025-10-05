from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Perfil, Paciente, ActividadUsuario

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(required=True, write_only=True)
    apellido = serializers.CharField(required=True, write_only=True)
    cargo = serializers.ChoiceField(
        choices=Perfil.OPCIONES_CARGO, 
        required=True, 
        write_only=True
    )
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('nombre', 'apellido', 'cargo', 'username', 'email', 'password', 'password2')

    def validate(self, attrs):
        # Validación de contraseñas
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        
        # Validación del nombre completo con al menos 3 palabras
        nombre_completo = f"{attrs['nombre']} {attrs['apellido']}".strip()
        palabras = [palabra for palabra in nombre_completo.split() if palabra]
        if len(palabras) < 3:
            raise serializers.ValidationError(
                {"nombre_completo": "El nombre completo debe contener al menos 3 palabras"}
            )
            
        return attrs

    def create(self, validated_data):
        # Extraer los datos del perfil
        nombre = validated_data.pop('nombre')
        apellido = validated_data.pop('apellido')
        cargo = validated_data.pop('cargo')
        validated_data.pop('password2')
          # Crear el usuario
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=nombre,
            last_name=apellido
        )
        user.set_password(validated_data['password'])
        user.save()
        
        # Actualizar el perfil
        user.perfil.nombre = nombre
        user.perfil.apellido = apellido
        user.perfil.cargo = cargo
        user.perfil.save()
        
        return user
        
class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = ('nombre', 'apellido', 'cargo')

class UserSerializer(serializers.ModelSerializer):
    perfil = PerfilSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'perfil')

class PacienteSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Paciente.
    Incluye todos los campos y validaciones necesarias.
    """
    class Meta:
        model = Paciente
        fields = '__all__'
        read_only_fields = ['id_paciente', 'fecha_hora_registro']
    
    def validate_nombre_madre(self, value):
        """
        Validar que el nombre de la madre tenga al menos 3 palabras.
        """
        palabras = [palabra for palabra in value.split() if palabra]
        if len(palabras) < 3:
            raise serializers.ValidationError("El nombre de la madre debe contener al menos 3 palabras (nombre completo)")
        return value
    
    def validate_talla(self, value):
        """
        Validar que la talla sea un valor positivo y dentro de rangos razonables para bebés.
        """
        if value <= 0:
            raise serializers.ValidationError("La talla debe ser un valor positivo")
        if value > 100:  # Asumiendo un límite razonable para bebés recién nacidos
            raise serializers.ValidationError("La talla parece ser demasiado alta para un bebé recién nacido")
        return value
    
    def validate_peso(self, value):
        """
        Validar que el peso sea un valor positivo y dentro de rangos razonables para bebés.
        """
        if value <= 0:
            raise serializers.ValidationError("El peso debe ser un valor positivo")
        if value > 5:  # Asumiendo un límite razonable para bebés recién nacidos
            raise serializers.ValidationError("El peso parece ser demasiado alto para un bebé recién nacido")
        return value
    
    def validate_fecha_nacimiento(self, value):
        """
        Validar que la fecha de nacimiento no sea en el futuro.
        """
        import datetime
        if value > datetime.date.today():
            raise serializers.ValidationError("La fecha de nacimiento no puede estar en el futuro")
        return value

class PacienteListSerializer(serializers.ModelSerializer):
    """
    Serializador para listar pacientes con información resumida.
    """
    class Meta:
        model = Paciente
        fields = ['id', 'id_paciente', 'nombre_madre', 'documento_madre', 'sexo_bebe', 
                 'fecha_nacimiento', 'dado_alta', 'codigo_qr']

class PacienteQRSerializer(serializers.ModelSerializer):
    """
    Serializador para buscar pacientes por código QR.
    """
    class Meta:
        model = Paciente
        fields = ['id', 'id_paciente', 'codigo_qr', 'existe']
        read_only_fields = ['id', 'id_paciente', 'existe']
    
    # Campo calculado para indicar si el paciente existe
    existe = serializers.SerializerMethodField()
    
    def get_existe(self, obj):
        """
        Devuelve True si el paciente existe en la base de datos.
        """
        return obj is not None

class ActividadUsuarioSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='usuario.username', read_only=True)
    cargo_usuario = serializers.CharField(source='usuario.perfil.cargo', read_only=True)
    
    # Add patient fields to include them directly in the activity response
    paciente_id = serializers.CharField(source='paciente.id_paciente', read_only=True)
    nombre_madre = serializers.CharField(source='paciente.nombre_madre', read_only=True)
    documento_madre = serializers.CharField(source='paciente.documento_madre', read_only=True)
    sexo_bebe = serializers.CharField(source='paciente.sexo_bebe', read_only=True)
    talla = serializers.FloatField(source='paciente.talla', read_only=True)
    peso = serializers.FloatField(source='paciente.peso', read_only=True)
    fecha_nacimiento = serializers.DateField(source='paciente.fecha_nacimiento', read_only=True)
    hora_nacimiento = serializers.TimeField(source='paciente.hora_nacimiento', read_only=True)
    dado_alta = serializers.CharField(source='paciente.dado_alta', read_only=True)
    
    tipo_actividad_display = serializers.SerializerMethodField()
    metodo_busqueda_display = serializers.SerializerMethodField()
    cambios_resumen = serializers.SerializerMethodField()
    
    class Meta:
        model = ActividadUsuario
        fields = ['id', 'usuario', 'username', 'cargo_usuario', 'tipo_actividad', 
                  'tipo_actividad_display', 'paciente', 'paciente_id', 'nombre_madre', 
                  'documento_madre', 'sexo_bebe', 'talla', 'peso', 'fecha_nacimiento', 
                  'hora_nacimiento', 'dado_alta', 'fecha_hora', 'metodo_busqueda', 
                  'metodo_busqueda_display', 'detalles_cambio', 'cambios_resumen']
    
    def get_tipo_actividad_display(self, obj):
        displays = {
            'busqueda': 'Búsqueda',
            'creacion': 'Creación',
            'edicion': 'Edición',
        }
        return displays.get(obj.tipo_actividad, obj.tipo_actividad)
    
    def get_metodo_busqueda_display(self, obj):
        if not obj.metodo_busqueda:
            return None
        
        displays = {
            'qr': 'Código QR',
            'id': 'ID de Paciente',
        }
        return displays.get(obj.metodo_busqueda, obj.metodo_busqueda)
    
    def get_cambios_resumen(self, obj):
        """Genera un resumen breve de los cambios si hay detalles de cambio"""
        if obj.tipo_actividad != 'edicion' or not obj.detalles_cambio:
            return None
        
        campos_cambiados = list(obj.detalles_cambio.keys())
        if not campos_cambiados:
            return None
        
        num_cambios = len(campos_cambiados)
        if num_cambios == 1:
            campo = obj.detalles_cambio[campos_cambiados[0]]['campo_display']
            return f"Se modificó: {campo}"
        else:
            return f"Se modificaron {num_cambios} campos"