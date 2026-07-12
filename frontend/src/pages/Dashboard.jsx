import { useState, useEffect } from 'react';
import { trabajoService } from '../services/trabajoService';
import './Dashboard.css';

const Dashboard = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    cargarTrabajos();
  }, []);

  const cargarTrabajos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trabajoService.obtenerTodos();
      // Ordenar por ID descendente para que los nuevos salgan primero, si existe idTrabajo
      data.sort((a, b) => b.idTrabajo - a.idTrabajo);
      setTrabajos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los trabajos');
      // Mock data temporal en caso de que el backend no esté corriendo aún
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

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      setUpdatingId(id);
      await trabajoService.actualizarEstado(id, nuevoEstado);
      // Refrescar los datos luego de actualizar exitosamente
      await cargarTrabajos();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      // Actualización optimista o mock si el backend falla
      if (error) { 
        // Estamos usando mocks, actualizamos estado local
        setTrabajos(prev => prev.map(t => t.idTrabajo === id ? { ...t, estado: nuevoEstado } : t));
      } else {
        alert(err.message || "No se pudo actualizar el estado.");
      }
    } finally {
      setUpdatingId(null);
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

  const formatDate = (isoString) => {
    if (!isoString) return 'Sin fecha';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const pendientsCount = trabajos.filter(t => t.estado === 'PENDIENTE').length;
  const ingresosTotal = trabajos.reduce((sum, t) => sum + (t.abono || 0), 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Resumen del Servicio</h1>
        <button className="refresh-btn" onClick={cargarTrabajos} disabled={loading} style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'wait' : 'pointer'
        }}>
          {loading ? 'Cargando...' : 'Actualizar'}
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
        
        {loading && trabajos.length === 0 && <div className="loading-state">Cargando datos...</div>}
        
        {!loading && error && trabajos.length === 0 && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && trabajos.length === 0 && !error && (
          <div className="empty-state">No hay trabajos registrados.</div>
        )}

        {trabajos.length > 0 && (
          <div className="table-responsive">
            <table className="trabajos-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Equipo</th>
                  <th>Fecha ingreso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {trabajos.map((trabajo) => (
                  <tr key={trabajo.idTrabajo}>
                    <td>
                      <div className="cell-client-name">
                        {trabajo.cliente ? trabajo.cliente.nombre : 'Sin registrar'}
                      </div>
                      <div className="cell-client-service">{trabajo.servicio}</div>
                    </td>
                    <td>
                      <div className="cell-device">{trabajo.equipo}</div>
                      <div className="cell-price">Abono: {formatCurrency(trabajo.abono)}</div>
                    </td>
                    <td>
                      <div className="cell-date">{formatDate(trabajo.fechaIngreso)}</div>
                    </td>
                    <td>
                      <div className="select-container">
                        <select
                          className={`status-select ${getBadgeClass(trabajo.estado)}`}
                          value={trabajo.estado || 'PENDIENTE'}
                          onChange={(e) => handleEstadoChange(trabajo.idTrabajo, e.target.value)}
                          disabled={updatingId === trabajo.idTrabajo}
                        >
                          <option value="PENDIENTE">PENDIENTE</option>
                          <option value="FINALIZADO">FINALIZADO</option>
                          <option value="ENTREGADO">ENTREGADO</option>
                        </select>
                        {updatingId === trabajo.idTrabajo && <span className="updating-spinner">⏳</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
