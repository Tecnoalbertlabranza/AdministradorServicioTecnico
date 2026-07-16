import { useState, useEffect } from 'react';
import { trabajoService } from '../services/trabajoService';
import { formatearMoneda, formatearFecha } from '../utils/formatters';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';
import './Dashboard.css';

const Dashboard = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const dataTrabajos = await trabajoService.obtenerTodos();
      dataTrabajos.sort((a, b) => b.idTrabajo - a.idTrabajo);
      setTrabajos(dataTrabajos);
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
          costoInsumos: 80000,
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
          costoInsumos: 15000,
          abono: 45000,
          fechaIngreso: new Date().toISOString() // Cambiado a mes actual para que se vea en el resumen
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
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      // Refrescar los datos luego de actualizar exitosamente
      await cargarDatos();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      // Actualización optimista o mock si el backend falla
      if (error) { 
        // Estamos usando mocks, actualizamos estado local
        setTrabajos(prev => prev.map(t => t.idTrabajo === id ? { ...t, estado: nuevoEstado } : t));
        toast.success(`(Modo Prueba) Estado actualizado a ${nuevoEstado}`);
      } else {
        toast.error(err.message || "No se pudo actualizar el estado.");
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

  // Cálculos financieros del Mes Actual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const trabajosDelMes = trabajos.filter(t => {
    if (!t.fechaIngreso) return false;
    const date = new Date(t.fechaIngreso);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const ingresosMes = trabajosDelMes.reduce((sum, t) => sum + (t.precioTotal || 0), 0);
  const gastosMes = trabajosDelMes.reduce((sum, t) => sum + (t.costoInsumos || 0), 0);
  const gananciaNeta = ingresosMes - gastosMes;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Resumen Financiero del Mes</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="refresh-btn" onClick={cargarDatos} disabled={loading} style={{
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
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Ingresos del Mes</span>
          <span className="stat-value">{formatearMoneda(ingresosMes)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Gastos del Mes (Insumos)</span>
          <span className="stat-value" style={{ color: 'var(--accent-danger)' }}>
            -{formatearMoneda(gastosMes)}
          </span>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--accent-success)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
          <span className="stat-label" style={{ color: 'var(--accent-success)' }}>Ganancia Neta</span>
          <span className="stat-value" style={{ color: 'var(--accent-success)' }}>{formatearMoneda(gananciaNeta)}</span>
        </div>
      </div>

      <div className="data-section">
        <div className="data-section-header">
          <h2 className="data-section-title">Últimos Trabajos (Webhook n8n)</h2>
        </div>
        
        {loading && trabajos.length === 0 ? (
          <Spinner text="Cargando resumen de trabajos..." />
        ) : (
          <>
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
                      <div className="cell-price">Abono: {formatearMoneda(trabajo.abono)}</div>
                    </td>
                    <td>
                      <div className="cell-date">{formatearFecha(trabajo.fechaIngreso)}</div>
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
        </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
