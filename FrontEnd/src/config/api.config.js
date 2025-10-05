/**
 * Configuración centralizada de la API
 * 
 * Este archivo centraliza todas las URLs y configuraciones relacionadas con el backend.
 * Para cambiar la IP o dominio del servidor, solo es necesario modificar la variable
 * de entorno REACT_APP_API_BASE_URL en el archivo .env
 */

/**
 * URL base de la API del backend
 * Se obtiene de las variables de entorno o usa un valor por defecto para desarrollo
 */
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://192.168.1.12:8000';

/**
 * URL base para los endpoints de la API
 */
export const API_ENDPOINTS_BASE = `${API_BASE_URL}/api`;

/**
 * Endpoints de autenticación
 */
export const AUTH_ENDPOINTS = {
    LOGIN: `${API_ENDPOINTS_BASE}/auth/token/login`,
    LOGOUT: `${API_ENDPOINTS_BASE}/auth/token/logout`,
    REGISTER: `${API_ENDPOINTS_BASE}/auth/users/`,
    REFRESH_TOKEN: `${API_ENDPOINTS_BASE}/token/refresh/`,
};

/**
 * Endpoints de la aplicación
 */
export const APP_ENDPOINTS = {
    ACTIVIDADES: `${API_ENDPOINTS_BASE}/actividades/`,
    PACIENTES: `${API_ENDPOINTS_BASE}/pacientes/`,
};

/**
 * Construye una URL completa para un endpoint específico
 * @param {string} endpoint - Ruta del endpoint (ej: '/actividades/')
 * @param {Object} params - Parámetros de consulta opcionales
 * @returns {string} URL completa
 */
export const buildApiUrl = (endpoint, params = null) => {
    const baseUrl = endpoint.startsWith('http') ? endpoint : `${API_ENDPOINTS_BASE}${endpoint}`;
    
    if (!params) {
        return baseUrl;
    }

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, value);
        }
    });

    const queryString = queryParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Configuración por defecto para las peticiones fetch
 */
export const DEFAULT_FETCH_CONFIG = {
    headers: {
        'Content-Type': 'application/json',
    },
};

/**
 * Obtiene los headers con autenticación
 * @param {string} token - Token de autenticación
 * @returns {Object} Headers configurados
 */
export const getAuthHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': token ? `Token ${token}` : '',
});

/**
 * Exportación por defecto con todas las configuraciones
 */
const apiConfig = {
    API_BASE_URL,
    API_ENDPOINTS_BASE,
    AUTH_ENDPOINTS,
    APP_ENDPOINTS,
    buildApiUrl,
    DEFAULT_FETCH_CONFIG,
    getAuthHeaders,
};

export default apiConfig;
