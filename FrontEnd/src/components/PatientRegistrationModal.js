import React, { useState, useContext } from 'react';
import { FaQrcode } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import '../styles/modal.css';

const PatientRegistrationModal = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState('form'); // 'form' or 'qr'
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
  const { authTokens } = useContext(AuthContext);

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
    
    // Validaciones básicas
    if (!formData.nombre_madre || !formData.documento_madre || 
        !formData.talla || !formData.peso || 
        !formData.fecha_nacimiento || !formData.hora_nacimiento) {
      setError('Por favor, complete todos los campos obligatorios');
      return;
    }

    // Crear objeto para enviar al servidor
    const patientData = {
      ...formData,
      dado_alta: 'False',
      codigo_qr: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Código temporal, el backend lo procesará
    };

    try {
      const response = await fetch('https://192.168.1.4:8000/api/pacientes/', {
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
      setStage('qr');
      
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      setError(`Error al registrar paciente: ${error.message}`);
    }
  };

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-icon">
            <FaQrcode />
          </div>
          <h2 className="modal-title">Crear nuevo paciente</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {stage === 'form' ? (
            <form onSubmit={handleSubmit} className="patient-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-field">
                <input
                  type="text"
                  name="nombre_madre"
                  placeholder="Nombre de la madre"
                  value={formData.nombre_madre}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <input
                  type="text"
                  name="documento_madre"
                  placeholder="Documento de la madre"
                  value={formData.documento_madre}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-field">
                <label className="role-label">Sexo del bebé</label>
                <div className="role-options">
                  <label className="role-option">
                    <input
                      type="radio"
                      name="sexo_bebe"
                      value="M"
                      checked={formData.sexo_bebe === "M"}
                      onChange={handleChange}
                      className="role-radio"
                    />
                    Masculino
                  </label>
                  <label className="role-option">
                    <input
                      type="radio"
                      name="sexo_bebe"
                      value="F"
                      checked={formData.sexo_bebe === "F"}
                      onChange={handleChange}
                      className="role-radio"
                    />
                    Femenino
                  </label>
                </div>
              </div>
              
              <div className="form-field">
                <input
                  type="number"
                  name="talla"
                  placeholder="Talla (cm)"
                  value={formData.talla}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="form-field">
                <input
                  type="number"
                  name="peso"
                  placeholder="Peso (kg)"
                  value={formData.peso}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="form-field">
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  required
                />
                <label>Fecha de nacimiento</label>
              </div>
              
              <div className="form-field">
                <input
                  type="time"
                  name="hora_nacimiento"
                  value={formData.hora_nacimiento}
                  onChange={handleChange}
                  required
                />
                <label>Hora de nacimiento</label>
              </div>
              
              <button type="submit" className="registration-button">Crear paciente</button>
            </form>
          ) : (
            <div className="qr-code-container">
              <div className="success-message">{successMessage}</div>
              <p>Código de identificación: <strong>{qrCode}</strong></p>
              <div id="qrcode" className="qr-display">
                {/* Aquí se mostrará el código QR */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCode}`} 
                  alt="QR Code" 
                />
              </div>
              <button onClick={() => {
                setStage('form');
                setFormData({
                  nombre_madre: '',
                  documento_madre: '',
                  sexo_bebe: 'M',
                  talla: '',
                  peso: '',
                  fecha_nacimiento: '',
                  hora_nacimiento: '',
                });
              }} className="registration-button">Registrar otro paciente</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRegistrationModal;
