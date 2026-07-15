import { useState, useEffect } from 'react';
import { clienteService } from '../services/clienteService';
import { trabajoService } from '../services/trabajoService';
import SearchBar from '../components/SearchBar';
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
  
  // Estado para la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para el modal de historial
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [historialTrabajos, setHistorialTrabajos] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState(null);

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

  const handleVerPedidos = async (cliente) => {
    setSelectedCliente(cliente);
    setLoadingHistorial(true);
    setErrorHistorial(null);
    setHistorialTrabajos([]);

    try {
      const trabajos = await trabajoService.obtenerPorCliente(cliente.idCliente);
      // Ordenar por fecha de ingreso descendente
      trabajos.sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso));
      setHistorialTrabajos(trabajos);
    } catch (err) {
      setErrorHistorial(err.message || 'Error al obtener el historial de pedidos.');
      console.error(err);
      setHistorialTrabajos([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
    setHistorialTrabajos([]);
    setErrorHistorial(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount || 0);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Sin fecha';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getEstadoBadgeClass = (estado) => {
    switch(estado) {
      case 'PENDIENTE': return 'status-badge status-pendiente';
      case 'FINALIZADO': return 'status-badge status-finalizado';
      case 'ENTREGADO': return 'status-badge status-entregado';
      default: return 'status-badge';
    }
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

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <SearchBar 
            placeholder="Buscar cliente por nombre..." 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
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

        {!loading && clientes.length > 0 && filteredClientes.length === 0 && (
          <div className="empty-state">No se encontraron clientes que coincidan con la búsqueda.</div>
        )}

        {filteredClientes.length > 0 && (
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
                {filteredClientes.map((cliente) => (
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
          <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Historial de Pedidos</h3>
              <button className="btn-close" onClick={handleCloseModal}>✕</button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <p style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                Mostrando trabajos de <strong>{selectedCliente.nombre}</strong>.
              </p>
              
              {loadingHistorial && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'inline-block', border: '3px solid rgba(59, 130, 246, 0.2)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                  <div>Cargando historial...</div>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {!loadingHistorial && errorHistorial && (
                <div className="error-state" style={{ padding: '2rem 1rem' }}>
                  {errorHistorial}
                </div>
              )}

              {!loadingHistorial && !errorHistorial && historialTrabajos.length === 0 && (
                <div style={{
                  backgroundColor: 'rgba(19, 27, 44, 0.3)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  Este cliente aún no tiene pedidos registrados.
                </div>
              )}

              {!loadingHistorial && !errorHistorial && historialTrabajos.length > 0 && (
                <div className="table-responsive" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Equipo / Falla</th>
                        <th>Estado</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialTrabajos.map(trabajo => (
                        <tr key={trabajo.idTrabajo}>
                          <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{trabajo.idTrabajo}</td>
                          <td>{formatDate(trabajo.fechaIngreso)}</td>
                          <td>
                            <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{trabajo.equipo}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{trabajo.servicio || trabajo.falla}</div>
                          </td>
                          <td>
                            <span className={getEstadoBadgeClass(trabajo.estado)}>
                              {trabajo.estado}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600', color: 'var(--accent-success)' }}>
                            {formatCurrency(trabajo.precioTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
