# Documentación de la API

Esta documentación describe todos los endpoints disponibles en la API del Sistema de Gestión Digital para la Identificación de Recién Nacidos.

## URL Base

```
https://<TU_IP>:8000/api/
```

## Autenticación

La API utiliza autenticación basada en tokens. La mayoría de los endpoints requieren un token de autenticación válido en el encabezado de la solicitud.

### Formato del Header

```
Authorization: Token <tu-token-aqui>
```

---

## Endpoints de Autenticación

### 1. Registro de Usuario

**POST** `/auth/users/`

Crea una nueva cuenta de usuario en el sistema.

#### Request Body

```json
{
  "username": "doctor123",
  "password": "contraseña_segura",
  "perfil": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "cargo": "Doctor(a)"
  }
}
```

#### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| username | string | Sí | Nombre de usuario único |
| password | string | Sí | Contraseña del usuario |
| perfil.nombre | string | Sí | Nombre del usuario |
| perfil.apellido | string | Sí | Apellido del usuario |
| perfil.cargo | string | Sí | "Doctor(a)" o "Enfermero(a)" |

#### Response (201 Created)

```json
{
  "id": 1,
  "username": "doctor123",
  "perfil": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "cargo": "Doctor(a)"
  }
}
```

---

### 2. Login (Obtener Token)

**POST** `/auth/token/login/`

Obtiene un token de autenticación para el usuario.

#### Request Body

```json
{
  "username": "doctor123",
  "password": "contraseña_segura"
}
```

#### Response (200 OK)

```json
{
  "auth_token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

---

### 3. Logout (Invalidar Token)

**POST** `/auth/token/logout/`

Invalida el token de autenticación actual.

#### Headers

```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

#### Response (204 No Content)

Sin contenido en el cuerpo de la respuesta.

---

## Endpoints de Pacientes

### 1. Listar Todos los Pacientes

**GET** `/pacientes/`

Obtiene una lista de todos los pacientes registrados.

#### Headers

```
Authorization: Token <tu-token>
```

#### Response (200 OK)

```json
[
  {
    "id_paciente": "FOSB01",
    "nombre_madre": "María García",
    "documento_madre": "1234567890",
    "sexo_bebe": "M",
    "dado_alta": "False",
    "fecha_hora_registro": "2025-10-05T14:30:00Z"
  },
  {
    "id_paciente": "FOSB02",
    "nombre_madre": "Ana Rodríguez",
    "documento_madre": "0987654321",
    "sexo_bebe": "F",
    "dado_alta": "True",
    "fecha_hora_registro": "2025-10-05T15:45:00Z"
  }
]
```

---

### 2. Crear Nuevo Paciente

**POST** `/pacientes/`

Registra un nuevo paciente en el sistema.

#### Headers

```
Authorization: Token <tu-token>
```

#### Request Body

```json
{
  "nombre_madre": "María García",
  "documento_madre": "1234567890",
  "sexo_bebe": "M",
  "talla": 50.5,
  "peso": 3.2,
  "fecha_nacimiento": "2025-10-05",
  "hora_nacimiento": "14:30:00"
}
```

#### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre_madre | string | Sí | Nombre completo de la madre |
| documento_madre | string | Sí | Documento de identidad de la madre |
| sexo_bebe | string | Sí | "M" (Masculino) o "F" (Femenino) |
| talla | decimal | Sí | Talla del bebé en centímetros |
| peso | decimal | Sí | Peso del bebé en kilogramos |
| fecha_nacimiento | date | Sí | Fecha en formato YYYY-MM-DD |
| hora_nacimiento | time | Sí | Hora en formato HH:MM:SS |

#### Response (201 Created)

```json
{
  "id_paciente": "FOSB01",
  "nombre_madre": "María García",
  "documento_madre": "1234567890",
  "sexo_bebe": "M",
  "talla": "50.50",
  "peso": "3.20",
  "fecha_nacimiento": "2025-10-05",
  "hora_nacimiento": "14:30:00",
  "fecha_hora_registro": "2025-10-05T14:30:00Z",
  "dado_alta": "False",
  "codigo_qr": "FOSB01"
}
```

**Nota:** El `id_paciente` y `codigo_qr` se generan automáticamente.

---

### 3. Obtener Paciente Específico

**GET** `/pacientes/{id_paciente}/`

Obtiene la información completa de un paciente específico.

#### Headers

```
Authorization: Token <tu-token>
```

#### URL Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id_paciente | string | ID del paciente (ej: FOSB01) |

#### Response (200 OK)

```json
{
  "id_paciente": "FOSB01",
  "nombre_madre": "María García",
  "documento_madre": "1234567890",
  "sexo_bebe": "M",
  "talla": "50.50",
  "peso": "3.20",
  "fecha_nacimiento": "2025-10-05",
  "hora_nacimiento": "14:30:00",
  "fecha_hora_registro": "2025-10-05T14:30:00Z",
  "dado_alta": "False",
  "codigo_qr": "FOSB01"
}
```

**Nota:** Este endpoint registra automáticamente una actividad de búsqueda por ID.

---

### 4. Actualizar Paciente

**PUT** `/pacientes/{id_paciente}/`

Actualiza toda la información de un paciente.

**PATCH** `/pacientes/{id_paciente}/`

Actualiza parcialmente la información de un paciente.

#### Headers

```
Authorization: Token <tu-token>
```

#### Request Body (PUT - todos los campos requeridos)

```json
{
  "nombre_madre": "María García López",
  "documento_madre": "1234567890",
  "sexo_bebe": "M",
  "talla": 51.0,
  "peso": 3.3,
  "fecha_nacimiento": "2025-10-05",
  "hora_nacimiento": "14:30:00",
  "dado_alta": "False"
}
```

#### Request Body (PATCH - solo campos a modificar)

```json
{
  "talla": 51.0,
  "peso": 3.3
}
```

#### Response (200 OK)

```json
{
  "id_paciente": "FOSB01",
  "nombre_madre": "María García López",
  "documento_madre": "1234567890",
  "sexo_bebe": "M",
  "talla": "51.00",
  "peso": "3.30",
  "fecha_nacimiento": "2025-10-05",
  "hora_nacimiento": "14:30:00",
  "fecha_hora_registro": "2025-10-05T14:30:00Z",
  "dado_alta": "False",
  "codigo_qr": "FOSB01"
}
```

**Nota:** Este endpoint registra automáticamente una actividad de edición con los detalles de los cambios realizados.

---

### 5. Buscar Paciente por Código QR

**POST** `/pacientes/qr/buscar/`

Busca un paciente utilizando su código QR.

#### Headers

```
Authorization: Token <tu-token>
```

#### Request Body

```json
{
  "codigo_qr": "FOSB01"
}
```

#### Response (200 OK)

```json
{
  "id_paciente": "FOSB01",
  "nombre_madre": "María García",
  "documento_madre": "1234567890",
  "sexo_bebe": "M",
  "talla": "50.50",
  "peso": "3.20",
  "fecha_nacimiento": "2025-10-05",
  "hora_nacimiento": "14:30:00",
  "fecha_hora_registro": "2025-10-05T14:30:00Z",
  "dado_alta": "False",
  "codigo_qr": "FOSB01"
}
```

#### Response (404 Not Found)

```json
{
  "error": "Paciente no encontrado"
}
```

**Nota:** Este endpoint registra automáticamente una actividad de búsqueda por QR.

---

### 6. Actualizar Estado de Alta

**POST** `/pacientes/{id_paciente}/alta/`

Actualiza el estado de alta de un paciente.

#### Headers

```
Authorization: Token <tu-token>
```

#### Request Body

```json
{
  "dado_alta": "True"
}
```

#### Response (200 OK)

```json
{
  "id_paciente": "FOSB01",
  "dado_alta": "True",
  "mensaje": "Estado de alta actualizado correctamente"
}
```

---

## Endpoints de Actividades

### 1. Obtener Actividades del Usuario

**GET** `/actividades/`

Obtiene todas las actividades registradas del usuario autenticado.

#### Headers

```
Authorization: Token <tu-token>
```

#### Query Parameters (Opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| page | integer | Número de página (paginación) |
| page_size | integer | Cantidad de resultados por página |

#### Response (200 OK)

```json
{
  "count": 25,
  "next": "https://192.168.1.22:8000/api/actividades/?page=2",
  "previous": null,
  "results": [
    {
      "id": 10,
      "tipo_actividad": "busqueda",
      "metodo_busqueda": "qr",
      "paciente": {
        "id_paciente": "FOSB01",
        "nombre_madre": "María García",
        "sexo_bebe": "M"
      },
      "fecha_hora": "2025-10-05T16:45:00Z",
      "detalles_cambio": null
    },
    {
      "id": 9,
      "tipo_actividad": "edicion",
      "metodo_busqueda": null,
      "paciente": {
        "id_paciente": "FOSB01",
        "nombre_madre": "María García",
        "sexo_bebe": "M"
      },
      "fecha_hora": "2025-10-05T16:30:00Z",
      "detalles_cambio": {
        "Peso (kg)": {
          "anterior": "3.20",
          "nuevo": "3.30"
        },
        "Talla (cm)": {
          "anterior": "50.50",
          "nuevo": "51.00"
        }
      }
    },
    {
      "id": 8,
      "tipo_actividad": "creacion",
      "metodo_busqueda": null,
      "paciente": {
        "id_paciente": "FOSB02",
        "nombre_madre": "Ana Rodríguez",
        "sexo_bebe": "F"
      },
      "fecha_hora": "2025-10-05T15:45:00Z",
      "detalles_cambio": null
    }
  ]
}
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 204 | No Content - Solicitud exitosa sin contenido de respuesta |
| 400 | Bad Request - Datos de entrada inválidos |
| 401 | Unauthorized - Token de autenticación faltante o inválido |
| 403 | Forbidden - Permisos insuficientes |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## Manejo de Errores

### Ejemplo de Respuesta de Error (400 Bad Request)

```json
{
  "nombre_madre": [
    "Este campo no puede estar en blanco."
  ],
  "peso": [
    "Asegúrese de que este valor sea mayor o igual a 0."
  ]
}
```

### Ejemplo de Respuesta de Error (401 Unauthorized)

```json
{
  "detail": "Las credenciales de autenticación no se proveyeron."
}
```

### Ejemplo de Respuesta de Error (404 Not Found)

```json
{
  "detail": "No encontrado."
}
```

---

## Formatos de Datos

### Fechas

Las fechas se envían y reciben en formato ISO 8601:
- **Date**: `YYYY-MM-DD` (ej: "2025-10-05")
- **DateTime**: `YYYY-MM-DDTHH:MM:SSZ` (ej: "2025-10-05T14:30:00Z")
- **Time**: `HH:MM:SS` (ej: "14:30:00")

### Decimales

Los números decimales se envían como números y se reciben como strings:
- **Envío**: `3.2`
- **Respuesta**: `"3.20"`

### Booleanos para Estado de Alta

El campo `dado_alta` usa strings en lugar de booleanos:
- `"True"` para dado de alta
- `"False"` para no dado de alta

---

## Ejemplos de Uso

### Ejemplo con cURL: Crear un Paciente

```bash
curl -X POST https://192.168.1.22:8000/api/pacientes/ \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_madre": "María García",
    "documento_madre": "1234567890",
    "sexo_bebe": "M",
    "talla": 50.5,
    "peso": 3.2,
    "fecha_nacimiento": "2025-10-05",
    "hora_nacimiento": "14:30:00"
  }'
```

### Ejemplo con JavaScript (Axios): Buscar por QR

```javascript
import axios from 'axios';

const buscarPorQR = async (codigoQR) => {
  try {
    const response = await axios.post(
      'https://192.168.1.22:8000/api/pacientes/qr/buscar/',
      { codigo_qr: codigoQR },
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al buscar paciente:', error);
    throw error;
  }
};
```

### Ejemplo con Python (Requests): Obtener Actividades

```python
import requests

url = 'https://192.168.1.22:8000/api/actividades/'
headers = {
    'Authorization': 'Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b'
}

response = requests.get(url, headers=headers, verify=False)
actividades = response.json()

print(actividades)
```

---

## Notas Importantes

1. **HTTPS Obligatorio**: Todos los endpoints deben ser accedidos mediante HTTPS.

2. **Autenticación**: La mayoría de los endpoints requieren autenticación. Asegúrate de incluir el token en el header.

3. **Registro Automático de Actividades**: Las operaciones de búsqueda, creación y edición registran automáticamente actividades del usuario.

4. **Generación Automática de IDs**: Los IDs de paciente y códigos QR se generan automáticamente; no deben incluirse en las solicitudes de creación.

5. **Validación de Datos**: Todos los endpoints validan los datos de entrada. Consulta los mensajes de error para obtener detalles sobre validaciones fallidas.

6. **Paginación**: El endpoint de actividades utiliza paginación para mejorar el rendimiento.

---

**Última actualización:** Octubre 2025
