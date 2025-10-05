import React from 'react';
import { FaEdit } from 'react-icons/fa';
import '../styles/modal.css';
import '../styles/changeDetailsModal.css';

const ChangeDetailsModal = ({ isOpen, onClose, activity }) => {
  if (!isOpen || !activity) return null;
  
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    
    const date = new Date(dateTime);
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    
    const formattedDate = date.toLocaleDateString('es-ES', dateOptions);
    const formattedTime = date.toLocaleTimeString('es-ES', timeOptions);
    
    return `${formattedDate}, ${formattedTime}`;
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container change-details-modal">
        <div className="modal-header">
          <div className="modal-title-container">
            <div className="modal-icon">
              <FaEdit />
            </div>
            <h2 className="modal-title">Detalles del Cambio</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="activity-meta">
            <div className="meta-item">
              <strong>Usuario:</strong> {activity.username} ({activity.cargo_usuario})
            </div>
            <div className="meta-item">
              <strong>Fecha y Hora:</strong> {formatDateTime(activity.fecha_hora)}
            </div>
            <div className="meta-item">
              <strong>ID Paciente:</strong> {activity.paciente_id}
            </div>
            <div className="meta-item">
              <strong>Nombre Madre:</strong> {activity.nombre_madre}
            </div>
          </div>
          
          {activity.detalles_cambio && Object.keys(activity.detalles_cambio).length > 0 ? (
            <div className="changes-table-container">
              <h3>Cambios Realizados</h3>
              <table className="changes-table">
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Valor Anterior</th>
                    <th>Valor Nuevo</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(activity.detalles_cambio).map(([campo, detalle]) => (
                    <tr key={campo}>
                      <td>{detalle.campo_display}</td>
                      <td className="old-value">{detalle.valor_antiguo_display}</td>
                      <td className="new-value">{detalle.valor_nuevo_display}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-changes-message">
              No se registraron cambios específicos
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangeDetailsModal;
