// src/components/MainContent.js
import React, { useState, useEffect } from 'react';
import '../styles/sidebar.css';

const MainContent = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Detectar cambios en el sidebar para ajustar el margen del contenido principal
  useEffect(() => {
    const handleResize = () => {
      // En dispositivos móviles, el sidebar se colapsa por defecto
      const mobileView = window.innerWidth <= 768;
      setIsSidebarCollapsed(mobileView);
      
      // Emitir un evento para sincronizar con otros componentes si es necesario
      if (mobileView) {
        const event = new CustomEvent('viewportChange', { 
          detail: { isMobile: true } 
        });
        window.dispatchEvent(event);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Establecer el estado inicial al montar
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Escuchar eventos personalizados para sincronizar con el estado del sidebar
  useEffect(() => {
    const handleSidebarToggle = (e) => {
      setIsSidebarCollapsed(e.detail.isCollapsed);
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);
  
  return (
    <main className={`content-container ${isSidebarCollapsed ? 'expanded' : ''}`}>
      {children}
    </main>
  );
};

export default MainContent;
