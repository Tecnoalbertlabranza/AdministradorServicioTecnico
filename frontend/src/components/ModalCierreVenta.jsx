import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { equipoVentaService } from '../services/equipoVentaService';
import { useTheme } from '../context/ThemeContext';
import InputMoneda from './InputMoneda';
import Spinner from './Spinner';
import Select from 'react-select';
import { X } from 'lucide-react';

const opcionesPago = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Transferencia', label: 'Transferencia' },
  { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
  { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' }
];

const getSelectStyles = (isDark) => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: state.isFocused ? '#0284c7' : isDark ? '#334155' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(2, 132, 199, 0.2)' : 'none',
    padding: '0.25rem',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    color: isDark ? '#f8fafc' : '#0f172a',
    '&:hover': {
      borderColor: '#0284c7'
    }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '0.75rem',
    boxShadow: isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 100
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#0284c7'
      : state.isFocused
      ? isDark ? 'rgba(2, 132, 199, 0.2)' : '#f1f5f9'
      : 'transparent',
    color: state.isDisabled ? '#ef4444' : isDark ? '#f8fafc' : '#0f172a',
    fontSize: '0.95rem',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer'
  }),
  singleValue: (base) => ({
    ...base,
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: '0.95rem'
  }),
  input: (base) => ({
    ...base,
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: '0.95rem'
  }),
  placeholder: (base) => ({
    ...base,
    color: isDark ? '#64748b' : '#94a3b8',
    fontSize: '0.95rem'
  })
});

const ModalCierreVenta = ({ isOpen, onClose, equipo, onVentaExitosa }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  const selectStyles = getSelectStyles(isDark);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Confirmar Venta: {equipo.titulo}
          </h2>
          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">
              Precio Final de Venta
            </label>
            <InputMoneda
              value={datosVenta.precioVenta}
              onChange={(val) => setDatosVenta({ ...datosVenta, precioVenta: val })}
              required={true}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">
              Método de Pago
            </label>
            <Select
              options={opcionesPago}
              value={opcionesPago.find(opt => opt.value === datosVenta.metodoPago)}
              onChange={(selected) => setDatosVenta({ ...datosVenta, metodoPago: selected.value })}
              isDisabled={loading}
              isSearchable={false}
              styles={selectStyles}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-base font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center min-w-[160px]"
            >
              {loading ? <Spinner size="small" /> : 'Confirmar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCierreVenta;
