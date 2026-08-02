import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { formatearMoneda } from '../utils/formatters';
import { trabajoService } from '../services/trabajoService';
import { useTheme } from '../context/ThemeContext';
import DocumentoServicio from './DocumentoServicio';
import ModalInformeIA from './ModalInformeIA';
import { Printer, Sparkles, X } from 'lucide-react';

const COLUMNAS_ESTADOS = [
  { id: 'PENDIENTE', titulo: 'Pendiente' },
  { id: 'EN_REVISION', titulo: 'En Revisión' },
  { id: 'ESPERANDO_REPUESTO', titulo: 'Esperando Repuesto' },
  { id: 'FINALIZADO', titulo: 'Finalizado / Listo' },
  { id: 'ENTREGADO', titulo: 'Entregado' }
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

const ModalDetalleTrabajo = ({ trabajo, isOpen, onClose, onUpdate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen || !trabajo) return null;

  const printComponentRef = useRef();
  const [printData, setPrintData] = useState({ trabajo: null, tipoDoc: 'INGRESO' });
  const [isPrinting, setIsPrinting] = useState(false);
  const [modalIAOpen, setModalIAOpen] = useState(false);
  const [trabajoIA, setTrabajoIA] = useState(null);

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `Documento_TecnoAlbert_${trabajo.idTrabajo}`,
    onAfterPrint: () => {
      setPrintData({ trabajo: null, tipoDoc: 'INGRESO' });
      toast.success('Documento generado correctamente');
    },
    onPrintError: (error) => {
      console.error('Error al imprimir:', error);
      toast.error('Error al abrir la ventana de impresión');
    }
  });

  useEffect(() => {
    if (isPrinting && printData.trabajo && printComponentRef.current) {
      handlePrint();
      setIsPrinting(false);
    }
  }, [isPrinting, printData, handlePrint]);

  const triggerPrint = (tipo) => {
    if (tipo === 'ENTREGA') {
      setTrabajoIA(trabajo);
      setModalIAOpen(true);
    } else {
      setPrintData({ trabajo, tipoDoc: tipo });
      setIsPrinting(true);
    }
  };

  const handleEstadoChange = async (selectedOption) => {
    const nuevoEstado = selectedOption.value;
    try {
      await trabajoService.actualizarEstado(trabajo.idTrabajo, nuevoEstado);
      toast.success('Estado actualizado correctamente');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el estado');
    }
  };

  const selectStyles = getSelectStyles(isDark);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Detalles del Trabajo #{trabajo.idTrabajo}</h2>
          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Columna Izquierda */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-sky-500">Información del Cliente</h3>
              
              <div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Nombre:</span>
                <div className="font-bold text-lg text-slate-900 dark:text-white">{trabajo.cliente?.nombre || 'Sin registrar'}</div>
              </div>
              
              <div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Canal de Contacto:</span>
                <div className="text-base font-semibold text-slate-800 dark:text-slate-200">{trabajo.plataforma || 'Local (Presencial)'}</div>
              </div>

              {trabajo.cliente && (trabajo.cliente.whatsapp || trabajo.cliente.instagram) && (
                <div>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Contacto:</span>
                  <div className="text-base font-bold text-sky-500">{trabajo.cliente.whatsapp || trabajo.cliente.instagram}</div>
                </div>
              )}
              
              <h3 className="text-base font-extrabold uppercase tracking-wider text-sky-500 pt-4">Detalles del Equipo</h3>
              
              <div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Equipo:</span>
                <div className="font-bold text-lg text-slate-900 dark:text-white">{trabajo.equipo}</div>
              </div>
              
              <div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Modelo:</span>
                <div className="text-base font-semibold text-slate-800 dark:text-slate-200">{trabajo.modelo || 'Generico'}</div>
              </div>
              
              <div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Falla / Servicio:</span>
                <div className="p-4 rounded-xl border mt-1 text-base font-medium bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                  {trabajo.servicio}
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-sky-500">Estado y Acciones</h3>
              
              <div>
                <label className="block text-sm font-bold mb-1 text-slate-500 dark:text-slate-400">
                  Cambiar Estado:
                </label>
                <Select
                  options={COLUMNAS_ESTADOS.map(est => ({ value: est.id, label: est.titulo }))}
                  styles={selectStyles}
                  value={COLUMNAS_ESTADOS.map(est => ({ value: est.id, label: est.titulo })).find(op => op.value === trabajo.estado) || null}
                  onChange={handleEstadoChange}
                  isDisabled={trabajo.estado === 'ENTREGADO'}
                  isSearchable={false}
                />
                {trabajo.estado === 'ENTREGADO' && (
                  <p className="text-sm font-bold text-amber-500 mt-1">El trabajo ya fue entregado y no puede modificarse.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                  onClick={() => triggerPrint('INGRESO')}
                >
                  <Printer size={18} />
                  Imprimir Ingreso
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition cursor-pointer"
                  onClick={() => triggerPrint('ENTREGA')}
                >
                  <Sparkles size={18} />
                  Informe (IA)
                </button>
              </div>

              <h3 className="text-base font-extrabold uppercase tracking-wider text-sky-500 pt-4">Finanzas y Repuestos</h3>
              
              <div className="space-y-3 text-base">
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Costo Insumos:</span>
                  <span className="font-bold text-rose-500">{formatearMoneda(trabajo.costoInsumos || 0)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Abono Inicial:</span>
                  <span className="font-bold text-emerald-500">{formatearMoneda(trabajo.abono || 0)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-bold text-slate-900 dark:text-white">Precio Total:</span>
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white">{formatearMoneda(trabajo.precioTotal || 0)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border flex justify-between items-center bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <span className="font-bold text-base text-slate-900 dark:text-white">Restante por cobrar:</span>
                <span className="font-extrabold text-xl text-amber-500">
                  {formatearMoneda(Math.max(0, (trabajo.precioTotal || 0) - (trabajo.abono || 0)))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <button 
            type="button" 
            className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
        
        {/* Componentes Ocultos de Impresión / IA */}
        <DocumentoServicio 
          ref={printComponentRef} 
          trabajo={printData.trabajo} 
          tipoDoc={printData.tipoDoc} 
        />
        
        <ModalInformeIA 
          isOpen={modalIAOpen}
          onClose={() => setModalIAOpen(false)}
          trabajo={trabajoIA}
        />
      </div>
    </div>
  );
};

export default ModalDetalleTrabajo;
