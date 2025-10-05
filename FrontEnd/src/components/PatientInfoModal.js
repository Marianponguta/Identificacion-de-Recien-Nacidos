import React, { useState, useContext } from 'react';
import { FaUser, FaIdCard, FaCalendarAlt, FaClock, FaRuler, FaWeight, FaMale, FaFemale, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import { API_ENDPOINTS_BASE } from '../config/api.config';
import '../styles/modal.css';
import '../styles/patientInfoModal.css';

const PatientInfoModal = ({ isOpen, onClose, patientData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { authTokens } = useContext(AuthContext);
  
  if (!isOpen || !patientData) return null;
  
  // Inicializar los datos editables cuando se activa el modo edición
  const handleEditClick = () => {
    setEditedData({
      nombre_madre: patientData.nombre_madre,
      documento_madre: patientData.documento_madre,
      sexo_bebe: patientData.sexo_bebe,
      fecha_nacimiento: patientData.fecha_nacimiento,
      hora_nacimiento: patientData.hora_nacimiento,
      peso: patientData.peso,
      talla: patientData.talla,
      dado_alta: patientData.dado_alta,
    });
    setIsEditing(true);
  };
  
  // Cancelar la edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  };
  
  // Manejar cambios en los campos editables
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      [name]: value
    });
  };
  
  // Manejar cambios en el estado de alta
  const handleAltaChange = () => {
    setEditedData({
      ...editedData,
      dado_alta: editedData.dado_alta === 'True' ? 'False' : 'True'
    });
  };
  
  // Formatear la fecha de nacimiento
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Formatear la hora
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Asegurarse de que timeString tenga el formato HH:MM:SS
    const timeParts = timeString.split(':');
    if (timeParts.length < 2) return timeString;
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };
  
  // Guardar los cambios
  const handleSaveChanges = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_ENDPOINTS_BASE}/pacientes/${patientData.id_paciente}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authTokens.auth_token}`
        },
        body: JSON.stringify(editedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar el paciente');
      }
      
      const updatedPatient = await response.json();
      
      // Actualizar patientData con los nuevos valores (esto requerirá una función callback desde el componente padre)
      setSuccess('Información actualizada con éxito');
      setIsEditing(false);
      
      // Actualizar los datos del paciente en el modal
      Object.assign(patientData, updatedPatient);
      
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container patient-info-modal">
        <div className="modal-header">
          <div className="modal-title-container">
            <div className="modal-icon">
              <FaIdCard />
            </div>
            <h2 className="modal-title">Ficha del Paciente</h2>
          </div>
          
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {error && <div className="error-message modal-message">{error}</div>}
          {success && <div className="success-message modal-message">{success}</div>}
          
          <div className="patient-id-section">
            <div className="patient-id-container">
              <h3>ID del Paciente</h3>
              <div className="patient-id">{patientData.id_paciente}</div>
            </div>
            
            <div className="patient-status">
              {isEditing ? (
                <button
                  className={`status-badge editable ${editedData.dado_alta === 'True' ? 'high-alta' : ''}`}
                  onClick={handleAltaChange}
                >
                  {editedData.dado_alta === 'True' ? 'DADO DE ALTA' : 'EN ATENCIÓN'}
                </button>
              ) : (
                <span className={`status-badge ${patientData.dado_alta === 'True' ? 'high-alta' : ''}`}>
                  {patientData.dado_alta === 'True' ? 'DADO DE ALTA' : 'EN ATENCIÓN'}
                </span>
              )}
            </div>
          </div>
          
          <div className="patient-info-section">
            <h3>Información de la Madre</h3>
            <div className="info-item">
              <div className="info-icon">
                <FaUser />
              </div>
              <div className="info-content">
                <label>Nombre de la madre</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nombre_madre"
                    value={editedData.nombre_madre}
                    onChange={handleInputChange}
                    className="editable-field"
                  />
                ) : (
                  <p>{patientData.nombre_madre}</p>
                )}
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">
                <FaIdCard />
              </div>
              <div className="info-content">
                <label>Documento de identidad</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="documento_madre"
                    value={editedData.documento_madre}
                    onChange={handleInputChange}
                    className="editable-field"
                  />
                ) : (
                  <p>{patientData.documento_madre}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="patient-info-section">
            <h3>Información del Bebé</h3>
            
            <div className="info-row">
              <div className="info-item">
                <div className="info-icon">
                  {patientData.sexo_bebe === 'M' ? <FaMale className="icon-male" /> : <FaFemale className="icon-female" />}
                </div>
                <div className="info-content">
                  <label>Sexo</label>
                  {isEditing ? (
                    <select
                      name="sexo_bebe"
                      value={editedData.sexo_bebe}
                      onChange={handleInputChange}
                      className="editable-field"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  ) : (
                    <p>{patientData.sexo_bebe === 'M' ? 'Masculino' : 'Femenino'}</p>
                  )}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">
                  <FaCalendarAlt />
                </div>
                <div className="info-content">
                  <label>Fecha de nacimiento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={editedData.fecha_nacimiento}
                      onChange={handleInputChange}
                      className="editable-field"
                    />
                  ) : (
                    <p>{formatDate(patientData.fecha_nacimiento)}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="info-row">
              <div className="info-item">
                <div className="info-icon">
                  <FaClock />
                </div>
                <div className="info-content">
                  <label>Hora de nacimiento</label>
                  {isEditing ? (
                    <input
                      type="time"
                      name="hora_nacimiento"
                      value={editedData.hora_nacimiento}
                      onChange={handleInputChange}
                      className="editable-field"
                    />
                  ) : (
                    <p>{formatTime(patientData.hora_nacimiento)}</p>
                  )}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">
                  <FaWeight />
                </div>
                <div className="info-content">
                  <label>Peso</label>
                  {isEditing ? (
                    <div className="unit-input">
                      <input
                        type="number"
                        name="peso"
                        value={editedData.peso}
                        onChange={handleInputChange}
                        className="editable-field"
                        step="0.01"
                        min="0"
                      />
                      <span className="unit">kg</span>
                    </div>
                  ) : (
                    <p>{patientData.peso} kg</p>
                  )}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">
                  <FaRuler />
                </div>
                <div className="info-content">
                  <label>Talla</label>
                  {isEditing ? (
                    <div className="unit-input">
                      <input
                        type="number"
                        name="talla"
                        value={editedData.talla}
                        onChange={handleInputChange}
                        className="editable-field"
                        step="0.01"
                        min="0"
                      />
                      <span className="unit">cm</span>
                    </div>
                  ) : (
                    <p>{patientData.talla} cm</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Botones de edición al final de la ficha */}
          <div className="edit-actions-bar bottom-actions">
            {!isEditing ? (
              <button className="edit-btn" onClick={handleEditClick} title="Editar información">
                <FaEdit /> Editar información
              </button>
            ) : (
              <>
                <button className="cancel-btn" onClick={handleCancelEdit} title="Cancelar">
                  <FaTimes /> Cancelar
                </button>
                <button 
                  className="save-btn" 
                  onClick={handleSaveChanges} 
                  disabled={isLoading}
                  title="Guardar cambios"
                >
                  <FaSave /> {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoModal;
