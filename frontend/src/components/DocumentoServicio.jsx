import { forwardRef } from 'react';
import { formatearFecha, formatearMoneda } from '../utils/formatters';
import './DocumentoServicio.css';

const DocumentoServicio = forwardRef(({ trabajo, tipoDoc }, ref) => {
  if (!trabajo) return null;

  const esIngreso = tipoDoc === 'INGRESO';
  const fecha = esIngreso ? (trabajo.fechaIngreso || new Date()) : (trabajo.fechaActualizacion || new Date());
  
  const titulo = esIngreso 
    ? 'ORDEN DE INGRESO - Tecno Albert' 
    : 'INFORME TÉCNICO Y ENTREGA - Tecno Albert';

  const saldo = trabajo.precioTotal - trabajo.abono;

  let contactoPrincipal = null;
  if (trabajo.plataforma?.toLowerCase() === 'whatsapp' || trabajo.cliente?.whatsapp) {
    contactoPrincipal = `WhatsApp: ${trabajo.cliente?.whatsapp || 'No registrado'}`;
  } else if (trabajo.plataforma?.toLowerCase() === 'instagram' || trabajo.cliente?.instagram) {
    contactoPrincipal = `Instagram: ${trabajo.cliente?.instagram || 'No registrado'}`;
  } else if (trabajo.cliente?.whatsapp || trabajo.cliente?.instagram) {
    contactoPrincipal = trabajo.cliente.whatsapp ? `WhatsApp: ${trabajo.cliente.whatsapp}` : `Instagram: ${trabajo.cliente.instagram}`;
  }

  return (
    <div className="documento-servicio-container" ref={ref}>
      <div className="doc-header">
        <h1 className="doc-title">{titulo}</h1>
        <div className="doc-subtitle">
          {esIngreso ? 'Comprobante de recepción de equipo' : 'Detalle de servicios y garantía'}
        </div>
      </div>

      <div className="doc-section doc-grid">
        <div className="doc-field">
          <strong>Fecha:</strong> {formatearFecha(fecha)}
        </div>
        <div className="doc-field">
          <strong>Orden N°:</strong> {trabajo.idTrabajo}
        </div>
      </div>

      <div className="doc-section doc-section-box">
        <div className="doc-section-title">Datos del Cliente</div>
        <div className="doc-grid">
          <div className="doc-field">
            <strong>Nombre:</strong> {trabajo.cliente?.nombre || 'Sin registrar'}
          </div>
          {contactoPrincipal && (
            <div className="doc-field">
              <strong>Contacto:</strong> {contactoPrincipal}
            </div>
          )}
        </div>
      </div>

      <div className="doc-section doc-section-box">
        <div className="doc-section-title">Datos del Equipo</div>
        <div className="doc-grid">
          <div className="doc-field">
            <strong>Equipo:</strong> {trabajo.equipo}
          </div>
          <div className="doc-field">
            <strong>Modelo:</strong> {trabajo.modelo}
          </div>
        </div>
      </div>

      <div className="doc-section">
        <div className="doc-section-title">
          {esIngreso ? 'Problema Reportado' : 'Detalle Técnico de la Reparación'}
        </div>
        <div className="doc-text-box">
          {trabajo.servicio || 'Sin detalle especificado.'}
        </div>
      </div>

      <div className="doc-section">
        <div className="doc-section-title">Resumen de Cobros</div>
        <div className="doc-finances">
          {!esIngreso && (
            <div className="doc-finance-row">
              <span>Precio Total:</span>
              <span>{formatearMoneda(trabajo.precioTotal)}</span>
            </div>
          )}
          <div className="doc-finance-row">
            <span>Abono:</span>
            <span>{formatearMoneda(trabajo.abono)}</span>
          </div>
          {!esIngreso && (
            <div className="doc-finance-row total">
              <span>Saldo a Pagar:</span>
              <span>{formatearMoneda(saldo > 0 ? saldo : 0)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="doc-footer">
        {esIngreso ? (
          <p>
            <strong>Términos y Condiciones:</strong> El taller no se responsabiliza por pérdida de datos; se recomienda respaldar su información. Todo equipo reparado y no retirado en 30 días genera cargos de bodegaje.
          </p>
        ) : (
          <p>
            <strong>Garantía:</strong> Garantía de 30 días sobre el trabajo realizado detallado en este documento. No cubre daños por mal uso, golpes, líquidos o intervenciones de terceros posteriores a la entrega.
          </p>
        )}
      </div>
    </div>
  );
});

DocumentoServicio.displayName = 'DocumentoServicio';

export default DocumentoServicio;
