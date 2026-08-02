import { useState, useEffect } from 'react';
import { trabajoService } from '../services/trabajoService';
import { dashboardService } from '../services/dashboardService';
import { formatearMoneda, formatearFecha } from '../utils/formatters';
import { toast } from 'react-hot-toast';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Spinner from '../components/Spinner';
import './Dashboard.css';

const Dashboard = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [resumen, setResumen] = useState({
    totalIngresos: 0,
    totalCostos: 0,
    gananciaNeta: 0,
    cantidadVentas: 0
  });
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
      
      // Llamadas concurrentes al backend usando nuestro cliente API
      const [dataTrabajos, dataResumen] = await Promise.all([
        trabajoService.obtenerPendientes().catch(err => {
          console.warn("Fallo al obtener trabajos pendientes:", err);
          return [];
        }),
        dashboardService.obtenerResumen().catch(err => {
          console.warn("Fallo al obtener resumen dashboard:", err);
          return null;
        })
      ]);

      if (dataResumen) {
        setResumen(dataResumen);
      } else {
        setResumen({
          totalIngresos: 0,
          totalCostos: 0,
          gananciaNeta: 0,
          cantidadVentas: 0
        });
      }

      if (Array.isArray(dataTrabajos)) {
        const ordenados = [...dataTrabajos].sort((a, b) => (b.idTrabajo || 0) - (a.idTrabajo || 0));
        setTrabajos(ordenados);
      } else {
        setTrabajos([]);
      }
    } catch (err) {
      console.error("Error al cargar el dashboard:", err);
      setError('Error general al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      setUpdatingId(id);
      await trabajoService.actualizarEstado(id, nuevoEstado);
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      await cargarDatos();
    } catch (err) {
      toast.error(err.message || "No se pudo actualizar el estado.");
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

  const trabajosPendientes = trabajos
    .filter(t => t.estado === 'PENDIENTE')
    .slice(0, 5);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header flex justify-between items-center mb-6">
        <h1 className="dashboard-title text-2xl font-bold text-white">Dashboard Analítico</h1>
        <button className="refresh-btn flex items-center gap-2" onClick={cargarDatos} disabled={loading} style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'wait' : 'pointer'
        }}>
          {loading ? '↻ Cargando...' : '↻ Refrescar'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Ingresos Brutos */}
        <div className="stat-card flex flex-col p-6 rounded-xl border border-slate-700/50 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 font-medium tracking-wide uppercase text-sm">Ingresos Brutos</span>
            <div className="p-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
              <TrendingUp size={24} color="#10b981" />
            </div>
          </div>
          <span className="text-3xl font-bold text-white">
            {loading ? <Spinner size="small" /> : formatearMoneda(resumen.totalIngresos)}
          </span>
          <div className="mt-2 text-sm text-gray-500">Total cobrado en ventas</div>
        </div>

        {/* Costos Totales */}
        <div className="stat-card flex flex-col p-6 rounded-xl border border-slate-700/50 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 font-medium tracking-wide uppercase text-sm">Costos Totales</span>
            <div className="p-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
              <TrendingDown size={24} color="#ef4444" />
            </div>
          </div>
          <span className="text-3xl font-bold text-white">
            {loading ? <Spinner size="small" /> : `- ${formatearMoneda(resumen.totalCostos)}`}
          </span>
          <div className="mt-2 text-sm text-gray-500">Costo asociado a inventario</div>
        </div>

        {/* Ganancia Neta */}
        <div className="stat-card flex flex-col p-6 rounded-xl border border-emerald-500/30 relative overflow-hidden shadow-lg shadow-emerald-900/20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-emerald-400 font-medium tracking-wide uppercase text-sm">Ganancia Neta</span>
            <div className="p-3 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
              <DollarSign size={24} color="#10b981" />
            </div>
          </div>
          <span className="text-4xl font-extrabold text-emerald-400 relative z-10">
            {loading ? <Spinner size="small" /> : formatearMoneda(resumen.gananciaNeta)}
          </span>
          <div className="mt-2 text-sm text-emerald-500/70 relative z-10">Utilidad real (ROI)</div>
        </div>
      </div>

      <div className="data-section">
        <div className="data-section-header">
          <h2 className="data-section-title text-xl text-white font-semibold">Trabajos Pendientes</h2>
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

            {!loading && trabajos.length > 0 && trabajosPendientes.length === 0 && !error && (
              <div className="empty-state">No hay trabajos pendientes en este momento.</div>
            )}
            
            {!loading && trabajos.length === 0 && !error && (
              <div className="empty-state">No hay trabajos registrados.</div>
            )}

            {trabajosPendientes.length > 0 && (
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
                    {trabajosPendientes.map((trabajo) => (
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
