import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { APP_ENDPOINTS } from '../config/api.config';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import { FaQrcode, FaClock, FaDownload } from 'react-icons/fa';
import '../styles/patientRegistration.css';

const PatientRegistration = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    nombre_madre: '',
    documento_madre: '',
    sexo_bebe: 'M',
    talla: '',
    peso: '',
    fecha_nacimiento: '',
    hora_nacimiento: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  const { authTokens } = useContext(AuthContext);
  
  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (e) => {
      setSidebarCollapsed(e.detail.isCollapsed);
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validations
    if (!formData.nombre_madre || !formData.documento_madre || 
        !formData.talla || !formData.peso || 
        !formData.fecha_nacimiento || !formData.hora_nacimiento) {
      setError('Por favor, complete todos los campos obligatorios');
      return;
    }

    // Create object to send to server
    const patientData = {
      ...formData,
      dado_alta: 'False',
      codigo_qr: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Temporary code, backend will process it
    };

    try {
      const response = await fetch(APP_ENDPOINTS.PACIENTES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authTokens.auth_token}`
        },
        body: JSON.stringify(patientData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      console.log('Paciente creado:', data);
      
      setSuccessMessage('Paciente registrado con éxito');
      setQrCode(data.codigo_qr || data.id_paciente);
      setShowQRCode(true);
      
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      setError(`Error al registrar paciente: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_madre: '',
      documento_madre: '',
      sexo_bebe: 'M',
      talla: '',
      peso: '',
      fecha_nacimiento: '',
      hora_nacimiento: '',
    });
    setShowQRCode(false);
    setSuccessMessage('');
    setError('');
  };

  const downloadQRCode = async () => {
    const qrCodeImg = document.querySelector('.qr-display img');
    
    if (qrCodeImg) {
      try {
        // Fetch the image
        const response = await fetch(qrCodeImg.src);
        // Convert to blob
        const blob = await response.blob();
        // Create object URL
        const objectURL = URL.createObjectURL(blob);
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = objectURL;
        downloadLink.download = `${qrCode}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Clean up
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(objectURL);
      } catch (error) {
        console.error('Error al descargar código QR:', error);
        alert('Error al descargar el código QR. Por favor, intente nuevamente.');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar collapsed={sidebarCollapsed} />
      
      <MainContent className={sidebarCollapsed ? "expanded-content" : ""}>
        <div className="patient-registration-container">
          <h1 className="page-title">Crear nuevo paciente</h1>
          
          <div className="registration-card">
            <div className="card-header">
              <FaQrcode className="card-icon" />
              <h2>Formulario de registro</h2>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {!showQRCode ? (
              <form onSubmit={handleSubmit} className="registration-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>Nombre de la madre</label>
                    <input
                      type="text"
                      name="nombre_madre"
                      value={formData.nombre_madre}
                      onChange={handleChange}
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-field">
                    <label>Documento de la madre</label>
                    <input
                      type="text"
                      name="documento_madre"
                      value={formData.documento_madre}
                      onChange={handleChange}
                      placeholder="Número de documento"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-field">
                    <label>Sexo del bebé</label>
                    <select
                      name="sexo_bebe"
                      value={formData.sexo_bebe}
                      onChange={handleChange}
                      className="gender-select"
                      required
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row two-columns">
                  <div className="form-field">
                    <label>Talla (cm)</label>
                    <input
                      type="number"
                      name="talla"
                      value={formData.talla}
                      onChange={handleChange}
                      placeholder="Ej. 52.5"
                      required
                      step="0.01"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Peso (kg)</label>
                    <input
                      type="number"
                      name="peso"
                      value={formData.peso}
                      onChange={handleChange}
                      placeholder="Ej. 3.5"
                      required
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="form-row two-columns">
                  <div className="form-field">
                    <label>Fecha de nacimiento</label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Hora de nacimiento</label>
                    <div className="time-input-container">
                      <input
                        type="time"
                        name="hora_nacimiento"
                        value={formData.hora_nacimiento}
                        onChange={handleChange}
                        required
                      />
                      <FaClock className="time-icon" />
                    </div>
                  </div>
                </div>
                
                <button type="submit" className="submit-button">
                  Crear paciente
                </button>
              </form>
            ) : (
              <div className="qr-code-container">
                <p>Código de identificación: <strong>{qrCode}</strong></p>
                <div className="qr-display">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCode}`} 
                    alt="QR Code" 
                  />
                </div>
                
                <div className="qr-actions">
                  <button onClick={downloadQRCode} className="download-qr-btn">
                    <FaDownload /> Descargar QR
                  </button>
                </div>
                
                <button onClick={resetForm} className="submit-button">
                  Registrar otro paciente
                </button>
              </div>
            )}
          </div>
        </div>
      </MainContent>
    </div>
  );
};

export default PatientRegistration;
