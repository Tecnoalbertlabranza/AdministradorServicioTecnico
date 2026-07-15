import { useState, useEffect } from 'react';
import { clienteService } from '../services/clienteService';
import './Clientes.css';
import './Inventario.css'; // Reutilizamos estilos modales y tablas

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#E1306C' }}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#25D366' }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el modal de historial
  const [selectedCliente, setSelectedCliente] = useState(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clienteService.obtenerTodos();
      // Ordenar por fecha de registro descendente
      data.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));
      setClientes(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los clientes');
      
      // Fallback a Mock Data si el backend está caído
      console.log("Usando mock data para Clientes...");
      setClientes([
        {
          idCliente: '1',
          nombre: 'Juan Pérez',
          whatsapp: '+56912345678',
          instagram: null,
          fechaRegistro: new Date().toISOString()
        },
        {
          idCliente: '2',
          nombre: 'María Gómez',
          whatsapp: null,
          instagram: 'mariag.tech',
          fechaRegistro: new Date(Date.now() - 86400000).toISOString()
        },
        {
          idCliente: '3',
          nombre: 'Pedro Soto',
          whatsapp: '+56998765432',
          instagram: 'psoto99',
          fechaRegistro: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerPedidos = (cliente) => {
    setSelectedCliente(cliente);
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
  };

  const getContactInfo = (cliente) => {
    const contacts = [];
    if (cliente.whatsapp) {
      contacts.push(
        <div key="wa" className="contact-cell">
          <span className="contact-icon"><IconWhatsApp /></span>
          <span>{cliente.whatsapp}</span>
        </div>
      );
    }
    if (cliente.instagram) {
      contacts.push(
        <div key="ig" className="contact-cell">
          <span className="contact-icon"><IconInstagram /></span>
          <span>@{cliente.instagram}</span>
        </div>
      );
    }
    
    if (contacts.length === 0) return <span style={{ color: 'var(--text-muted)' }}>Sin contacto</span>;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {contacts}
      </div>
    );
  };

  const getChannelBadge = (cliente) => {
    if (cliente.whatsapp && cliente.instagram) {
      return <span className="channel-badge channel-multi">Multicanal</span>;
    }
    if (cliente.whatsapp) {
      return <span className="channel-badge channel-whatsapp">WhatsApp</span>;
    }
    if (cliente.instagram) {
      return <span className="channel-badge channel-instagram">Instagram</span>;
    }
    return <span className="channel-badge" style={{ backgroundColor: 'transparent', color: 'var(--text-muted)' }}>Desconocido</span>;
  };

  return (
    <div className="dashboard-container">
      <div className="clientes-header">
        <h1 className="clientes-title">Directorio de Clientes</h1>
      </div>

      <div className="data-section">
        <div className="data-section-header">
          <h2 className="data-section-title">Clientes Registrados</h2>
          <button 
            onClick={cargarClientes} 
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {loading ? '↻ Cargando...' : '↻ Refrescar'}
          </button>
        </div>
        
        {loading && clientes.length === 0 && <div className="loading-state">Cargando clientes...</div>}
        
        {!loading && error && clientes.length === 0 && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && clientes.length === 0 && !error && (
          <div className="empty-state">No hay clientes registrados aún.</div>
        )}

        {clientes.length > 0 && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre del Cliente</th>
                  <th>Contacto</th>
                  <th>Canal de Origen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.idCliente}>
                    <td>
                      <div className="item-name">{cliente.nombre}</div>
                    </td>
                    <td>
                      {getContactInfo(cliente)}
                    </td>
                    <td>
                      {getChannelBadge(cliente)}
                    </td>
                    <td>
                      <button 
                        className="btn-action" 
                        onClick={() => handleVerPedidos(cliente)}
                        title="Ver historial de trabajos"
                      >
                        <IconList />
                        Ver Pedidos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Historial de Pedidos */}
      {selectedCliente && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Historial de Pedidos</h3>
              <button className="btn-close" onClick={handleCloseModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Mostrando trabajos de <strong>{selectedCliente.nombre}</strong>.
              </p>
              
              <div style={{
                backgroundColor: 'rgba(19, 27, 44, 0.5)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🚧</span>
                Módulo en construcción. Aquí se listarán todas las reparaciones y ventas asociadas a este cliente.
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
