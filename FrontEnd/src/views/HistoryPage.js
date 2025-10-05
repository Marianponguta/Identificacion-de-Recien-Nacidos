import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import { buildApiUrl } from '../config/api.config';
import { FaHistory, FaSearch, FaUser, FaFilter, FaFilePdf, FaFileExcel, FaChevronLeft, FaChevronRight, FaInfoCircle } from 'react-icons/fa';
import ChangeDetailsModal from '../components/ChangeDetailsModal'; // Vamos a crear este componente después
import '../styles/dashboard.css';
import '../styles/history.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const HistoryPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activities, setActivities] = useState([]);  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState({
    activityType: '',
    searchMethod: '',
    dateFrom: '',
    dateTo: ''
  });
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  
  const { authTokens, user, userProfile } = useContext(AuthContext);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Escuchar eventos del sidebar para ajustar la UI
  useEffect(() => {
    const handleSidebarToggle = (e) => {
      setSidebarCollapsed(e.detail.isCollapsed);
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  // Fetch activities with pagination
  useEffect(() => {
    const fetchActivities = async () => {
      if (!authTokens?.auth_token) return;
      
      setLoading(true);
      
      // Construct query parameters for filters
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage);
      
      if (filters.activityType) queryParams.append('tipo_actividad', filters.activityType);
      if (filters.searchMethod) queryParams.append('metodo_busqueda', filters.searchMethod);
      if (filters.dateFrom) queryParams.append('fecha_desde', filters.dateFrom);
      if (filters.dateTo) queryParams.append('fecha_hasta', filters.dateTo);
      if (searchTerm) queryParams.append('search', searchTerm);
      
      try {
        const response = await fetch(buildApiUrl('/actividades/', Object.fromEntries(queryParams)), {
          method: 'GET',
          headers: {
            'Authorization': `Token ${authTokens.auth_token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        
        const data = await response.json();
        console.log('Activities:', data);
        
        // Update state with server-side pagination data
        setActivities(data.results || []);
        setTotalPages(Math.ceil(data.count / itemsPerPage));
        setTotalResults(data.count || 0);
        
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError("Error al cargar el historial de actividades.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [authTokens, currentPage, filters, searchTerm, itemsPerPage]);

  // Function to format date and time
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    
    const date = new Date(dateTime);
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    
    const formattedDate = date.toLocaleDateString('es-ES', dateOptions);
    const formattedTime = date.toLocaleTimeString('es-ES', timeOptions);
    
    return `${formattedDate}, ${formattedTime}`;
  };

  // Pagination
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle search change with debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search change
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      activityType: '',
      searchMethod: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Generate pagination buttons
  const paginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    // Always show first page
    buttons.push(
      <button
        key="first"
        onClick={() => paginate(1)}
        className={currentPage === 1 ? 'active' : ''}
        aria-label="Primera página"
      >
        1
      </button>
    );
    
    // Calculate range of pages to show
    let startPage = Math.max(2, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisibleButtons - 3);
    
    if (endPage - startPage < maxVisibleButtons - 3) {
      startPage = Math.max(2, endPage - (maxVisibleButtons - 3) + 1);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      buttons.push(<span key="ellipsis-start" className="pagination-ellipsis">...</span>);
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={currentPage === i ? 'active' : ''}
          aria-label={`Página ${i}`}
        >
          {i}
        </button>
      );
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1 && totalPages > 1) {
      buttons.push(<span key="ellipsis-end" className="pagination-ellipsis">...</span>);
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      buttons.push(
        <button
          key="last"
          onClick={() => paginate(totalPages)}
          className={currentPage === totalPages ? 'active' : ''}
          aria-label={`Última página ${totalPages}`}
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  const handleShowDetails = (activity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };  // Función para exportar a PDF
  const exportToPDF = async () => {
    // Mostrar indicador de carga
    setExportingPDF(true);
    
    try {
      // Si hay más de 10 registros (paginación), obtener todos los registros
      let dataToExport = [];
      
      if (totalResults > itemsPerPage) {
        // Construir parámetros de filtro sin la paginación
        const queryParams = new URLSearchParams();
        if (filters.activityType) queryParams.append('tipo_actividad', filters.activityType);
        if (filters.searchMethod) queryParams.append('metodo_busqueda', filters.searchMethod);
        if (filters.dateFrom) queryParams.append('fecha_desde', filters.dateFrom);
        if (filters.dateTo) queryParams.append('fecha_hasta', filters.dateTo);
        if (searchTerm) queryParams.append('search', searchTerm);
        
        // Obtener todos los registros
        const response = await fetch(buildApiUrl('/actividades/', {
          ...Object.fromEntries(queryParams),
          page_size: totalResults
        }), {
          method: 'GET',
          headers: {
            'Authorization': `Token ${authTokens.auth_token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener los datos para exportación');
        }
        
        const data = await response.json();
        dataToExport = data.results || [];
      } else {
        // Si son pocos registros, usar los actuales
        dataToExport = activities;
      }
        // Crear una instancia de jsPDF
      const doc = new jsPDF('landscape');

      // Colores institucionales
      const primaryBlue = '#0159ab';
      const green = '#65aa3f';
      const lightBlue = '#55caf1';
      const orange = '#f39521';
      
      // Cargar el logo
      const logoImg = new Image();
      logoImg.src = '/images/logo_foscal.png';
      
      // Función para esperar a que la imagen se cargue
      const loadImage = () => {
        return new Promise((resolve) => {
          logoImg.onload = resolve;
        });
      };
      
      await loadImage();

      // Crear un header más profesional que ocupe todo el ancho de la página
      // Fondo para el header
      doc.setFillColor(245, 245, 255); // Fondo muy claro para el encabezado
      doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
      
      // Línea de colores institucionales en la parte superior del documento (ancho completo)
      const headerLineY = 0;
      const headerWidth = doc.internal.pageSize.width;
      const headerLineHeight = 5; // Línea más gruesa para el header
      
      doc.setDrawColor(primaryBlue);
      doc.setFillColor(primaryBlue);
      doc.rect(0, headerLineY, headerWidth / 4, headerLineHeight, 'F');
      
      doc.setDrawColor(green);
      doc.setFillColor(green);
      doc.rect(headerWidth / 4, headerLineY, headerWidth / 4, headerLineHeight, 'F');
      
      doc.setDrawColor(lightBlue);
      doc.setFillColor(lightBlue);
      doc.rect(headerWidth / 2, headerLineY, headerWidth / 4, headerLineHeight, 'F');
      
      doc.setDrawColor(orange);
      doc.setFillColor(orange);      doc.rect(3 * headerWidth / 4, headerLineY, headerWidth / 4, headerLineHeight, 'F');
      
      // Añadir logo en el header
      doc.addImage(logoImg, 'PNG', 14, 10, 50, 25);
      
      // Configurar el título del documento con el azul institucional más pequeño y a la derecha
      doc.setFontSize(18); // Tamaño más pequeño
      doc.setTextColor(primaryBlue);
      doc.setFont(undefined, 'bold');
      // Posicionar a la derecha en lugar de centrado
      doc.text('INFORME DE ACTIVIDADES DEL SISTEMA', doc.internal.pageSize.width * 0.65, 22, { align: 'center' });
      
      // Información del usuario que genera el reporte (después del header)
      const userName = userProfile?.perfil ? 
        `${userProfile.perfil.nombre} ${userProfile.perfil.apellido}` : 
        (user?.username || "Usuario");
      
      const userRole = userProfile?.perfil?.cargo || "Usuario del sistema";
      
      // Establecer posiciones para la sección de información del usuario (debajo del header)
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      // Definir la posición vertical después del header
      const infoStartY = 45; // Posición Y inicial después del header
      const infoRowSpacing = 6; // Espaciado entre líneas
      
      // Información del usuario en dos columnas
      // Primera columna
      doc.setFont(undefined, 'bold');
      doc.text('Generado por:', 14, infoStartY);
      doc.setFont(undefined, 'normal');
      doc.text(userName, 65, infoStartY);
      
      // Segunda columna
      doc.setFont(undefined, 'bold');
      doc.text('Cargo:', 200, infoStartY);
      doc.setFont(undefined, 'normal');
      doc.text(userRole, 230, infoStartY);
      
      // Fecha de generación (en una nueva línea)
      const now = new Date();
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit' };
      
      // Posicionamos la fecha en una nueva línea
      doc.setFont(undefined, 'bold');
      doc.text('Fecha de generación:', 14, infoStartY + infoRowSpacing);
      doc.setFont(undefined, 'normal');      const dateString = `${now.toLocaleDateString('es-ES', dateOptions)}, ${now.toLocaleTimeString('es-ES', timeOptions)}`;
      doc.text(dateString, 65, infoStartY + infoRowSpacing);
        // Añadir información sobre los filtros aplicados
      doc.setFontSize(11);
      
      // Formatear las fechas para el periodo del informe
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
      };
      
      // Generar texto para el periodo del informe
      let periodText = '';
      if (filters.dateFrom && filters.dateTo) {
        periodText = `Informe generado para el periodo: ${formatDate(filters.dateFrom)} hasta ${formatDate(filters.dateTo)}`;
      } else if (filters.dateFrom) {
        periodText = `Informe generado desde: ${formatDate(filters.dateFrom)}`;
      } else if (filters.dateTo) {
        periodText = `Informe generado hasta: ${formatDate(filters.dateTo)}`;
      } else {
        periodText = `Informe generado con fecha de corte: ${now.toLocaleDateString('es-ES', dateOptions)}`;
      }
      
      // Mostrar información del periodo
      doc.setFont(undefined, 'bold');
      doc.text(periodText, 14, infoStartY + (2 * infoRowSpacing));
      doc.setFont(undefined, 'normal');
      
      // Generar texto para otros filtros si existen
      let otherFilterText = '';
      if (filters.activityType) otherFilterText += `Tipo de actividad: ${filters.activityType}, `;
      if (filters.searchMethod) otherFilterText += `Método de búsqueda: ${filters.searchMethod}, `;
      if (searchTerm) otherFilterText += `Búsqueda: "${searchTerm}", `;
      
      if (otherFilterText !== '') {
        doc.text(`Otros filtros: ${otherFilterText.slice(0, -2)}`, 14, infoStartY + (3 * infoRowSpacing)); // Remover la última coma y espacio
      }
        // Añadir información sobre la cantidad de registros
      doc.setFont(undefined, 'bold');
      // Ajustar la posición vertical dependiendo de si hay otros filtros
      const totalRegisterY = otherFilterText !== '' ? 
        infoStartY + (4 * infoRowSpacing) : 
        infoStartY + (3 * infoRowSpacing);
      doc.text(`Total de registros: ${dataToExport.length}`, 14, totalRegisterY);
      doc.setFont(undefined, 'normal');
        // Preparar los datos para la tabla con detalles de cambio
      // Creamos un array para almacenar todos los datos (actividades + detalles)
      const tableData = [];
      
      // Definimos las columnas
      const tableColumn = [
        'Fecha y Hora', 
        'Usuario', 
        'Tipo de Actividad', 
        'Método de Búsqueda', 
        'ID Paciente', 
        'Detalle', 
        'Campo Modificado', 
        'Valor Anterior', 
        'Valor Nuevo'
      ];
      
      dataToExport.forEach(activity => {
        // Datos base de la actividad con usuario y cargo combinados
        const baseData = [
          formatDateTime(activity.fecha_hora),
          `${activity.username}\n${activity.cargo_usuario}`, // Combinamos Usuario y Cargo
          activity.tipo_actividad_display,
          activity.metodo_busqueda_display || 'N/A',
          activity.paciente_id,
          activity.tipo_actividad === 'edicion' 
            ? 'Edición de datos' 
            : activity.tipo_actividad === 'creacion' 
              ? 'Creación de paciente' 
              : 'Consulta de información'
        ];
        
        // Si es una actividad de edición con detalles
        if (activity.tipo_actividad === 'edicion' && activity.detalles_cambio && Object.keys(activity.detalles_cambio).length > 0) {
          // Recorremos cada detalle de cambio
          let isFirstDetail = true;
          Object.entries(activity.detalles_cambio).forEach(([campo, detalle]) => {
            if (isFirstDetail) {
              // Para el primer detalle, incluir todos los datos base
              tableData.push([
                ...baseData,
                detalle.campo_display,
                detalle.valor_antiguo_display,
                detalle.valor_nuevo_display
              ]);
              isFirstDetail = false;
            } else {
              // Para los detalles adicionales, dejamos vacíos los datos base pero mantenemos las celdas combinadas
              tableData.push([
                '', '', '', '', '', '', 
                detalle.campo_display,
                detalle.valor_antiguo_display,
                detalle.valor_nuevo_display
              ]);
            }
          });
        } else {
          // Si no es edición o no tiene detalles, dejamos vacías las columnas de detalles
          tableData.push([...baseData, '', '', '']);
        }
      });      // Generar la tabla con AutoTable con los colores institucionales
      const pageWidth = doc.internal.pageSize.width;
      const tableMargin = 15; // Margen uniforme a cada lado
      
      // Configuración para controlar el número máximo de filas por página
      const maxRowsPerPage = 12; // Reducir número de filas por página para evitar solapamientos
        autoTable(doc, {
        head: [tableColumn],
        body: tableData,
        startY: totalRegisterY + infoRowSpacing, // Posición de inicio después de la información
        margin: { left: tableMargin, right: tableMargin, top: 30 }, // Margen superior para logo
        tableWidth: pageWidth - (2 * tableMargin), // Ancho fijo calculado
        horizontalPageBreak: true, // Evitar saltos de página horizontal
        rowPageBreak: 'auto', // Permitir quiebres de página entre filas
        showHead: 'everyPage', // Mostrar encabezados en cada página
        styles: {
          fontSize: 7.5, // Reducir tamaño de letra para mejorar el ajuste
          cellPadding: 2,
          lineWidth: 0.2, // Líneas más delgadas y sutiles
          lineColor: [180, 180, 180], // Gris claro para bordes
          overflow: 'linebreak',
          cellWidth: 'auto',
          valign: 'middle',
          halign: 'center' // Centrar el contenido
        },
        headStyles: {
          fillColor: hexToRgb(primaryBlue),
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [245, 250, 254] // Azul muy claro para filas alternas
        },
        // Ajuste de anchos para que todas las columnas quepan correctamente en la página
        columnStyles: {
          0: {cellWidth: (pageWidth - (2 * tableMargin)) * 0.09}, // Fecha y hora (9%)
          1: {cellWidth: (pageWidth - (2 * tableMargin)) * 0.09}, // Usuario con cargo (9%)
          2: {cellWidth: (pageWidth - (2 * tableMargin)) * 0.09}, // Tipo de actividad (9%)
          3: {cellWidth: (pageWidth - (2 * tableMargin)) * 0.09}, // Método de búsqueda (9%)
          4: {cellWidth: (pageWidth - (2 * tableMargin)) * 0.08}, // ID Paciente (8%)
          5: {cellWidth: (pageWidth - (2 * tableMargin)) * 0.12}, // Detalle (12%)
          6: {cellWidth: (pageWidth - (2 * tableMargin)) * 0.14}, // Campo modificado (14%)
          7: {cellWidth: (pageWidth - (2 * tableMargin)) * 0.15}, // Valor anterior (15%)
          8: {cellWidth: (pageWidth - (2 * tableMargin)) * 0.15}  // Valor nuevo (15%)
        },
        bodyStyles: {
          minCellHeight: 6 // Altura mínima de celda
        },
        // Corregimos el problema de páginas en blanco
        didDrawPage: function(data) {
          // Agregar header en cada página
          if (data.pageNumber > 1) {
            // Fondo para el header en páginas posteriores (más pequeño)
            doc.setFillColor(245, 245, 255); // Fondo claro para el encabezado
            doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
            
            // Línea de colores institucionales en la parte superior
            doc.setDrawColor(primaryBlue);
            doc.setFillColor(primaryBlue);
            doc.rect(0, 0, doc.internal.pageSize.width / 4, 3, 'F');
            
            doc.setDrawColor(green);
            doc.setFillColor(green);
            doc.rect(doc.internal.pageSize.width / 4, 0, doc.internal.pageSize.width / 4, 3, 'F');
            
            doc.setDrawColor(lightBlue);
            doc.setFillColor(lightBlue);
            doc.rect(doc.internal.pageSize.width / 2, 0, doc.internal.pageSize.width / 4, 3, 'F');
            
            doc.setDrawColor(orange);
            doc.setFillColor(orange);
            doc.rect(3 * doc.internal.pageSize.width / 4, 0, doc.internal.pageSize.width / 4, 3, 'F');
            
            // Añadir logo en páginas subsiguientes (más pequeño)
            doc.addImage(logoImg, 'PNG', 14, 5, 30, 15);
            
            // Título en páginas subsiguientes, alineado con el logo
            doc.setFontSize(14);
            doc.setTextColor(primaryBlue);
            doc.setFont(undefined, 'bold');
            doc.text('INFORME DE ACTIVIDADES - CONTINUACIÓN', doc.internal.pageSize.width * 0.65, 15, { align: 'center' });
          }
          
          // Limitar el número de filas por página
          if (data.table.startPageCount === data.pageNumber) {
            return false; // No forzar nuevo salto en la primera página
          }
          
          // Para páginas subsiguientes, limitar filas por página
          const rowsDrawn = data.table.body.length;
          if (rowsDrawn >= maxRowsPerPage) {
            return true; // Forzar salto de página
          }
          
          return false; // Continuar en la página actual
        },
        willDrawCell: function(data) {
          // Ajustar el ancho de las celdas si el contenido es muy largo
          if (data.cell.text && data.cell.text.length > 50) {
            data.cell.styles.cellWidth = 'wrap';
          }
        }
      });
      
      // Función auxiliar para convertir colores hex a rgb
      function hexToRgb(hex) {
        // Eliminar el carácter '#' si está presente
        hex = hex.replace('#', '');
        
        // Extraer los componentes RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return [r, g, b];
      }
        // Agregar fecha de generación del reporte y número de página al pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Agregar una línea delgada con los colores institucionales en el pie de página (ancho completo)
        const footerLineY = doc.internal.pageSize.height - 15;
        const footerWidth = doc.internal.pageSize.width;
        const footerLineHeight = 1; // Un poco más gruesa para mejor visibilidad
        
        // Líneas de colores institucionales a todo el ancho de la página
        doc.setDrawColor(primaryBlue);
        doc.setFillColor(primaryBlue);
        doc.rect(0, footerLineY, footerWidth / 4, footerLineHeight, 'F');
        
        doc.setDrawColor(green);
        doc.setFillColor(green);
        doc.rect(footerWidth / 4, footerLineY, footerWidth / 4, footerLineHeight, 'F');
        
        doc.setDrawColor(lightBlue);
        doc.setFillColor(lightBlue);
        doc.rect(footerWidth / 2, footerLineY, footerWidth / 4, footerLineHeight, 'F');
        
        doc.setDrawColor(orange);
        doc.setFillColor(orange);
        doc.rect(3 * footerWidth / 4, footerLineY, footerWidth / 4, footerLineHeight, 'F');
        
        // Añadir texto del footer
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50); // Gris oscuro para mejor legibilidad
        doc.setFont(undefined, 'normal');
        
        // Añadir el texto del footer
        doc.text(
          `Documento generado por ${userName} - Clínica FOSCAL`, 
          14, 
          doc.internal.pageSize.height - 8
        );
        
        // Añadir número de página
        doc.setFont(undefined, 'bold');
        doc.text(
          `Página ${i} de ${pageCount}`, 
          doc.internal.pageSize.width - 30, 
          doc.internal.pageSize.height - 8
        );
      }
      
      // Guardar el PDF con un nombre basado en la fecha
      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`historial_actividades_${dateStr}.pdf`);
      } catch (error) {
      console.error('Error al exportar a PDF:', error);
      // Mostrar un mensaje al usuario
      setError("Error al exportar a PDF. Inténtelo de nuevo.");
      setTimeout(() => setError(""), 5000); // Limpiar el mensaje después de 5 segundos
    } finally {
      setExportingPDF(false);
    }
  };  // Función para exportar a Excel
  const exportToExcel = async () => {
    // Mostrar indicador de carga
    setExportingExcel(true);
    
    try {
      // Si hay más de 10 registros (paginación), obtener todos los registros
      let dataToExport = [];
      
      if (totalResults > itemsPerPage) {
        // Construir parámetros de filtro sin la paginación
        const queryParams = new URLSearchParams();
        if (filters.activityType) queryParams.append('tipo_actividad', filters.activityType);
        if (filters.searchMethod) queryParams.append('metodo_busqueda', filters.searchMethod);
        if (filters.dateFrom) queryParams.append('fecha_desde', filters.dateFrom);
        if (filters.dateTo) queryParams.append('fecha_hasta', filters.dateTo);
        if (searchTerm) queryParams.append('search', searchTerm);
        
        // Obtener todos los registros
        const response = await fetch(buildApiUrl('/actividades/', {
          ...Object.fromEntries(queryParams),
          page_size: totalResults
        }), {
          method: 'GET',
          headers: {
            'Authorization': `Token ${authTokens.auth_token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener los datos para exportación');
        }
        
        const data = await response.json();
        dataToExport = data.results || [];      } else {
        // Si son pocos registros, usar los actuales
        dataToExport = activities;
      }
      
      // Obtener información del usuario que genera el reporte
      const userName = userProfile?.perfil ? 
        `${userProfile.perfil.nombre} ${userProfile.perfil.apellido}` : 
        (user?.username || "Usuario");
      
      const userRole = userProfile?.perfil?.cargo || "Usuario del sistema";
      
      // Preparar datos de metadatos
      const metaData = [
        ['CLÍNICA FOSCAL - ESPERANZA DE VIDA'],
        ['Historial de Actividades de Pacientes'],
        [''],
        ['Generado por:', userName],
        ['Cargo:', userRole],
        ['Fecha de generación:', `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
        ['']
      ];
      
      if (filters.activityType || filters.searchMethod || filters.dateFrom || filters.dateTo || searchTerm) {
        metaData.push(['Filtros aplicados:']);
        if (filters.activityType) metaData.push(['Tipo de actividad:', filters.activityType]);
        if (filters.searchMethod) metaData.push(['Método de búsqueda:', filters.searchMethod]);
        if (filters.dateFrom) metaData.push(['Desde:', filters.dateFrom]);
        if (filters.dateTo) metaData.push(['Hasta:', filters.dateTo]);
        if (searchTerm) metaData.push(['Búsqueda:', searchTerm]);
        metaData.push(['']);
      }
      
      metaData.push(['Total de registros:', dataToExport.length.toString()]);
      metaData.push(['']);
        // Preparar los datos para Excel con detalles de cambio
      const workSheetData = [
        ['Fecha y Hora', 'Usuario/Cargo', 'Tipo de Actividad', 'Método de Búsqueda', 'ID Paciente', 'Detalles', 'Campo Modificado', 'Valor Anterior', 'Valor Nuevo'], // Encabezados con columnas adicionales
      ];
      
      dataToExport.forEach(activity => {
        const baseRow = [
          formatDateTime(activity.fecha_hora),
          `${activity.username}\n${activity.cargo_usuario}`, // Combinamos usuario y cargo
          activity.tipo_actividad_display,
          activity.metodo_busqueda_display || 'N/A',
          activity.paciente_id,
          activity.tipo_actividad === 'edicion' 
            ? 'Edición de datos' 
            : activity.tipo_actividad === 'creacion' 
              ? 'Creación de paciente' 
              : 'Consulta de información'
        ];
        
        // Si es una actividad de edición con detalles de cambio
        if (activity.tipo_actividad === 'edicion' && activity.detalles_cambio && Object.keys(activity.detalles_cambio).length > 0) {
          // Añadir una fila por cada detalle de cambio
          let isFirstChange = true;
          
          Object.entries(activity.detalles_cambio).forEach(([campo, detalle]) => {
            if (isFirstChange) {
              // Para el primer cambio, usar la misma fila que tiene los datos de la actividad
              workSheetData.push([
                ...baseRow,
                detalle.campo_display,
                detalle.valor_antiguo_display,
                detalle.valor_nuevo_display
              ]);
              isFirstChange = false;
            } else {              // Para los detalles adicionales, dejamos vacíos los datos base pero mantenemos las celdas combinadas
              workSheetData.push([
                '', '', '', '', '', '', 
                detalle.campo_display,
                detalle.valor_antiguo_display,
                detalle.valor_nuevo_display
              ]);
            }
          });
        } else {
          // Si no es edición o no hay detalles, agregar una fila simple
          workSheetData.push([...baseRow, '', '', '']);
        }
      });
      
      // Crear un libro de trabajo
      const workBook = XLSX.utils.book_new();
      
      // Crear y aplicar estilos para la hoja de metadatos
      const metaSheet = XLSX.utils.aoa_to_sheet(metaData);
      
      // Añadir la hoja de metadatos
      XLSX.utils.book_append_sheet(workBook, metaSheet, 'Información');
      
      // Crear la hoja principal de datos
      const workSheet = XLSX.utils.aoa_to_sheet(workSheetData);
      
      // Añadir estilos a los encabezados (ancho de columnas)
      const wscols = [
        { wch: 25 }, // Fecha y Hora
        { wch: 20 }, // Usuario
        { wch: 20 }, // Cargo
        { wch: 20 }, // Tipo de Actividad
        { wch: 20 }, // Método de Búsqueda
        { wch: 15 }, // ID Paciente
        { wch: 25 }, // Detalles
        { wch: 25 }, // Campo Modificado
        { wch: 25 }, // Valor Anterior
        { wch: 25 }, // Valor Nuevo
      ];
      workSheet['!cols'] = wscols;
      
      // Añadir la hoja principal al libro
      XLSX.utils.book_append_sheet(workBook, workSheet, 'Historial de Actividades');
      
      // Generar un nombre de archivo basado en la fecha
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `historial_actividades_${dateStr}.xlsx`;
      
      // Descargar el archivo Excel
      XLSX.writeFile(workBook, fileName);
      
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      // Mostrar un mensaje al usuario
      setError("Error al exportar a Excel. Inténtelo de nuevo.");
      setTimeout(() => setError(""), 5000); // Limpiar el mensaje después de 5 segundos
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar collapsed={sidebarCollapsed} />
      
      <MainContent className={sidebarCollapsed ? "expanded-content" : ""}>
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Historial de Registros</h1>
            <p className="welcome-text">Registro de todas las actividades realizadas con los pacientes</p>
          </div>
          
          <div className="dashboard-section">
            <div className="section-header">
              <div className="section-title-container">
                <FaHistory className="section-icon" />
                <h2>Actividades Registradas</h2>
              </div>
              
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Buscar por ID, nombre, documento..."
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button type="button" className="search-button" onClick={() => setCurrentPage(1)}>
                  <FaSearch />
                </button>
              </div>
            </div>
            
            <div className="filters-container">
              <div className="filter-group">
                <label>Tipo de Actividad:</label>
                <select 
                  name="activityType" 
                  value={filters.activityType}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="busqueda">Búsqueda</option>
                  <option value="creacion">Creación</option>
                  <option value="edicion">Edición</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Método de Búsqueda:</label>
                <select 
                  name="searchMethod" 
                  value={filters.searchMethod}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="qr">Código QR</option>
                  <option value="id">ID de Paciente</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Desde:</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="filter-group">
                <label>Hasta:</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                />
              </div>
              
              <button className="reset-filters-btn" onClick={resetFilters}>
                <FaFilter /> Limpiar Filtros
              </button>
                <div className="export-buttons">
                <button 
                  className="export-btn pdf-btn" 
                  title="Exportar a PDF" 
                  onClick={exportToPDF}
                  disabled={loading || exportingPDF || exportingExcel || activities.length === 0}
                >
                  <FaFilePdf /> {exportingPDF ? 'Exportando...' : 'PDF'}
                </button>
                <button 
                  className="export-btn excel-btn" 
                  title="Exportar a Excel" 
                  onClick={exportToExcel}
                  disabled={loading || exportingPDF || exportingExcel || activities.length === 0}
                >
                  <FaFileExcel /> {exportingExcel ? 'Exportando...' : 'Excel'}
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando actividades...</p>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : activities.length === 0 ? (
              <div className="no-data-message">
                <p>No hay actividades registradas para mostrar.</p>
              </div>
            ) : (
              <>
                <div className="patient-table-container">
                  <table className="patient-table">
                    <thead>
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Usuario</th>
                        <th>Tipo de Actividad</th>
                        <th>Método de Búsqueda</th>
                        <th>ID Paciente</th>
                        <th>Detalles del cambio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((activity, index) => (
                        <tr key={index}>
                          <td>{formatDateTime(activity.fecha_hora)}</td>
                          <td>
                            <div className="user-cell">
                              <div className="user-icon">
                                <FaUser />
                              </div>
                              <div className="user-info">
                                <span className="username">{activity.username}</span>
                                <span className="user-role">{activity.cargo_usuario}</span>
                              </div>
                            </div>
                          </td>
                          <td>{activity.tipo_actividad_display}</td>
                          <td>{activity.metodo_busqueda_display || 'N/A'}</td>
                          <td>{activity.paciente_id}</td>
                          <td>
                            {activity.tipo_actividad === 'edicion' ? (
                              <button 
                                className="details-link"
                                onClick={() => handleShowDetails(activity)}
                                title="Ver detalles del cambio"
                              >
                                <FaInfoCircle className="details-icon" />
                                Ver detalles del cambio
                              </button>
                            ) : activity.tipo_actividad === 'creacion' ? (
                              <span>Se creó el paciente</span>
                            ) : (
                              <span>Consulta de información</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {totalPages > 0 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      Mostrando {activities.length} de {totalResults} registros
                    </div>
                    <div className="pagination">
                      <button 
                        onClick={() => paginate(Math.max(1, currentPage - 1))} 
                        disabled={currentPage === 1}
                        className="pagination-arrow"
                        aria-label="Página anterior"
                      >
                        <FaChevronLeft />
                      </button>
                      
                      {paginationButtons()}
                      
                      <button 
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="pagination-arrow"
                        aria-label="Página siguiente"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </MainContent>
      
      {/* Modal para mostrar detalles de los cambios */}
      {selectedActivity && (
        <ChangeDetailsModal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)} 
          activity={selectedActivity} 
        />
      )}
    </div>
  );
};

export default HistoryPage;