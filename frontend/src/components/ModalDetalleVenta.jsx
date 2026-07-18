import React from 'react';
import { formatearMoneda, formatearFecha } from '../utils/formatters';

const ModalDetalleVenta = ({ isOpen, onClose, venta }) => {
  if (!isOpen || !venta) return null;

  const precioVenta = venta.precioVenta || 0;
  const costoAsociado = venta.costoAsociado || 0;
  const gananciaNeta = precioVenta - costoAsociado;

  return (
    <div className="modal-overlay flex items-center justify-center p-4" style={{ padding: '1rem' }}>
      <div 
        className="modal-content w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto" 
        style={{ padding: '1.5rem', margin: '0 auto', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header" style={{ alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          <h2 style={{ paddingRight: '2rem', fontSize: '1.25rem', lineHeight: '1.4', margin: 0 }}>
            Detalle de Transacción #{venta.id}
          </h2>
          <button type="button" className="close-btn" onClick={onClose} style={{ position: 'absolute', right: '0', top: '0' }}>×</button>
        </div>

        <div className="detalle-seccion" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Información General</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Fecha y Hora</span>
              <span style={{ color: 'white', fontWeight: '500' }}>{formatearFecha(venta.fechaVenta)}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tipo de Venta</span>
              <span style={{ 
                color: venta.tipoVenta === 'EQUIPO' ? '#3b82f6' : '#a855f7', 
                fontWeight: '600',
                backgroundColor: venta.tipoVenta === 'EQUIPO' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}>
                {venta.tipoVenta}
              </span>
            </div>

            <div className="sm:col-span-2" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Concepto / Detalle</span>
              <span style={{ color: 'white', fontWeight: '500' }}>{venta.detalle}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Método de Pago</span>
              <span style={{ color: 'white', fontWeight: '500' }}>{venta.metodoPago || 'No especificado'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Canal de Venta</span>
              <span style={{ color: 'white', fontWeight: '500' }}>{venta.canal || 'No especificado'}</span>
            </div>
          </div>
        </div>

        <div className="detalle-seccion">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resumen Financiero</h3>
          
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Precio Cobrado</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>{formatearMoneda(precioVenta)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Costo Asociado</span>
              <span style={{ color: 'var(--text-muted)' }}>- {formatearMoneda(costoAsociado)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>Ganancia Neta</span>
              <span style={{ 
                color: gananciaNeta >= 0 ? '#3b82f6' : '#ef4444', 
                fontWeight: '700', 
                fontSize: '1.25rem' 
              }}>
                {formatearMoneda(gananciaNeta)}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ 
              backgroundColor: 'transparent', 
              color: 'var(--text-secondary)', 
              padding: '0.5rem 1.5rem', 
              borderRadius: '6px', 
              fontWeight: '600',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleVenta;
