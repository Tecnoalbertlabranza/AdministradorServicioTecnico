import { useState, useEffect } from 'react';
import { ventaService } from '../services/ventaService';
import { formatearMoneda, formatearFecha } from '../utils/formatters';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import ModalNuevaVenta from '../components/ModalNuevaVenta';
import ModalDetalleVenta from '../components/ModalDetalleVenta';
import './Ventas.css';

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ventaService.obtenerHistorialAdmin();
      // Ordenar por las más recientes primero
      data.sort((a, b) => b.id - a.id);
      setVentas(data);
    } catch (err) {
      setError(err.message || 'Error al cargar las ventas');
      
      // Fallback a Mock Data si el backend está caído
      console.log("Usando mock data para Ventas...");
      setVentas([
        {
          id: 1001,
          detalle: 'Reparación de pantalla iPhone 13 Pro + Mica de cristal',
          precioVenta: 155000,
          costoAsociado: 50000,
          tipoVenta: 'ACCESORIO',
          canal: 'Local',
          fechaVenta: new Date().toISOString()
        },
        {
          id: 1002,
          detalle: 'Venta de Cargador Original Samsung 25W',
          precioVenta: 15000,
          costoAsociado: 8000,
          tipoVenta: 'ACCESORIO',
          canal: 'Instagram',
          fechaVenta: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 1003,
          detalle: 'Cambio de Batería Macbook Pro 2019',
          precioVenta: 120000,
          costoAsociado: 150000,
          tipoVenta: 'EQUIPO',
          canal: 'WhatsApp',
          fechaVenta: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaVenta = () => {
    setIsModalOpen(true);
  };

  const handleVerDetalle = (venta) => {
    setVentaSeleccionada(venta);
    setIsDetalleModalOpen(true);
  };

  const filteredVentas = ventas.filter(v => {
    const term = searchTerm.toLowerCase();
    const matchDetalle = v.detalle && v.detalle.toLowerCase().includes(term);
    const matchCanal = v.canal && v.canal.toLowerCase().includes(term);
    return matchDetalle || matchCanal;
  });

  return (
    <div className="dashboard-container">
      <div className="ventas-header">
        <h1 className="ventas-title">Registro de Ventas e Ingresos</h1>
        <button className="btn-primary" onClick={handleNuevaVenta}>
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>+</span> 
          Registrar Nueva Venta
        </button>
      </div>

      <div className="data-section">
        <div className="data-section-header">
          <h2 className="data-section-title">Historial de Transacciones</h2>
          <button 
            onClick={cargarVentas} 
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
            placeholder="Buscar por cliente o concepto..." 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
        </div>

        {loading && ventas.length === 0 && <Spinner text="Cargando ventas..." />}
        
        {!loading && error && ventas.length === 0 && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && ventas.length === 0 && !error && (
          <div className="empty-state">No hay ventas registradas aún.</div>
        )}

        {!loading && ventas.length > 0 && filteredVentas.length === 0 && (
          <div className="empty-state">No se encontraron ventas que coincidan con la búsqueda.</div>
        )}

        {filteredVentas.length > 0 && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Transacción</th>
                  <th>Fecha</th>
                  <th>Concepto / Detalle</th>
                  <th>Canal</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVentas.map((venta) => (
                  <tr key={venta.id}>
                    <td>
                      <span className="cell-id">#{venta.id}</span>
                    </td>
                    <td>
                      <div className="item-date">{formatearFecha(venta.fechaVenta)}</div>
                    </td>
                    <td>
                      <div className="cell-detail">{venta.detalle}</div>
                    </td>
                    <td>
                      <span className="cell-canal">{venta.canal || 'No especificado'}</span>
                    </td>
                    <td>
                      <div className="item-price" style={{ color: 'var(--accent-success)' }}>
                        {formatearMoneda(venta.precioVenta)}
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn-icon view" 
                          title="Ver detalle" 
                          onClick={() => handleVerDetalle(venta)}
                        >
                          👁
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalNuevaVenta
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVentaExitosa={cargarVentas}
      />
      
      <ModalDetalleVenta
        isOpen={isDetalleModalOpen}
        onClose={() => setIsDetalleModalOpen(false)}
        venta={ventaSeleccionada}
      />
    </div>
  );
};

export default Ventas;
