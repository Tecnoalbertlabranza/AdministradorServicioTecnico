import { useState, useEffect } from 'react';

const InputMoneda = ({ value, onChange, placeholder, required, disabled, className = '' }) => {
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

  const defaultClasses = "w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <input
      type="text"
      placeholder={placeholder || "$ 0"}
      required={required}
      disabled={disabled}
      value={displayValue}
      onChange={handleChange}
      className={`${defaultClasses} ${className}`}
    />
  );
};

export default InputMoneda;
