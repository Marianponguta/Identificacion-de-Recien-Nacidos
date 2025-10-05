import {createContext, useState, useEffect, useCallback, useRef} from "react";
import {useHistory} from "react-router-dom";
import { AUTH_ENDPOINTS } from "../config/api.config";
const swal = require('sweetalert2')

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem("authTokens")
            ? JSON.parse(localStorage.getItem("authTokens"))
            : null
    );
    
    const [user, setUser] = useState(() => 
        localStorage.getItem("authTokens")
            ? JSON.parse(localStorage.getItem("authTokens"))
            : null
    );
    
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const history = useHistory();

    const loginUser = async (email, password) => {
        try {
            const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    username: email, password
                })
            });
            
            const data = await response.json();
            console.log("Login response:", data);

            if(response.status === 200){
                console.log("Logged In");
                // Configurar el usuario directamente desde los datos de respuesta o crear un objeto de usuario
                const userData = { 
                    username: email,
                    auth_token: data.auth_token 
                };
                
                setAuthTokens(data);
                setUser(userData);
                localStorage.setItem("authTokens", JSON.stringify(data));
                
                // Store password temporarily for token refresh
                localStorage.setItem("tempUserPassword", password);
                
                // Get user profile after login
                await fetchUserProfile(data.auth_token);
                
                history.push("/dashboard");                
                swal.fire({
                    title: "Inicio de sesión exitoso",
                    icon: "success",
                    toast: true,
                    timer: 6000,
                    position: 'top-right',
                    timerProgressBar: true,
                    showConfirmButton: false,
                    background: '#d4edda',
                    iconColor: '#28a745',
                    color: '#333333',
                });
            } else {    
                console.log(response.status);
                console.log("Server response:", data);
                swal.fire({
                    title: "Error de autenticación",
                    text: "No se encontró una cuenta activa con las credenciales proporcionadas.",
                    icon: "error",
                    toast: true,
                    timer: 6000,
                    position: 'top-right',
                    timerProgressBar: true,
                    showConfirmButton: false,
                    background: '#ffcccc',
                    iconColor: '#ff3333',
                    color: '#333333',
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            swal.fire({
                title: "Error de conexión",
                text: "No se puede conectar al servidor. Inténtelo más tarde.",
                icon: "error",
                toast: true,
                timer: 6000,
                position: 'top-right',
                timerProgressBar: true,
                showConfirmButton: false,
                background: '#ffcccc',
                iconColor: '#ff3333',
                color: '#333333',
            });
        }
    };

    // No longer needed as we handle everything in the loginUser function

    const registerUser = async (nombre, apellido, cargo, username, email, password, password2) => {
        try {
            console.log("Registering user with:", { nombre, apellido, cargo, username, email });
            
            // Prepare payload according to API expectations
            const payload = {
                nombre,
                apellido,
                cargo,
                username,
                email,
                password,
                password2
            };
            
            console.log("Sending payload:", payload);
            
            const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
                method: "POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            console.log("Register response:", data);
            
            if(response.status === 201){
                // Mostrar mensaje de éxito sin redireccionar automáticamente
                swal.fire({
                    title: "Registro exitoso",
                    text: "¡Ya puedes iniciar sesión con tu cuenta!",
                    icon: "success",
                    toast: true,
                    timer: 6000,
                    position: 'top-right',
                    timerProgressBar: true,
                    showConfirmButton: false,
                    background: '#d4edda',
                    iconColor: '#28a745',
                    color: '#333333',
                });
                
                // Check for mobile view
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    // Asegurar que el scroll funcione en el dispositivo móvil
                    document.body.style.overflow = 'auto';
                    document.documentElement.style.overflow = 'auto';
                    document.body.style.position = 'static';
                    document.documentElement.style.position = 'static';
                    document.body.style.height = 'auto';
                    document.documentElement.style.height = 'auto';
                    document.body.style.webkitOverflowScrolling = 'touch';
                    
                    // On mobile, properly redirect to login
                    const loginForm = document.getElementById("loginForm");
                    const welcomeContainer = document.getElementById("welcomeContainer");
                    const loginRight = document.querySelector('.login-right');
                    const registerForm = document.getElementById("registerForm");
                    
                    // Make sure login form is visible
                    if (loginForm) loginForm.style.display = 'block';
                    if (welcomeContainer) welcomeContainer.style.display = 'block';
                    if (loginRight) {
                        loginRight.style.display = 'none';
                    }
                    if (registerForm) {
                        registerForm.classList.remove('mobile-visible');
                    }
                    
                    // Show success message
                    const successMessage = document.getElementById('successMessage');
                    if (successMessage) {
                        successMessage.textContent = "Registro exitoso. Por favor inicie sesión.";
                        successMessage.style.display = 'block';
                        successMessage.style.backgroundColor = "#d4edda";
                        successMessage.style.color = "#155724";
                        successMessage.style.padding = "10px";
                        successMessage.style.borderRadius = "4px";
                        successMessage.style.marginBottom = "15px";
                        
                        // Ocultar el mensaje después de 5 segundos
                        setTimeout(() => {
                            successMessage.style.display = 'none';
                        }, 5000);
                    }
                    
                    // Update URL
                    history.push("/login");
                    return true;
                }
                
                // On desktop, use animation
                const registerForm = document.getElementById("registerForm");
                const loginForm = document.getElementById("loginForm");
                const welcomeContainer = document.getElementById("welcomeContainer");
                
                if (registerForm && loginForm && welcomeContainer) {
                    // Animación de salida del formulario de registro
                    registerForm.classList.remove('slide-in-right');
                    registerForm.classList.add('slide-out-right');
                    
                    setTimeout(() => {
                        registerForm.style.display = 'none';
                        loginForm.style.display = 'block';
                        welcomeContainer.style.display = 'block';
                        
                        // Animación de entrada del formulario de login
                        loginForm.classList.remove('slide-out-left');
                        welcomeContainer.classList.remove('fade-out');
                        loginForm.classList.add('slide-in-left');
                        
                        // Actualizar la URL a /login usando history para asegurar que React Router también lo reconozca
                        history.push("/login");
                        
                        // Mostrar mensaje de éxito en el formulario de login
                        const successMessage = document.getElementById('successMessage');
                        if (successMessage) {
                            successMessage.textContent = "Registro exitoso. Por favor inicie sesión.";
                            successMessage.style.display = 'block';
                            successMessage.style.backgroundColor = "#d4edda";
                            successMessage.style.color = "#155724";
                            successMessage.style.padding = "10px";
                            successMessage.style.borderRadius = "4px";
                            successMessage.style.marginBottom = "15px";
                            
                            // Ocultar el mensaje después de 5 segundos
                            setTimeout(() => {
                                successMessage.style.display = 'none';
                            }, 5000);
                        }
                    }, 300);
                    
                    return true;
                }
                
                // Clear the error message if it exists
                const errorDiv = document.getElementById('registrationErrors');
                if (errorDiv) errorDiv.innerHTML = '';
            } else {
                console.log(response.status);
                console.log("Server response:", data);
                
                // Format error messages if they exist
                let errorMessage = data.detail || `Ocurrió un error: ${response.status}`;
                
                // Check if we have field-specific errors
                if (typeof data === 'object' && Object.keys(data).length > 0) {
                    // Get error messages without field prefixes
                    const errorMessages = [];
                    Object.keys(data).forEach(key => {
                        if (Array.isArray(data[key])) {
                            // Remove field names from error messages and translate common errors
                            data[key].forEach(msg => {
                                // Translate known error messages to Spanish
                                if (msg === "A user with that username already exists.") {
                                    msg = "Ya existe un usuario con ese nombre de usuario.";
                                }
                                errorMessages.push(msg);
                            });
                        }
                    });
                    
                    if (errorMessages.length > 0) {
                        errorMessage = errorMessages.join('\n');
                    }
                }
                
                swal.fire({
                    title: "Error de registro",
                    text: errorMessage,
                    icon: "error",
                    toast: true,
                    timer: 6000,
                    position: 'top-right',
                    timerProgressBar: true,
                    showConfirmButton: false,
                    background: '#ffe6e6', // Color pastel para error
                    iconColor: '#ff6666',
                    color: '#333333',
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            swal.fire({
                title: "Error de conexión",
                text: "No se puede conectar al servidor. Inténtalo más tarde.",
                icon: "error",
                toast: true,
                timer: 6000,
                position: 'top-right',
                timerProgressBar: true,
                showConfirmButton: false,
                background: '#ffcccc',
                iconColor: '#ff3333',
                color: '#333333',
            });
        }
    };

    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem("authTokens");
        localStorage.removeItem("tempUserPassword");
        history.push("/login");
        swal.fire({
            title: "Has cerrado sesión...",
            icon: "success",
            toast: true,
            timer: 6000,
            position: 'top-right',
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#d4edda',
            iconColor: '#28a745',
            color: '#333333',
        });
    }, [history, setAuthTokens, setUser, setUserProfile]);

    // Use useRef to store function reference to break the circular dependency
    const refreshUserTokenRef = useRef(null);

    const fetchUserProfile = useCallback(async (token = null) => {
        // Use provided token or get it from authTokens
        const authToken = token || authTokens?.auth_token;
        
        if (!authToken) {
            console.log("No auth token available for fetching user profile");
            return;
        }
        
        try {
            console.log("Fetching user profile data with auth token...");
            const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${authToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("User profile API response:", data);
                if (data && data.results && data.results.length > 0) {
                    setUserProfile(data.results[0]);
                    console.log("User profile loaded successfully:", data.results[0]);
                } else {
                    console.log("No user profile data available in the response");
                }
            } else {
                console.error("Failed to fetch user profile:", response.status);
                // Error details
                const errorData = await response.json().catch(e => ({ message: "No error details" }));
                console.error("Error details:", errorData);
                
                // If using token from stored tokens fails, try refreshing it
                if (!token && authTokens?.username) {
                    // Use the ref function instead of the direct function
                    if (refreshUserTokenRef.current) {
                        await refreshUserTokenRef.current();
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    }, [authTokens]);

    // Token refresh function
    const refreshUserToken = useCallback(async () => {
        // Only attempt if we have a user
        if (!user || !user.username) return;
        
        try {
            console.log("Attempting to refresh auth token...");
            // Try to get stored password or prompt user to re-enter if needed
            const password = localStorage.getItem("tempUserPassword");
            
            if (!password) {
                console.log("No stored password, cannot refresh token automatically");
                // Mostrar diálogo al usuario para que inicie sesión nuevamente
                swal.fire({
                    title: "Sesión expirada",
                    text: "Por seguridad, inicie sesión nuevamente.",
                    icon: "warning",
                    confirmButtonText: "Ir a iniciar sesión",
                    confirmButtonColor: "#3085d6",
                }).then((result) => {
                    if (result.isConfirmed) {
                        logoutUser();
                    }
                });
                return;
            }
            
            const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: user.username,
                    password: password
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log("New auth token received");
                
                // Update the tokens
                const newTokens = {
                    ...authTokens,
                    auth_token: data.auth_token
                };
                
                // Update user data as well
                const userData = {
                    username: user.username,
                    auth_token: data.auth_token
                };
                
                setUser(userData);
                setAuthTokens(newTokens);
                localStorage.setItem("authTokens", JSON.stringify(newTokens));
                
                // Try fetching the profile again with the new token
                await fetchUserProfile(data.auth_token);
            } else {
                console.error("Failed to refresh token:", response.status);
                // Si falla la actualización del token, lo mejor es cerrar sesión
                logoutUser();
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
            logoutUser();
        }
    }, [authTokens, user, fetchUserProfile, logoutUser]);

    // Update the ref whenever refreshUserToken changes
    useEffect(() => {
        refreshUserTokenRef.current = refreshUserToken;
    }, [refreshUserToken]);

    const contextData = {
        user, 
        setUser,
        userProfile,
        setUserProfile,
        authTokens,
        setAuthTokens,
        registerUser,
        loginUser,
        logoutUser,
        fetchUserProfile
    };

    useEffect(() => {
        if (authTokens) {
            // Con token simple, solo necesitamos crear un objeto de usuario con información básica
            const userData = {
                username: authTokens.username || "usuario", // Usa username si está disponible
                auth_token: authTokens.auth_token
            };
            setUser(userData);
            
            // Check if we have auth_token for user profile
            if (authTokens.auth_token) {
                fetchUserProfile(authTokens.auth_token);
            }
        }
        setLoading(false);
    }, [authTokens, fetchUserProfile]);

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};
