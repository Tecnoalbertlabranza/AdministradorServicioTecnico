import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { equipoVentaService } from '../services/equipoVentaService';
import InputMoneda from './InputMoneda';
import Spinner from './Spinner';

import Select from 'react-select';

const opcionesPago = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Transferencia', label: 'Transferencia' },
  { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
  { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' }
];

const ModalCierreVenta = ({ isOpen, onClose, equipo, onVentaExitosa }) => {
  const [loading, setLoading] = useState(false);
  const [datosVenta, setDatosVenta] = useState({
    precioVenta: '',
    metodoPago: 'Efectivo',
    canal: 'Local'
  });

  useEffect(() => {
    if (equipo) {
      setDatosVenta(prev => ({
        ...prev,
        precioVenta: equipo.precioVenta
      }));
    }
  }, [equipo]);

  if (!isOpen || !equipo) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!datosVenta.precioVenta) {
      toast.error('El precio de venta es obligatorio');
      return;
    }

    setLoading(true);
    try {
      await equipoVentaService.venderEquipo(equipo.id, datosVenta);
      toast.success('Venta registrada exitosamente');
      onVentaExitosa();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', padding: '2rem' }}>
        <div className="modal-header" style={{ alignItems: 'flex-start', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <h2 style={{ paddingRight: '2rem', fontSize: '1.25rem', lineHeight: '1.4' }}>Confirmar Venta: {equipo.titulo}</h2>
          <button className="close-btn" onClick={onClose} disabled={loading} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--text-secondary)' }}>Precio Final de Venta</label>
            <InputMoneda
              value={datosVenta.precioVenta}
              onChange={(val) => setDatosVenta({ ...datosVenta, precioVenta: val })}
              required={true}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--text-secondary)' }}>Método de Pago</label>
            <Select
              options={opcionesPago}
              value={opcionesPago.find(opt => opt.value === datosVenta.metodoPago)}
              onChange={(selected) => setDatosVenta({ ...datosVenta, metodoPago: selected.value })}
              isDisabled={loading}
              isSearchable={false}
              styles={{
                control: (base, state) => ({
                  ...base,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: state.isFocused ? '#10b981' : 'var(--border-color)',
                  color: 'white',
                  padding: '2px',
                  borderRadius: '6px',
                  boxShadow: state.isFocused ? '0 0 0 1px #10b981' : 'none',
                  '&:hover': {
                    borderColor: '#10b981'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: '#1f1f1f',
                  border: '1px solid var(--border-color)',
                  zIndex: 9999
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  '&:active': {
                    backgroundColor: '#10b981'
                  }
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'white'
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  color: 'var(--text-secondary)',
                  '&:hover': { color: 'white' }
                }),
                indicatorSeparator: () => ({ display: 'none' })
              }}
            />
          </div>

          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              style={{ 
                padding: '0.75rem 1.5rem', 
                borderRadius: '6px', 
                backgroundColor: 'transparent', 
                color: 'var(--text-secondary)', 
                border: '1px solid var(--border-color)', 
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ 
                backgroundColor: '#10b981', 
                color: 'white', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '6px', 
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '160px'
              }} 
              disabled={loading}
              onMouseOver={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#059669'; }}
              onMouseOut={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#10b981'; }}
            >
              {loading ? <Spinner /> : 'Confirmar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCierreVenta;
