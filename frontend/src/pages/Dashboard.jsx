import { useState, useEffect } from 'react';
import { trabajoService } from '../services/trabajoService';
import './Dashboard.css';

const Dashboard = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarTrabajos();
  }, []);

  const cargarTrabajos = async () => {
    try {
      setLoading(true);
      setError(null);
      // Consumimos el endpoint real de la API
      const data = await trabajoService.obtenerTodos();
      // Ordenar por fecha (asumiendo que los más recientes primero) si fuera necesario
      // data.sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso));
      setTrabajos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los trabajos');
      // Mock data temporal en caso de que el backend no esté corriendo aún para poder visualizar el UI
      console.log("Usando datos de prueba por fallo de conexión al backend");
      setTrabajos([
        {
          idTrabajo: 1,
          equipo: 'iPhone 13 Pro',
          cliente: { nombre: 'Juan Pérez' },
          estado: 'PENDIENTE',
          servicio: 'Cambio de pantalla',
          precioTotal: 150000,
          abono: 50000,
          fechaIngreso: new Date().toISOString()
        },
        {
          idTrabajo: 2,
          equipo: 'Samsung Galaxy S22',
          cliente: { nombre: 'María Gómez' },
          estado: 'FINALIZADO',
          servicio: 'Cambio batería',
          precioTotal: 45000,
          abono: 45000,
          fechaIngreso: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (estado) => {
    if (!estado) return 'badge-pendiente';
    const est = estado.toLowerCase();
    if (est === 'finalizado') return 'badge-finalizado';
    if (est === 'entregado') return 'badge-entregado';
    return 'badge-pendiente';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount || 0);
  };

  const pendientsCount = trabajos.filter(t => t.estado === 'PENDIENTE').length;
  const ingresosTotal = trabajos.reduce((sum, t) => sum + (t.abono || 0), 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Resumen del Servicio</h1>
        <button className="refresh-btn" onClick={cargarTrabajos} style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem'
        }}>
          Actualizar
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Trabajos Activos</span>
          <span className="stat-value">{pendientsCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Ingresos (Abonos)</span>
          <span className="stat-value">{formatCurrency(ingresosTotal)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Registros</span>
          <span className="stat-value">{trabajos.length}</span>
        </div>
      </div>

      <div className="data-section">
        <div className="data-section-header">
          <h2 className="data-section-title">Últimos Trabajos (Webhook n8n)</h2>
        </div>
        
        {loading && <div className="loading-state">Cargando datos...</div>}
        
        {!loading && error && trabajos.length === 0 && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && trabajos.length === 0 && !error && (
          <div className="empty-state">No hay trabajos registrados.</div>
        )}

        {!loading && trabajos.length > 0 && (
          <div className="trabajos-list">
            {trabajos.map((trabajo) => (
              <div key={trabajo.idTrabajo} className="trabajo-item">
                <div className="trabajo-main-info">
                  <span className="trabajo-device">{trabajo.equipo}</span>
                  <span className="trabajo-client">
                    Cliente: {trabajo.cliente ? trabajo.cliente.nombre : 'Sin registrar'}
                  </span>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className={`badge ${getBadgeClass(trabajo.estado)}`}>
                      {trabajo.estado || 'PENDIENTE'}
                    </span>
                  </div>
                </div>
                
                <div className="trabajo-service-info" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <p><strong>Falla/Servicio:</strong> {trabajo.servicio}</p>
                </div>

                <div className="trabajo-details">
                  <div className="detail-row">
                    <span>Precio Total</span>
                    <span className="detail-value">{formatCurrency(trabajo.precioTotal)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Abono</span>
                    <span className="detail-value" style={{ color: 'var(--accent-success)' }}>
                      {formatCurrency(trabajo.abono)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
