import React, { useContext, useState, useEffect } from 'react'
import AuthContext from '../context/AuthContext'
import PasswordField from '../components/PasswordField'
import '../styles/login.css'

function Loginpage() {
  const { loginUser, registerUser } = useContext(AuthContext)
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    role: 'Doctor(a)',
    email: '',
    password1: '',
    password2: ''
  })

  // Check if the current path is '/register' and show register form automatically
  useEffect(() => {
    if (window.location.pathname === '/register') {
      showRegister();
    }

    // Add listener for window resize events to handle responsive layout changes
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const loginRight = document.querySelector('.login-right');
      
      if (window.location.pathname === '/register' && isMobile) {
        loginRight.style.display = 'block';
      } else if (window.location.pathname === '/login' && isMobile) {
        loginRight.style.display = 'none';
      }
    };
    
    // Call once to set initial state
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Add listener for browser navigation events (back/forward buttons)
    const handlePopState = () => {
      const isMobile = window.innerWidth <= 768;
      const loginForm = document.getElementById('loginForm');
      const registerForm = document.getElementById('registerForm');
      const welcomeContainer = document.getElementById('welcomeContainer');
      const loginRight = document.querySelector('.login-right');
      
      if (window.location.pathname === '/register') {
        // Show register form without animation if navigated via browser controls
        if (loginForm && registerForm && welcomeContainer) {
          registerForm.style.display = 'block';
          loginForm.style.display = 'none';
          welcomeContainer.style.display = 'none';
          
          if (isMobile && loginRight) {
            loginRight.style.display = 'block';
            registerForm.classList.add('mobile-visible');
          }
        }
      } else if (window.location.pathname === '/login') {
        // Show login form without animation if navigated via browser controls
        if (loginForm && registerForm && welcomeContainer) {
          registerForm.style.display = 'none';
          loginForm.style.display = 'block';
          welcomeContainer.style.display = 'block';
          
          if (isMobile && loginRight) {
            loginRight.style.display = 'none';
            registerForm.classList.remove('mobile-visible');
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const showRegister = () => {
    const loginForm = document.getElementById('loginForm')
    const registerForm = document.getElementById('registerForm')
    const welcomeContainer = document.getElementById('welcomeContainer')
    const loginRight = document.querySelector('.login-right')
    const isMobile = window.innerWidth <= 768

    // Clear any existing animation classes
    registerForm.classList.remove('slide-out-right')
    loginForm.classList.remove('slide-in-left')

    // Handle mobile view differently
    if (isMobile) {
      loginRight.style.display = 'block'
      loginRight.style.position = 'absolute'
      loginRight.style.overflow = 'auto'
      loginRight.style.height = 'auto'
      loginRight.style.minHeight = '100vh'
      registerForm.classList.add('mobile-visible')
      
      // Asegurar que la página principal permite scroll
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
      document.body.style.height = 'auto'
      document.documentElement.style.height = 'auto'
      document.body.style.position = 'static'
      document.documentElement.style.position = 'static'
      document.body.style.webkitOverflowScrolling = 'touch'
      
      // Scroll hasta el inicio del formulario después de mostrarlo
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 100)
    } else {
      // Desktop behavior
      // Apply animation classes
      loginForm.classList.add('slide-out-left')
      welcomeContainer.classList.add('fade-out')
    }

    setTimeout(() => {
      loginForm.style.display = 'none'
      welcomeContainer.style.display = 'none'
      registerForm.style.display = 'block'
      
      if (!isMobile) {
        registerForm.classList.add('slide-in-right')
      }

      // Change the URL to /register without full page reload
      window.history.pushState({}, '', '/register')
    }, 300)
  }

  const showLogin = () => {
    const loginForm = document.getElementById('loginForm')
    const registerForm = document.getElementById('registerForm')
    const welcomeContainer = document.getElementById('welcomeContainer')
    const loginRight = document.querySelector('.login-right')
    const isMobile = window.innerWidth <= 768

    // Handle mobile view differently
    if (isMobile) {
      // For mobile, simply hide the right side
      loginRight.style.display = 'none'
      registerForm.classList.remove('mobile-visible')
    } else {
      // Desktop behavior
      // Remove previous animation class
      registerForm.classList.remove('slide-in-right')
      // Add exit animation
      registerForm.classList.add('slide-out-right')
    }

    setTimeout(() => {
      registerForm.style.display = 'none'
      loginForm.style.display = 'block'
      welcomeContainer.style.display = 'block'

      if (!isMobile) {
        // Reset animation classes for login form (desktop only)
        loginForm.classList.remove('slide-out-left')
        welcomeContainer.classList.remove('fade-out')
        loginForm.classList.add('slide-in-left')
      }

      // Change the URL to /login without full page reload
      window.history.pushState({}, '', '/login')
    }, 300)
  }

  // Form state for login
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    passwordVisible: false
  });

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = e => {
    e.preventDefault()
    const { username, password } = loginForm

    if (username.length > 0) {
      // Temporarily store password for token refresh (will be cleared on logout)
      localStorage.setItem("tempUserPassword", password);
      loginUser(username, password)
    }
  }

  const handleRegisterChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

    // Verificar si las contraseñas coinciden
    if (e.target.name === 'password1' || e.target.name === 'password2') {
      const password1 = e.target.name === 'password1' ? e.target.value : formData.password1
      const password2 = e.target.name === 'password2' ? e.target.value : formData.password2

      if (password1 && password2) {
        setPasswordMatch(password1 === password2)
      }
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()

    if (!passwordMatch) {
      const errorDiv = document.getElementById('registrationErrors')
      errorDiv.innerHTML = '<p style="color: red;">Las contraseñas no coinciden</p>'
      return
    }

    const { nombre, apellido, username, role, email, password1, password2 } = formData

    if (!nombre || !apellido || !username || !role || !email || !password1 || !password2) {
      const errorDiv = document.getElementById('registrationErrors')
      errorDiv.innerHTML = '<p style="color: red;">Por favor, complete todos los campos</p>'
      return
    }

    // Registrar usuario y quedarse en la misma página hasta recibir respuesta
    const errorDiv = document.getElementById('registrationErrors')
    // Clear any previous error messages
    errorDiv.innerHTML = '';
    
    // Store the register button reference
    const registerButton = document.querySelector('#registrationForm button[type="submit"]')
    const originalText = registerButton.textContent
    registerButton.disabled = true
    
    // Call registerUser and handle the response
    const success = await registerUser(nombre, apellido, role, username, email, password1, password2)
    
    // If registration was successful, reset form data
    if (success) {
      setFormData({
        nombre: '',
        apellido: '',
        username: '',
        role: 'Doctor(a)',
        email: '',
        password1: '',
        password2: ''
      })
    }
    
    // Re-enable the button in case of error or if function doesn't reset it
    setTimeout(() => {
      if (registerButton.disabled) {
        registerButton.textContent = originalText
        registerButton.disabled = false
      }
    }, 10000) // 10 seconds maximum wait time
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="logo-container">
          <img src="/images/logo_foscal.png" alt="Logo" />
        </div>

        <div className="login-container" id="loginForm">
          <div className="welcome-container" id="welcomeContainer">
            <h1 className="welcome-title">Bienvenido(a)</h1>
            <p className="welcome-subtitle">Por favor inicie sesión en su cuenta completando este formulario:</p>
          </div>
          <div id="successMessage" className="success-message" style={{ display: 'none' }}></div>

          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <input
                type="text"
                id="username"
                name="username"
                placeholder=" "
                className="form-control"
                required
                value={loginForm.username}
                onChange={handleLoginChange}
              />
              <label htmlFor="username">Usuario</label>
            </div>

            <div className="form-group">
              <input
                type={loginForm.passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                placeholder=" "
                className="form-control"
                required
                value={loginForm.password}
                onChange={handleLoginChange}
                autoComplete="new-password"
              />
              <label htmlFor="password">Contraseña</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setLoginForm(prev => ({ ...prev, passwordVisible: !prev.passwordVisible }))}
                aria-label="Mostrar/ocultar contraseña"
              >
                {loginForm.passwordVisible ? (
                  <svg className="eye-icon hide" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                ) : (
                  <svg className="eye-icon show" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="form-actions">
              <div className="remember-container">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember">Recordar</label>
              </div>
              <button type="button" className="forgot-password">Olvidé Contraseña</button>
            </div>

            <div className="button-container">
              <button type="submit" className="login-button">Iniciar Sesión</button>
              <button type="button" className="register-button" onClick={showRegister}>
                Nuevo Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="login-right">
        <div className="registration-container" id="registerForm" style={{ display: 'none' }}>
          <div className="registration-header">
            <h2 className="registration-title">Crea una cuenta</h2>
            <p className="registration-subtitle">Es rápido y fácil</p>
            <div className="divider"></div>
          </div>

          <form id="registrationForm" className="registration-form" onSubmit={handleRegisterSubmit}>
            <div className="form-row name-row">
              <div className="form-field">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  required
                  value={formData.nombre}
                  onChange={handleRegisterChange}
                />
              </div>

              <div className="form-field">
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  required
                  value={formData.apellido}
                  onChange={handleRegisterChange}
                />
              </div>
            </div>

            <div className="form-field">
              <input
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                required
                value={formData.username}
                onChange={handleRegisterChange}
              />
            </div>

            <div className="form-field">
              <label className="role-label">Cargo</label>
              <div className="role-options">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="Doctor(a)"
                    className="role-radio"
                    checked={formData.role === "Doctor(a)"}
                    onChange={handleRegisterChange}
                  />
                  Doctor
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="Enfermero(a)"
                    className="role-radio"
                    checked={formData.role === "Enfermero(a)"}
                    onChange={handleRegisterChange}
                  />
                  Enfermero
                </label>
              </div>
            </div>

            <div className="form-field">
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                required
                value={formData.email}
                onChange={handleRegisterChange}
              />
            </div>

            <PasswordField
              name="password1"
              id="id_reg_password1"
              placeholder="Contraseña"
              required={true}
              value={formData.password1}
              onChange={handleRegisterChange}
              toggleButtonClass="password-toggle-register"
            />

            <PasswordField
              name="password2"
              id="id_reg_password2"
              placeholder="Confirmación contraseña"
              required={true}
              value={formData.password2}
              onChange={handleRegisterChange}
              error={!passwordMatch && formData.password2}
              errorMessage="Las contraseñas no coinciden"
              toggleButtonClass="password-toggle-register"
            />

            <div className="form-errors" id="registrationErrors"></div>

            <button type="submit" className="registration-button">
              Registrarte
            </button>

            <div className="login-link">
              <p>¿Ya tienes una cuenta? <button type="button" onClick={showLogin} className="login-button_register">Iniciar sesión</button></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Loginpage