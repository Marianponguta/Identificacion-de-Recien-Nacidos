import React, { useState } from 'react';

/**
 * Reusable password field component with show/hide toggle
 * 
 * @param {Object} props
 * @param {string} props.name - Input name
 * @param {string} props.id - Input id
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Input onChange handler
 * @param {string} props.className - Additional class name for the input
 * @param {boolean} props.required - If the field is required
 * @param {boolean} props.error - If the field has an error
 * @param {string} props.errorMessage - Error message to display
 */
const PasswordField = ({ 
  name,
  id,
  placeholder,
  value = '',
  onChange,
  className = '',
  required = false,
  label,
  error = false,
  errorMessage = '',
  toggleButtonClass = 'password-toggle'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (    <div className={name === 'password' ? 'form-group' : 'form-field'} style={{ position: 'relative' }}>
      <input
        type={isVisible ? "text" : "password"}
        name={name}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${className} ${error ? 'password-error' : ''}`}
        required={required}
        autoComplete="new-password"
      />
      {label && <label htmlFor={id}>{label || placeholder}</label>}
      <button
        type="button"
        className={toggleButtonClass}
        onClick={toggleVisibility}
        aria-label="Mostrar/ocultar contraseña"
      >
        {isVisible ? (
          <svg
            className="eye-icon hide"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
          </svg>
        ) : (
          <svg
            className="eye-icon show"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
        )}
      </button>
      {error && errorMessage && (
        <small style={{ color: 'red', display: 'block', marginTop: '5px' }}>{errorMessage}</small>
      )}
    </div>
  );
};

export default PasswordField;
