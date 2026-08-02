import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ventaService } from '../services/ventaService';
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

const ModalNuevaVenta = ({ isOpen, onClose, onVentaExitosa }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(false);
  const [datosVenta, setDatosVenta] = useState({
    detalle: '',
    precioVenta: '',
    costoAsociado: '',
    metodoPago: 'Efectivo',
    canal: 'Local'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!datosVenta.detalle) {
      toast.error('El concepto es obligatorio');
      return;
    }
    if (!datosVenta.precioVenta) {
      toast.error('El precio de venta es obligatorio');
      return;
    }

    setLoading(true);
    try {
      await ventaService.registrarVentaManual(datosVenta);
      toast.success('Venta registrada exitosamente');
      onVentaExitosa();
      setDatosVenta({
        detalle: '',
        precioVenta: '',
        costoAsociado: '',
        metodoPago: 'Efectivo',
        canal: 'Local'
      });
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
            Registrar Nueva Venta (Accesorio/Rápida)
          </h2>
          <button type="button" className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">
              Concepto / Detalle
            </label>
            <input
              type="text"
              placeholder="Ej. Mouse inalámbrico Logitech, Cable HDMI"
              value={datosVenta.detalle}
              onChange={(e) => setDatosVenta({ ...datosVenta, detalle: e.target.value })}
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">
                Costo Asociado
              </label>
              <InputMoneda
                value={datosVenta.costoAsociado}
                onChange={(val) => setDatosVenta({ ...datosVenta, costoAsociado: val })}
                disabled={loading}
                placeholder="Costo (Opcional)"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">
                Precio de Venta
              </label>
              <InputMoneda
                value={datosVenta.precioVenta}
                onChange={(val) => setDatosVenta({ ...datosVenta, precioVenta: val })}
                required={true}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">
                Canal de Venta
              </label>
              <input
                type="text"
                value={datosVenta.canal}
                onChange={(e) => setDatosVenta({ ...datosVenta, canal: e.target.value })}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500"
              />
            </div>
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
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-base font-bold transition shadow-md shadow-sky-500/20 cursor-pointer flex items-center justify-center min-w-[140px]"
            >
              {loading ? <Spinner size="small" /> : 'Guardar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevaVenta;
