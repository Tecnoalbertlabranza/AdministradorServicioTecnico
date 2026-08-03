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
    ? 'text-rose-600 dark:text-rose-400'
    : isPositive
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-slate-900 dark:text-white';

  const iconBg = isCost
    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
    : isPositive
    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
    : 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400';

  const IconComponent = isCost ? TrendingDown : isPositive && type === 'profit' ? DollarSign : TrendingUp;

  return (
    <div className="rounded-2xl p-6 shadow-sm border transition-all duration-200 flex flex-col justify-between w-full bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 hover:border-sky-500/30">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-sm text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <IconComponent size={20} />
          </div>
        </div>
        <div className={`text-3xl font-extrabold tracking-tight ${textColor}`}>
          {loading ? (
            <Spinner size="small" />
          ) : isCost && amount > 0 ? (
            `- ${formatearMoneda(amount)}`
          ) : (
            formatearMoneda(amount || 0)
          )}
        </div>
      </div>
      {subtitle && (
        <p className="text-xs mt-3 font-medium text-slate-400 dark:text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
};

// --- COMPONENTE BLOQUE FINANCIERO ---
const FinancialBlock = ({ title, icon: Icon, children }) => (
  <div className="w-full mb-8">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-slate-900 dark:text-white">
      {Icon && <Icon className="text-sky-500 dark:text-sky-400" size={24} />}
      {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {children}
    </div>
  </div>
);

// --- COMPONENTE TABLA TRABAJOS PENDIENTES ---
const PendingJobsTable = ({ trabajos, loading, error, updatingId, handleEstadoChange }) => {
  const trabajosPendientes = trabajos
    .filter((t) => t.estado === 'PENDIENTE')
    .slice(0, 5);

  return (
    <div className="rounded-2xl p-6 border w-full mt-8 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trabajos Pendientes</h2>
        <span className="text-xs font-bold px-3 py-1 rounded-full border bg-amber-100 text-orange-700 border-amber-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50">
          Pendientes: {trabajosPendientes.length}
        </span>
      </div>

      {loading && trabajos.length === 0 ? (
        <Spinner text="Cargando trabajos pendientes..." />
      ) : error ? (
        <div className="p-4 text-center text-rose-500 font-semibold">{error}</div>
      ) : trabajosPendientes.length === 0 ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
          No hay trabajos pendientes registrados.
        </div>
      ) : (
        <div className="overflow-x-auto w-full mt-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg bg-white dark:bg-slate-900/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100/80 dark:bg-slate-950/80">
                <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">ID / Fecha</th>
                <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Cliente</th>
                <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Equipo y Falla</th>
                <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Cobro</th>
                <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Acción Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {trabajosPendientes.map((trabajo) => (
                <tr key={trabajo.idTrabajo} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors duration-150 ease-in-out cursor-pointer">
                  <td className="py-4 px-4">
                    <div className="font-mono text-sm font-bold text-slate-400 dark:text-slate-500">
                      #{trabajo.idTrabajo}
                    </div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {formatearFecha(trabajo.fechaIngreso)}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-base text-slate-900 dark:text-white">
                    {trabajo.cliente?.nombre || 'Sin registrar'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-base text-slate-800 dark:text-slate-100">{trabajo.equipo}</div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {trabajo.servicio || trabajo.falla || 'Sin detalle'}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                    {formatearMoneda(trabajo.precioTotal)}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleEstadoChange(trabajo.idTrabajo, 'EN_REVISION')}
                      disabled={updatingId === trabajo.idTrabajo}
                      className="px-3.5 py-2 rounded-xl text-sm font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      {updatingId === trabajo.idTrabajo ? 'Guardando...' : 'Iniciar Revisión'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [resumen, setResumen] = useState({
    ingresosTrabajos: 0,
    costosTrabajos: 0,
    gananciaTrabajos: 0,
    ingresosVentas: 0,
    costosVentas: 0,
    gananciaVentas: 0
  });
  const [trabajos, setTrabajos] = useState([]);
  const [loadingResumen, setLoadingResumen] = useState(true);
  const [loadingTrabajos, setLoadingTrabajos] = useState(true);
  const [errorResumen, setErrorResumen] = useState(null);
  const [errorTrabajos, setErrorTrabajos] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    cargarResumen();
    cargarTrabajos();
  };

  const cargarResumen = async () => {
    try {
      setLoadingResumen(true);
      setErrorResumen(null);
      const data = await dashboardService.obtenerResumen();
      setResumen(data);
    } catch (err) {
      console.error(err);
      setErrorResumen('Error al cargar métricas financieras');
    } finally {
      setLoadingResumen(false);
    }
  };

  const cargarTrabajos = async () => {
    try {
      setLoadingTrabajos(true);
      setErrorTrabajos(null);
      const data = await trabajoService.obtenerTodos();
      setTrabajos(data);
    } catch (err) {
      console.error(err);
      setErrorTrabajos('Error al cargar trabajos pendientes');
    } finally {
      setLoadingTrabajos(false);
    }
  };

  const handleEstadoChange = async (idTrabajo, nuevoEstado) => {
    try {
      setUpdatingId(idTrabajo);
      await trabajoService.actualizarEstado(idTrabajo, nuevoEstado);
      toast.success('Estado actualizado correctamente');
      setTrabajos((prev) =>
        prev.map((t) => (t.idTrabajo === idTrabajo ? { ...t, estado: nuevoEstado } : t))
      );
    } catch (err) {
      toast.error(err.message || 'Error al cambiar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-6 transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard General
          </h1>
          <p className="text-base mt-1 font-medium text-slate-500 dark:text-slate-400">
            Resumen financiero y trabajos pendientes en taller y vitrina
          </p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={loadingResumen || loadingTrabajos}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm md:text-base border transition shadow-sm cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <RefreshCw size={18} className={loadingResumen || loadingTrabajos ? 'animate-spin' : ''} />
          {loadingResumen || loadingTrabajos ? 'Cargando...' : 'Actualizar Datos'}
        </button>
      </div>

      {/* BLOQUE 1: SERVICIO TÉCNICO (TRABAJOS) */}
      <FinancialBlock title="Finanzas de Servicio Técnico (Trabajos de Taller)" icon={Wrench}>
        <KpiCard
          title="Ingresos por Trabajos"
          amount={resumen.ingresosTrabajos}
          subtitle="Cobros totales de servicio técnico"
          type="income"
          loading={loadingResumen}
        />
        <KpiCard
          title="Costos de Insumos"
          amount={resumen.costosTrabajos}
          subtitle="Repuestos utilizados en reparaciones"
          type="cost"
          loading={loadingResumen}
        />
        <KpiCard
          title="Ganancia Real Taller"
          amount={resumen.gananciaTrabajos}
          subtitle="Ingresos menos costo de repuestos"
          type="profit"
          loading={loadingResumen}
        />
      </FinancialBlock>

      {/* BLOQUE 2: VENTAS DE EQUIPOS (VITRINA) */}
      <FinancialBlock title="Finanzas de Vitrina (Venta de Equipos)" icon={ShoppingBag}>
        <KpiCard
          title="Ingresos por Ventas"
          amount={resumen.ingresosVentas}
          subtitle="Ventas totales de equipos reacondicionados"
          type="income"
          loading={loadingResumen}
        />
        <KpiCard
          title="Costos Equipos (Inversión)"
          amount={resumen.costosVentas}
          subtitle="Compra original + reacondicionamiento"
          type="cost"
          loading={loadingResumen}
        />
        <KpiCard
          title="Ganancia Real Vitrina"
          amount={resumen.gananciaVentas}
          subtitle="Ventas menos inversión total"
          type="profit"
          loading={loadingResumen}
        />
      </FinancialBlock>

      {/* TABLA DE TRABAJOS PENDIENTES */}
      <PendingJobsTable
        trabajos={trabajos}
        loading={loadingTrabajos}
        error={errorTrabajos}
        updatingId={updatingId}
        handleEstadoChange={handleEstadoChange}
      />
    </div>
  );
};

export default Dashboard;
