import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { formatearMoneda } from '../utils/formatters';
import { trabajoService } from '../services/trabajoService';
import DocumentoServicio from './DocumentoServicio';
import ModalInformeIA from './ModalInformeIA';

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--bg-primary, #1e293b)',
    borderColor: state.isFocused ? 'var(--accent-primary, #3b82f6)' : 'var(--border-color, #334155)',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
    padding: '0.15rem',
    borderRadius: 'var(--radius-md, 0.375rem)',
    '&:hover': {
      borderColor: 'var(--accent-primary, #3b82f6)'
    }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--bg-surface, #0f172a)',
    border: '1px solid var(--border-color, #334155)',
    zIndex: 100
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--accent-primary, #3b82f6)'
      : state.isFocused
      ? 'rgba(59, 130, 246, 0.1)'
      : 'transparent',
    color: state.isDisabled ? '#ef4444' : 'var(--text-primary, #f8fafc)',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    fontStyle: state.isDisabled ? 'italic' : 'normal',
    '&:active': {
      backgroundColor: state.isDisabled ? 'transparent' : 'var(--accent-primary, #3b82f6)'
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--text-primary, #f8fafc)'
  }),
  input: (base) => ({
    ...base,
    color: 'var(--text-primary, #f8fafc)'
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--text-muted, #94a3b8)'
  })
};

const COLUMNAS_ESTADOS = [
  { id: 'PENDIENTE', titulo: 'Pendiente' },
  { id: 'EN_REVISION', titulo: 'En Revisión' },
  { id: 'ESPERANDO_REPUESTO', titulo: 'Esperando Repuesto' },
  { id: 'FINALIZADO', titulo: 'Finalizado / Listo' },
  { id: 'ENTREGADO', titulo: 'Entregado' }
];

const ModalDetalleTrabajo = ({ trabajo, isOpen, onClose, onUpdate }) => {
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

  const handleEstadoChange = async (e) => {
    const nuevoEstado = e.target.value;
    try {
      await trabajoService.actualizarEstado(trabajo.idTrabajo, nuevoEstado);
      toast.success('Estado actualizado correctamente');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el estado');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Detalles del Trabajo #{trabajo.idTrabajo}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem 2rem', overflowY: 'auto', flexGrow: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Columna Izquierda */}
            <div>
              <h3 className="section-title">Información del Cliente</h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nombre:</span>
                <div style={{ fontWeight: '500' }}>{trabajo.cliente?.nombre || 'Sin registrar'}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Canal de Contacto:</span>
                <div>{trabajo.plataforma || 'Local (Presencial)'}</div>
              </div>
              {trabajo.cliente && (trabajo.cliente.whatsapp || trabajo.cliente.instagram) && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Contacto:</span>
                  <div>{trabajo.cliente.whatsapp || trabajo.cliente.instagram}</div>
                </div>
              )}
              
              <h3 className="section-title" style={{ marginTop: '2rem' }}>Detalles del Equipo</h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Equipo:</span>
                <div style={{ fontWeight: '500' }}>{trabajo.equipo}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Modelo:</span>
                <div>{trabajo.modelo || 'Generico'}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Falla / Servicio:</span>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '0.375rem', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                  {trabajo.servicio}
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div>
              <h3 className="section-title">Estado y Acciones</h3>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Cambiar Estado:</label>
                <div style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                  <Select
                    options={COLUMNAS_ESTADOS.map(est => ({ value: est.id, label: est.titulo }))}
                    styles={customSelectStyles}
                    value={COLUMNAS_ESTADOS.map(est => ({ value: est.id, label: est.titulo })).find(op => op.value === trabajo.estado) || null}
                    onChange={(selected) => handleEstadoChange({ target: { value: selected.value } })}
                    isDisabled={trabajo.estado === 'ENTREGADO'}
                    isSearchable={false}
                  />
                </div>
                {trabajo.estado === 'ENTREGADO' && (
                  <small style={{ color: 'var(--text-muted)' }}>El trabajo ya fue entregado y no puede modificarse.</small>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <button className="btn-secondary" onClick={() => triggerPrint('INGRESO')} style={{ flex: 1, padding: '0.5rem' }}>
                  📥 Imprimir Ingreso
                </button>
                <button className="btn-secondary" onClick={() => triggerPrint('ENTREGA')} style={{ flex: 1, padding: '0.5rem' }}>
                  📤 Informe (IA)
                </button>
              </div>

              <h3 className="section-title">Finanzas y Repuestos</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Costo Insumos:</span>
                <span style={{ color: 'var(--accent-danger)' }}>{formatearMoneda(trabajo.costoInsumos || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Abono Inicial:</span>
                <span style={{ color: 'var(--accent-success)' }}>{formatearMoneda(trabajo.abono || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600 }}>Precio Total:</span>
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatearMoneda(trabajo.precioTotal || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Restante por cobrar:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-warning)', fontSize: '1.2rem' }}>
                  {formatearMoneda(Math.max(0, (trabajo.precioTotal || 0) - (trabajo.abono || 0)))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ flexShrink: 0, backgroundColor: '#0f172a' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
        
        {/* Hidden Components for Printing */}
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
