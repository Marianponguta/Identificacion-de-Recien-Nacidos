import React, { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import '../styles/login.css'

function Registerpage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [cargo, setCargo] = useState("Doctor(a)")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [passwordVisible1, setPasswordVisible1] = useState(false)
  const [passwordVisible2, setPasswordVisible2] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [formErrors, setFormErrors] = useState("")
  
  const {registerUser} = useContext(AuthContext)
  
  const togglePassword1Visibility = () => {
    setPasswordVisible1(!passwordVisible1)
  }
  
  const togglePassword2Visibility = () => {
    setPasswordVisible2(!passwordVisible2)
  }
  
  const handlePassword2Change = (e) => {
    const value = e.target.value
    setPassword2(value)
    // Immediate validation for feedback
    if (password) {
      setPasswordsMatch(password === value)
    }
  }
  
  const handlePassword1Change = (e) => {
    const value = e.target.value
    setPassword(value)
    // Immediate validation for feedback
    if (password2) {
      setPasswordsMatch(value === password2)
    }
  }

  // Update passwordsMatch whenever either password field changes
  useEffect(() => {
    if (password && password2) {
      const matches = password === password2;
      setPasswordsMatch(matches);
    }
  }, [password, password2]);

  const handleSubmit = async e => {
    e.preventDefault()
    
    setFormErrors("")
    
    // Check if all required fields are filled
    if (!nombre || !apellido || !cargo || !username || !email || !password) {
      setFormErrors('Por favor complete todos los campos')
      return
    }
    
    // Validate nombre is not empty
    if (nombre.trim() === '') {
      setFormErrors('El nombre no puede estar vacío')
      return
    }
    
    // Validate apellido is not empty
    if (apellido.trim() === '') {
      setFormErrors('El apellido no puede estar vacío')
      return
    }
    
    if(password !== password2) {
      setFormErrors('Las contraseñas no coinciden')
      return
    }
    
    // Disable the register button to prevent multiple submissions
    const registerButton = document.querySelector('button[type="submit"]')
    const originalText = registerButton.textContent
    registerButton.disabled = true
    
    // Log the data being sent
    console.log("Sending registration data:", { nombre, apellido, cargo, username, email, password, password2 });
    
    // Call registerUser with all required fields in the correct order
    const success = await registerUser(nombre, apellido, cargo, username, email, password, password2)
    
    // If registration was successful, reset form fields
    if (success) {
      // Clear form data
      setNombre("")
      setApellido("")
      setUsername("")
      setEmail("")
      setPassword("")
      setPassword2("")
      setCargo("Doctor(a)")
      setPasswordVisible1(false)
      setPasswordVisible2(false)
    }
    
    // Restaurar el botón después de un tiempo (en caso de que falle y no reciba respuesta)
    setTimeout(() => {
      if (registerButton.disabled) {
        registerButton.innerHTML = originalText
        registerButton.disabled = false
      }
    }, 10000) // 10 segundos máximo de espera
  }


  return (
    <div className="login-page">
      <div className="login-left">
        <div className="logo-container">
          <img src="/images/logo_foscal.png" alt="Logo" />
        </div>
        
        <div className="welcome-container" style={{ 
          textAlign: 'left',
          marginBottom: '2rem',
          width: '100%',
          maxWidth: '460px',
          padding: '0'
        }}>
          <h1 className="welcome-title">Registro</h1>
          <p className="welcome-subtitle">Complete el formulario para crear una nueva cuenta:</p>
        </div>
        
        <div className="registration-container" style={{ display: 'block', margin: '0', maxWidth: '460px', padding: '0' }}>
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-row name-row">
              <div className="form-field">
                <input 
                  type="text" 
                  name="nombre" 
                  placeholder="Nombre" 
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              
              <div className="form-field">
                <input 
                  type="text" 
                  name="apellido" 
                  placeholder="Apellido" 
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-field">
              <input 
                type="text" 
                name="username" 
                placeholder="Nombre de usuario" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="form-field">
              <label className="role-label">Cargo</label>
              <div className="role-options">
                <label className="role-option">
                  <input 
                    type="radio" 
                    name="cargo" 
                    value="Doctor(a)" 
                    className="role-radio"
                    checked={cargo === "Doctor(a)"}
                    onChange={() => setCargo("Doctor(a)")}
                    required
                  />
                  Doctor(a)
                </label>
                <label className="role-option">
                  <input 
                    type="radio" 
                    name="cargo" 
                    value="Enfermero(a)" 
                    className="role-radio"
                    checked={cargo === "Enfermero(a)"}
                    onChange={() => setCargo("Enfermero(a)")}
                    required
                  />
                  Enfermero(a)
                </label>
              </div>
            </div>
            
            <div className="form-field">
              <input 
                type="email" 
                name="email" 
                placeholder="Correo electrónico" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="form-field">
              <input
                type={passwordVisible1 ? "text" : "password"}
                name="password1"
                id="password1"
                placeholder="Contraseña"
                required
                value={password}
                onChange={handlePassword1Change}
                className={password2 && !passwordsMatch ? "password-error" : ""}
              />
              <button
                type="button"
                className="password-toggle-register"
                onClick={togglePassword1Visibility}
                aria-label="Mostrar/ocultar contraseña"
              >
                {passwordVisible1 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                )}
              </button>
            </div>
            
            <div className="form-field">
              <input
                type={passwordVisible2 ? "text" : "password"}
                name="password2"
                id="password2"
                placeholder="Confirmación contraseña"
                required
                value={password2}
                onChange={handlePassword2Change}
                className={password2 && !passwordsMatch ? "password-error" : ""}
              />
              <button
                type="button"
                className="password-toggle-register"
                onClick={togglePassword2Visibility}
                aria-label="Mostrar/ocultar contraseña"
              >
                {passwordVisible2 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                )}
              </button>
            </div>
            
            {password2 && !passwordsMatch && (
              <div className="password-match-warning">
                ⚠️ Las contraseñas no coinciden
              </div>
            )}
            
            {formErrors && (
              <div 
                className="form-errors" 
                id="registrationErrors"
                style={{
                  color: '#ff3333',
                  backgroundColor: 'rgba(255, 51, 51, 0.1)',
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  fontSize: '14px'
                }}
              >
                {formErrors}
              </div>
            )}
            
            <button 
              type="submit" 
              className="registration-button"
              disabled={password2 && !passwordsMatch}
            >
              Registrarte
            </button>
            
            <div className="login-link">
              <p>¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link></p>
            </div>
          </form>
        </div>
      </div>
      <div className="login-right">
        {/* Área decorativa a la derecha */}
      </div>
    </div>
  )
}

export default Registerpage