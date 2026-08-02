import { useState, useEffect } from 'react';
import { trabajoService } from '../services/trabajoService';
import { dashboardService } from '../services/dashboardService';
import { formatearMoneda, formatearFecha } from '../utils/formatters';
import { toast } from 'react-hot-toast';
import { TrendingUp, TrendingDown, DollarSign, Wrench, ShoppingBag, RefreshCw } from 'lucide-react';
import Spinner from '../components/Spinner';

// --- COMPONENTE TARJETA KPI ---
const KpiCard = ({ title, amount, subtitle, type, loading }) => {
  const isCost = type === 'cost';
  const isPositive = type === 'income' || type === 'profit';

  const textColor = isCost
    ? 'text-red-400'
    : isPositive
    ? 'text-emerald-400'
    : 'text-white';

  const IconComponent = isCost ? TrendingDown : isPositive && type === 'profit' ? DollarSign : TrendingUp;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col justify-between w-full hover:border-slate-600 transition-all duration-200">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 font-medium text-sm flex items-center gap-2">
            {title}
          </span>
          <div className={`p-2 rounded-lg ${isCost ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <IconComponent size={20} />
          </div>
        </div>
        <div className={`text-3xl font-bold ${textColor}`}>
          {loading ? (
            <Spinner size="small" />
          ) : isCost && amount > 0 ? (
            `- ${formatearMoneda(amount)}`
          ) : (
            formatearMoneda(amount || 0)
          )}
        </div>
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-3">{subtitle}</p>}
    </div>
  );
};

// --- COMPONENTE BLOQUE FINANCIERO ---
const FinancialBlock = ({ title, icon: Icon, children }) => (
  <div className="w-full mb-8">
    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
      {Icon && <Icon className="text-slate-300" size={24} />}
      {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {children}
    </div>
  </div>
);

// --- COMPONENTE TABLA TRABAJOS PENDIENTES ---
const PendingJobsTable = ({ trabajos, loading, error, updatingId, handleEstadoChange }) => {
  const getBadgeStyle = (estado) => {
    if (!estado) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    const est = estado.toLowerCase();
    if (est === 'finalizado') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (est === 'entregado') return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  const trabajosPendientes = trabajos
    .filter((t) => t.estado === 'PENDIENTE')
    .slice(0, 5);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg w-full mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Trabajos Pendientes</h2>
        <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/30">
          Pendientes: {trabajosPendientes.length}
        </span>
      </div>

      {loading && trabajos.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          <Spinner text="Cargando resumen de trabajos..." />
        </div>
      ) : (
        <>
          {!loading && error && trabajos.length === 0 && (
            <div className="p-8 text-center text-red-400 font-medium">{error}</div>
          )}

          {!loading && trabajos.length > 0 && trabajosPendientes.length === 0 && !error && (
            <div className="p-8 text-center text-slate-400">No hay trabajos pendientes en este momento.</div>
          )}

          {!loading && trabajos.length === 0 && !error && (
            <div className="p-8 text-center text-slate-400">No hay trabajos registrados.</div>
          )}

          {trabajosPendientes.length > 0 && (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Equipo</th>
                    <th className="py-3 px-4">Fecha Ingreso</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {trabajosPendientes.map((trabajo) => (
                    <tr key={trabajo.idTrabajo} className="hover:bg-slate-700/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {trabajo.cliente ? trabajo.cliente.nombre : 'Sin registrar'}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{trabajo.servicio}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{trabajo.equipo}</div>
                        <div className="text-xs text-emerald-400 mt-0.5">
                          Abono: {formatearMoneda(trabajo.abono)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-slate-400">
                        {formatearFecha(trabajo.fechaIngreso)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            className={`px-3 py-1 rounded-lg text-xs font-medium border appearance-none cursor-pointer outline-none bg-slate-900 ${getBadgeStyle(
                              trabajo.estado
                            )} disabled:opacity-50`}
                            value={trabajo.estado || 'PENDIENTE'}
                            onChange={(e) => handleEstadoChange(trabajo.idTrabajo, e.target.value)}
                            disabled={updatingId === trabajo.idTrabajo}
                          >
                            <option value="PENDIENTE" className="bg-slate-800 text-amber-300">PENDIENTE</option>
                            <option value="FINALIZADO" className="bg-slate-800 text-emerald-300">FINALIZADO</option>
                            <option value="ENTREGADO" className="bg-slate-800 text-blue-300">ENTREGADO</option>
                          </select>
                          {updatingId === trabajo.idTrabajo && (
                            <span className="text-xs animate-spin text-slate-400">⏳</span>
                          )}
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
  );
};

// --- COMPONENTE PRINCIPAL DASHBOARD ---
const Dashboard = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [resumen, setResumen] = useState({
    ingresosTrabajos: 0,
    costosTrabajos: 0,
    gananciaTrabajos: 0,
    ingresosVentas: 0,
    costosVentas: 0,
    gananciaVentas: 0,
    totalIngresos: 0,
    totalCostos: 0,
    gananciaNeta: 0,
    cantidadVentas: 0,
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

      const [dataTrabajos, dataResumen] = await Promise.all([
        trabajoService.obtenerPendientes().catch((err) => {
          console.warn('Fallo al obtener trabajos pendientes:', err);
          return [];
        }),
        dashboardService.obtenerResumen().catch((err) => {
          console.warn('Fallo al obtener resumen dashboard:', err);
          return null;
        }),
      ]);

      if (dataResumen) {
        setResumen(dataResumen);
      } else {
        setResumen({
          ingresosTrabajos: 0,
          costosTrabajos: 0,
          gananciaTrabajos: 0,
          ingresosVentas: 0,
          costosVentas: 0,
          gananciaVentas: 0,
          totalIngresos: 0,
          totalCostos: 0,
          gananciaNeta: 0,
          cantidadVentas: 0,
        });
      }

      if (Array.isArray(dataTrabajos)) {
        const ordenados = [...dataTrabajos].sort(
          (a, b) => (b.idTrabajo || 0) - (a.idTrabajo || 0)
        );
        setTrabajos(ordenados);
      } else {
        setTrabajos([]);
      }
    } catch (err) {
      console.error('Error al cargar el dashboard:', err);
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
      toast.error(err.message || 'No se pudo actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Analítico</h1>
          <p className="text-sm text-slate-400 mt-1">
            Métricas financieras desglosadas por Servicio Técnico y Vitrina
          </p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-medium px-4 py-2 rounded-xl border border-slate-700 transition shadow-md disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Cargando...' : 'Refrescar'}
        </button>
      </div>

      {/* BLOQUE 1: Servicio Técnico (Trabajos) */}
      <FinancialBlock title="Finanzas de Servicio Técnico (Trabajos)" icon={Wrench}>
        <KpiCard
          title="Ingresos por Trabajos"
          amount={resumen.ingresosTrabajos}
          subtitle="Cobros totales por servicios de reparación"
          type="income"
          loading={loading}
        />
        <KpiCard
          title="Costos de Insumos"
          amount={resumen.costosTrabajos}
          subtitle="Gastos asociados a repuestos e insumos"
          type="cost"
          loading={loading}
        />
        <KpiCard
          title="Ganancia Neta de Trabajos"
          amount={resumen.gananciaTrabajos}
          subtitle="Utilidad neta generada en taller"
          type="profit"
          loading={loading}
        />
      </FinancialBlock>

      {/* BLOQUE 2: Vitrina (Ventas de Equipos) */}
      <FinancialBlock title="Finanzas de Vitrina (Ventas de Equipos)" icon={ShoppingBag}>
        <KpiCard
          title="Ingresos por Ventas"
          amount={resumen.ingresosVentas}
          subtitle="Ventas de equipos y accesorios"
          type="income"
          loading={loading}
        />
        <KpiCard
          title="Costos Totales de Equipos"
          amount={resumen.costosVentas}
          subtitle="Costo Compra + Reacondicionamiento"
          type="cost"
          loading={loading}
        />
        <KpiCard
          title="Ganancia Neta de Ventas"
          amount={resumen.gananciaVentas}
          subtitle="Utilidad neta generada en vitrina"
          type="profit"
          loading={loading}
        />
      </FinancialBlock>

      {/* TABLA DE TRABAJOS PENDIENTES */}
      <PendingJobsTable
        trabajos={trabajos}
        loading={loading}
        error={error}
        updatingId={updatingId}
        handleEstadoChange={handleEstadoChange}
      />
    </div>
  );
};

export default Dashboard;
