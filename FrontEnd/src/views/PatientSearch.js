import React, { useState, useEffect, useContext, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import { API_ENDPOINTS_BASE } from '../config/api.config';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaQrcode, FaIdCard, FaSearch } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import PatientInfoModal from '../components/PatientInfoModal';
import '../styles/patientSearch.css';

const PatientSearch = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchMethod, setSearchMethod] = useState('qr'); // 'qr' or 'id'
  const [patientId, setPatientId] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanStarted, setScanStarted] = useState(false);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  
  const { authTokens } = useContext(AuthContext);
  const scannerRef = useRef(null);
  const qrScannerDivRef = useRef(null);
  
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

  // Limpiar el escáner al desmontar el componente
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
          console.log("Scanner cleared on component unmount");
        } catch (error) {
          console.log("Error al limpiar escáner en desmontaje:", error);
        }
      }
    };
  }, []);

  // Iniciar el escáner QR cuando se selecciona ese método
  useEffect(() => {
    console.log("searchMethod changed to:", searchMethod);
    console.log("scanStarted:", scanStarted);
    console.log("scannerInitialized:", scannerInitialized);
    
    if (searchMethod === 'qr' && !scanStarted && !scannerInitialized) {
      // Dar tiempo para que el DOM esté listo
      const timeoutId = setTimeout(() => {
        initializeQRScanner();
      }, 1500);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMethod, scanStarted, scannerInitialized]);

  const initializeQRScanner = () => {
    console.log("Initializing QR scanner...");
    console.log("qrScannerDivRef.current:", qrScannerDivRef.current);
    
    if (qrScannerDivRef.current) {
      try {
        // Limpiar cualquier instancia anterior
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        
        // Crear el elemento div si no existe
        if (!document.getElementById('qr-reader')) {
          const qrDiv = document.createElement('div');
          qrDiv.id = 'qr-reader';
          qrScannerDivRef.current.appendChild(qrDiv);
        }
        
        const scanner = new Html5QrcodeScanner('qr-reader', {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        });
        
        const onScanSuccess = (decodedText) => {
          console.log(`Código QR escaneado: ${decodedText}`);
          scanner.clear();
          searchPatientByQR(decodedText);
        };
        
        const onScanFailure = (error) => {
          // No mostrar cada error de escaneo, solo si es un error de inicio
          if (error.toString().includes('starting')) {
            console.error(`Error al escanear: ${error}`);
          }
        };
        
        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;
        setScanStarted(true);
        setScannerInitialized(true);
        console.log("QR scanner initialized successfully");
      } catch (error) {
        console.error("Error al inicializar el escáner QR:", error);
        setError('Error al inicializar el escáner. Por favor, intente de nuevo o use otro método de búsqueda.');
        setScanStarted(false);
        setScannerInitialized(false);
      }
    } else {
      console.error("QR scanner div reference not found");
    }
  };

  // Buscar paciente por QR
  const searchPatientByQR = async (qrCode) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_ENDPOINTS_BASE}/pacientes/qr/buscar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authTokens.auth_token}`
        },
        body: JSON.stringify({ codigo_qr: qrCode })
      });
      
      const data = await response.json();
      
      if (response.ok && data.existe) {
        setPatientData(data.paciente);
        setIsModalOpen(true);
      } else {
        setError(data.mensaje || 'No se encontró ningún paciente con ese código QR');
      }
    } catch (err) {
      console.error('Error al buscar paciente:', err);
      setError('Error al conectar con el servidor. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Buscar paciente por ID
  const searchPatientById = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!patientId.trim()) {
      setError('Por favor, ingrese un ID de paciente');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_ENDPOINTS_BASE}/pacientes/${patientId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authTokens.auth_token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatientData(data);
        setIsModalOpen(true);
      } else {
        if (response.status === 404) {
          setError('No se encontró ningún paciente con ese ID');
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Error al buscar paciente');
        }
      }
    } catch (err) {
      console.error('Error al buscar paciente:', err);
      setError('Error al conectar con el servidor. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (method) => {
    if (method === searchMethod) return;
    
    setSearchMethod(method);
    setError('');
    
    // Limpiar el escáner si existe
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.log("Error al limpiar escáner:", error);
      }
      scannerRef.current = null;
    }
    
    // Resetear estados para el escáner QR
    setScanStarted(false);
    setScannerInitialized(false);
  };

  // Función para actualizar los datos del paciente después de editar
  const handlePatientUpdate = (updatedData) => {
    setPatientData(updatedData);
  };
  
  return (
    <div className="dashboard-container">
      <Sidebar collapsed={sidebarCollapsed} />
      
      <MainContent className={sidebarCollapsed ? "expanded-content" : ""}>
        <div className="patient-search-container">
          <h1 className="page-title">Buscar Paciente</h1>
          
          <div className="search-methods">
            <div 
              className={`search-method ${searchMethod === 'qr' ? 'active' : ''}`}
              onClick={() => handleMethodChange('qr')}
            >
              <div className="method-icon">
                <FaQrcode />
              </div>
              <h2>Escanear QR existente</h2>
            </div>
            
            <div 
              className={`search-method ${searchMethod === 'id' ? 'active' : ''}`}
              onClick={() => handleMethodChange('id')}
            >
              <div className="method-icon">
                <FaIdCard />
              </div>
              <h2>Ingrese el ID del paciente</h2>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          <div className="search-content">
            {searchMethod === 'qr' ? (
              <div className="qr-scanner-container" ref={qrScannerDivRef}>
                <p className="scanner-instruction">Coloque el código QR frente a la cámara</p>
              </div>
            ) : (
              <div className="id-searcher-container">
                <form onSubmit={searchPatientById} className="id-search-form">
                  <div className="search-input-container">
                    <input
                      type="text"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      placeholder="Escriba el ID del paciente (ej: FOSB01)"
                      className="search-input"
                    />
                    <button type="submit" className="search-button" disabled={loading}>
                      {loading ? 'Buscando...' : <FaSearch />}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </MainContent>
      
      {patientData && (
        <PatientInfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          patientData={patientData}
          onPatientUpdate={handlePatientUpdate}
        />
      )}
    </div>
  );
};

export default PatientSearch;
