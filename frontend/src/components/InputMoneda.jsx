import { useState, useEffect } from 'react';

const InputMoneda = ({ value, onChange, placeholder, required, disabled }) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      setDisplayValue(formatearDisplay(value.toString()));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const formatearDisplay = (val) => {
    const numeros = val.replace(/\D/g, '');
    if (!numeros) return '';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(parseInt(numeros, 10));
  };

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const numeros = rawValue.replace(/\D/g, '');
    
    if (!numeros) {
      setDisplayValue('');
      onChange('');
      return;
    }

    setDisplayValue(formatearDisplay(numeros));
    onChange(parseInt(numeros, 10));
  };

  return (
    <input
      type="text"
      placeholder={placeholder || "$ 0"}
      required={required}
      disabled={disabled}
      value={displayValue}
      onChange={handleChange}
      style={disabled ? { opacity: 0.5, cursor: 'not-allowed', width: '100%' } : { width: '100%' }}
    />
  );
};

export default InputMoneda;
