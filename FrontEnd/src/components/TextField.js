import React from 'react';

/**
 * Reusable text field component 
 * 
 * @param {Object} props
 * @param {string} props.type - Input type (text, email, etc)
 * @param {string} props.name - Input name
 * @param {string} props.id - Input id
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Input onChange handler
 * @param {string} props.className - Additional class name for the input
 * @param {boolean} props.required - If the field is required
 * @param {string} props.label - Label text
 */
const TextField = ({ 
  type = 'text',
  name,
  id,
  placeholder,
  value = '',
  onChange,
  className = '',
  required = false,
  label,
  style = {},
}) => {
  return (    <div className={name === 'username' || name === 'email' || name === 'password' ? 'form-group' : 'form-field'} style={{ position: 'relative' }}>
      <input
        type={type}
        name={name}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className}
        required={required}
        style={style}
      />
      {(label || placeholder) && <label htmlFor={id}>{label || placeholder}</label>}
    </div>
  );
};

export default TextField;
