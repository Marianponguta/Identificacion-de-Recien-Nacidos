# Guía de Contribución

Gracias por tu interés en contribuir al Sistema de Gestión Digital para la Identificación de Recién Nacidos en Entornos Hospitalarios.

## Configuración del Entorno de Desarrollo

Antes de empezar a contribuir, asegúrate de seguir la guía de instalación en el [README.md](README.md) para configurar correctamente tu entorno de desarrollo local.

## Proceso de Contribución

### 1. Fork del Repositorio

Haz un fork del proyecto en tu cuenta de GitHub.

### 2. Clonar el Repositorio

```powershell
git clone https://github.com/tu-usuario/nombre-del-repo.git
cd nombre-del-repo
```

### 3. Crear una Rama

Crea una nueva rama para tu funcionalidad o corrección:

```powershell
git checkout -b feature/nombre-de-tu-funcionalidad
# o
git checkout -b fix/descripcion-del-bug
```

### 4. Realizar Cambios

- Escribe código limpio y bien documentado
- Sigue las convenciones de estilo de Python (PEP 8) para el backend
- Sigue las convenciones de estilo de JavaScript/React para el frontend
- Asegúrate de que tu código no rompa la funcionalidad existente

### 5. Commit de los Cambios

Usa mensajes de commit descriptivos:

```powershell
git add .
git commit -m "feat: añadir funcionalidad X"
# o
git commit -m "fix: corregir problema con Y"
```

### Convención de Mensajes de Commit

Usa el formato:
- `feat:` para nuevas funcionalidades
- `fix:` para correcciones de bugs
- `docs:` para cambios en documentación
- `style:` para cambios de formato que no afectan la lógica
- `refactor:` para refactorización de código
- `test:` para añadir o modificar tests
- `chore:` para tareas de mantenimiento

### 6. Push de los Cambios

```powershell
git push origin feature/nombre-de-tu-funcionalidad
```

### 7. Crear un Pull Request

Ve a GitHub y crea un Pull Request desde tu rama hacia la rama principal del proyecto original.

## Estándares de Código

### Backend (Python/Django)

- Sigue PEP 8
- Usa nombres descriptivos para variables y funciones
- Documenta funciones y clases con docstrings
- Mantén las vistas lo más simples posible
- Usa serializers apropiados para cada endpoint

### Frontend (React)

- Usa componentes funcionales con hooks
- Mantén componentes pequeños y reutilizables
- Usa nombres descriptivos para componentes y funciones
- Organiza imports de forma consistente
- Documenta componentes complejos con comentarios

### Estructura de Archivos

- Mantén la estructura de directorios existente
- Coloca nuevos componentes en los directorios apropiados
- Crea nuevos archivos CSS en `styles/` si es necesario

## Testing

Antes de enviar un Pull Request:

1. Verifica que el backend funcione correctamente:
   ```powershell
   python manage.py test
   ```

2. Verifica que el frontend compile sin errores:
   ```powershell
   npm run build
   ```

3. Prueba manualmente todas las funcionalidades afectadas

## Reportar Bugs

Si encuentras un bug:

1. Verifica que no exista ya un issue reportando el mismo problema
2. Crea un nuevo issue con:
   - Título descriptivo
   - Descripción detallada del problema
   - Pasos para reproducir
   - Comportamiento esperado
   - Comportamiento actual
   - Screenshots si es posible
   - Información del entorno (SO, versión de Python/Node, navegador)

## Solicitar Funcionalidades

Para solicitar nuevas funcionalidades:

1. Verifica que no exista ya un issue similar
2. Crea un nuevo issue con:
   - Título descriptivo
   - Descripción detallada de la funcionalidad
   - Casos de uso
   - Mockups o ejemplos si es posible

## Código de Conducta

- Sé respetuoso con otros contribuidores
- Acepta críticas constructivas
- Enfócate en lo mejor para el proyecto
- Ayuda a otros desarrolladores cuando sea posible

## Preguntas

Si tienes preguntas sobre el proceso de contribución, no dudes en abrir un issue con la etiqueta "question".

## Licencia

Al contribuir a este proyecto, aceptas que tus contribuciones se licenciarán bajo la misma **Licencia de Uso No Comercial** del proyecto.

Esto significa que:
- Tus contribuciones no pueden ser usadas comercialmente sin autorización
- Los derechos de autor pertenecen a Maria Andrea Pongutá Rico
- Tus contribuciones estarán disponibles para uso educativo y no comercial
- Mantienes el reconocimiento como contribuidor

### Autores del Proyecto

**Maria Andrea Pongutá Rico** (Autora principal)  
Correo: [mponguta@unab.edu.co](mailto:mponguta@unab.edu.co)

**Jose Mauricio Unda Ortiz** (Contribuidor)  
Correo: [junda@unab.edu.co](mailto:junda@unab.edu.co)  
GitHub: [github.com/junda05](https://github.com/junda05)
