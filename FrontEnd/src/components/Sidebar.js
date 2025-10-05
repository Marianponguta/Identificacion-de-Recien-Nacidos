// src/components/Sidebar.js
import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/sidebar.css';

// Importar íconos para el sidebar
import { 
  FaBars, FaHome, FaQrcode, FaSearch, 
  FaHistory, FaSignOutAlt, FaUser
} from 'react-icons/fa';

const Sidebar = ({ collapsed }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed || false);
  const { logoutUser, user, userProfile, fetchUserProfile, getAuthTokenAndFetchProfile } = useContext(AuthContext);
  const location = useLocation();
  
  // Detectar el tamaño de la pantalla al inicio y cuando cambia
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      }
    };
    
    // Inicializar
    handleResize();
    
    // Agregar listener para redimensionamiento
    window.addEventListener('resize', handleResize);
    
    // Limpiar listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Improved profile loading logic
  useEffect(() => {
    const loadUserProfile = async () => {
      // If we have a user but no profile or the profile is incomplete
      if (user && (!userProfile || !userProfile.email)) {
        console.log("Attempting to load user profile from sidebar");
        
        // Check if there's an auth_token in authTokens
        const authTokens = localStorage.getItem("authTokens");
        
        if (authTokens) {
          const tokens = JSON.parse(authTokens);
          if (tokens.auth_token) {
            // If we have an auth token, use it to fetch the profile
            await fetchUserProfile(tokens.auth_token);
          } else if (localStorage.getItem("tempUserPassword")) {
            // If we have a stored password, use it to get a new auth token
            await getAuthTokenAndFetchProfile(user.username, localStorage.getItem("tempUserPassword"));
          }
        }
      }
    };
    
    loadUserProfile();
  }, [user, userProfile, fetchUserProfile, getAuthTokenAndFetchProfile]);

  const toggleSidebar = () => {
    const newIsCollapsed = !isCollapsed;
    setIsCollapsed(newIsCollapsed);
    
    // Emitir un evento personalizado para que otros componentes puedan reaccionar
    // al cambio de estado del sidebar
    const event = new CustomEvent('sidebarToggle', { 
      detail: { isCollapsed: newIsCollapsed } 
    });
    window.dispatchEvent(event);
  };

  // Función para determinar si un link está activo
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (userProfile && userProfile.perfil) {
      return `${userProfile.perfil.nombre} ${userProfile.perfil.apellido}`;
    }
    
    if (user) {
      return user.username;
    }
    
    return "Usuario";
  };
  
  // Helper function to get user email
  const getUserEmail = () => {
    if (userProfile) {
      return userProfile.email;
    }
    
    if (user && user.email) {
      return user.email;
    }
    
    return "usuario@example.com";
  };
  
  return (
    <>
      {/* Botón para mostrar/ocultar el sidebar */}
      <button 
        className={`sidebar-toggle ${isCollapsed ? 'active' : ''}`}
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "Mostrar menú" : "Ocultar menú"}
      >
        <FaBars className="toggle-icon" />
      </button>
      
      {/* Sidebar */}      
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="user-profile">
          <div className="avatar">
            <FaUser className="avatar-icon" />
          </div>
          <h3 className="user-name">{getUserDisplayName()}</h3>
          <p className="user-email">{getUserEmail()}</p>
        </div>
        
        <div className="divider"></div>
        
        <ul className="nav-menu">
          <li>
            <Link 
              to="/dashboard" 
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <span className="nav-icon"><FaHome /></span>
              <span>Inicio</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/crear-paciente" 
              className={`nav-item ${isActive('/crear-paciente') ? 'active' : ''}`}
            >
              <span className="nav-icon"><FaQrcode /></span>
              <span>Crear nuevo paciente</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/buscar-paciente" 
              className={`nav-item ${isActive('/buscar-paciente') ? 'active' : ''}`}
            >
              <span className="nav-icon"><FaSearch /></span>
              <span>Buscar Paciente</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/historial" 
              className={`nav-item ${isActive('/historial') ? 'active' : ''}`}
            >
              <span className="nav-icon"><FaHistory /></span>
              <span>Historial de Registros</span>
            </Link>
          </li>
        </ul>
          <div className="logout-container">
          <button onClick={logoutUser} className="logout-btn">
            <span className="nav-icon"><FaSignOutAlt /></span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
