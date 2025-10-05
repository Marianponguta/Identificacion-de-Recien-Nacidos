import {useState, useEffect, useContext} from 'react'
import { useHistory } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import MainContent from '../components/MainContent'
import { APP_ENDPOINTS } from '../config/api.config'
import '../styles/sidebar.css'
import '../styles/dashboard.css'
import { FaHome, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

function Dashboard() {
    // Use AuthContext to get user data and functions
    const { user, userProfile, fetchUserProfile, authTokens } = useContext(AuthContext);
    
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    const history = useHistory();
    
    // Use useEffect to fetch user profile if it's not already loaded
    useEffect(() => {
        if (authTokens?.auth_token && user && (!userProfile || !userProfile.email)) {
            console.log("Fetching user profile from Dashboard");
            fetchUserProfile(authTokens.auth_token);
        }
    }, [user, userProfile, fetchUserProfile, authTokens]);

    // Fetch user activities
    useEffect(() => {
        const fetchActivities = async () => {
            if (!authTokens?.auth_token) return;
            
            setLoading(true);
            
            try {
                const response = await fetch(APP_ENDPOINTS.ACTIVIDADES, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${authTokens.auth_token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch activities');
                }
                
                const data = await response.json();
                console.log('User activities:', data);
                setActivities(data.results || []);
                
            } catch (err) {
                console.error('Error fetching activities:', err);
                setError("Error al cargar las actividades recientes.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchActivities();
    }, [authTokens]);

    // Function to filter out consecutive repeated patients
    const filterDuplicatePatients = (activitiesList) => {
        if (!activitiesList || activitiesList.length === 0) return [];
        
        const result = [];
        const recentPatients = []; // Track recent patient IDs
        const minUniquePatientsBetweenDuplicates = 2; // Min number of different patients before showing a repeat
        
        activitiesList.forEach(activity => {
            const patientId = activity.paciente_id;
            
            // Check if this patient was recently shown
            const patientIndex = recentPatients.indexOf(patientId);
            
            // If this patient hasn't been shown recently or there have been enough unique patients since
            if (patientIndex === -1 || 
                recentPatients.length - patientIndex > minUniquePatientsBetweenDuplicates) {
                
                // Add this activity to our result
                result.push(activity);
                
                // Update recent patients list
                if (patientIndex !== -1) {
                    // Remove old position
                    recentPatients.splice(patientIndex, 1);
                }
                // Add to end of list (most recent)
                recentPatients.push(patientId);
            }
        });
        
        return result;
    };

    // Get username and full_name for displaying in the dashboard
    const username = userProfile?.username || user?.username;
    const full_name = userProfile?.perfil ? 
        `${userProfile.perfil.nombre} ${userProfile.perfil.apellido}` : 
        user?.full_name;
    
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
    
    // Function to format date and time
    const formatDateAndTime = (dateStr, timeStr) => {
        if (!dateStr) return "";
        
        const date = new Date(dateStr);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('es-ES', dateOptions);
        
        if (!timeStr) return formattedDate;
        
        // Format time - assuming timeStr is in HH:MM:SS format
        const timeParts = timeStr.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        
        return `${formattedDate}, ${formattedHours}:${minutes} ${ampm}`;
    };
    
    // Navigate to patient creation page
    const handleNavigateToPatientCreation = () => {
      history.push('/crear-paciente');
    };

    // Filter activities to avoid consecutive duplicates
    const filteredActivities = filterDuplicatePatients(activities);

    return (
        <div className="dashboard-container">
            {/* Sidebar component */}
            <Sidebar collapsed={sidebarCollapsed} />
            
            {/* Main content */}
            <MainContent className={sidebarCollapsed ? "expanded-content" : ""}>
                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <h1>Panel de Control</h1>
                        <p className="welcome-text">Bienvenido(a), {full_name || username || 'Usuario'}!</p>
                    </div>
                    
                    <div className="dashboard-section">
                      <div className="section-header">
                        <div className="section-title-container">
                          <FaHome className="section-icon" />
                          <h2>Búsquedas Recientes</h2>
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
                              <p>No hay actividades recientes para mostrar.</p>
                              <button 
                                  onClick={handleNavigateToPatientCreation}
                                  className="create-patient-button"
                              >
                                  Crear nuevo paciente
                              </button>
                          </div>
                      ) : (
                          <div className="patient-table-container">
                              <table className="patient-table">
                                  <thead>
                                      <tr>
                                          <th>ID</th>
                                          <th>Nombre de la madre</th>
                                          <th>Documento de la madre</th>
                                          <th>Sexo del bebé</th>
                                          <th>Talla (cm)</th>
                                          <th>Peso (kg)</th>
                                          <th>Fecha y hora de nacimiento</th>
                                          <th>¿Dado de alta?</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {filteredActivities.map((activity, index) => (
                                          <tr key={index}>
                                              <td>{activity.paciente_id}</td>
                                              <td>{activity.nombre_madre}</td>
                                              <td>{activity.documento_madre}</td>
                                              <td>{activity.sexo_bebe === "M" ? "Masculino" : "Femenino"}</td>
                                              <td>{activity.talla}</td>
                                              <td>{activity.peso}</td>
                                              <td>
                                                  {formatDateAndTime(
                                                      activity.fecha_nacimiento, 
                                                      activity.hora_nacimiento
                                                  )}
                                              </td>
                                              <td className="status-cell">
                                                  {activity.dado_alta === 'True' ? (
                                                      <div className="status-indicator positive">
                                                          <FaCheckCircle />
                                                      </div>
                                                  ) : (
                                                      <div className="status-indicator negative">
                                                          <FaTimesCircle />
                                                      </div>
                                                  )}
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}
                    </div>
                </div>
            </MainContent>
        </div>
    );
}

export default Dashboard