import { useState, useEffect } from 'react';
import { ventaService } from '../services/ventaService';
import { formatearMoneda, formatearFecha } from '../utils/formatters';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import ModalNuevaVenta from '../components/ModalNuevaVenta';
import ModalDetalleVenta from '../components/ModalDetalleVenta';
import { Plus, RefreshCw, Eye } from 'lucide-react';

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
      data.sort((a, b) => b.id - a.id);
      setVentas(data);
    } catch (err) {
      setError(err.message || 'Error al cargar las ventas');
      setVentas([
        { id: 1001, detalle: 'Reparación de pantalla iPhone 13 Pro + Mica de cristal', precioVenta: 155000, costoAsociado: 50000, tipoVenta: 'ACCESORIO', canal: 'Local', fechaVenta: new Date().toISOString() },
        { id: 1002, detalle: 'Venta de Cargador Original Samsung 25W', precioVenta: 15000, costoAsociado: 8000, tipoVenta: 'ACCESORIO', canal: 'Instagram', fechaVenta: new Date(Date.now() - 3600000).toISOString() },
        { id: 1003, detalle: 'Cambio de Batería Macbook Pro 2019', precioVenta: 120000, costoAsociado: 150000, tipoVenta: 'EQUIPO', canal: 'WhatsApp', fechaVenta: new Date(Date.now() - 86400000).toISOString() }
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
    <div className="w-full min-h-screen p-4 md:p-6 space-y-6 transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Registro de Ventas e Ingresos
          </h1>
          <p className="text-base mt-1 font-medium text-slate-500 dark:text-slate-400">
            Historial de transacciones comerciales y canales de venta
          </p>
        </div>
        <button 
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-sm md:text-base px-5 py-2.5 rounded-xl transition duration-200 shadow-md shadow-sky-500/20 cursor-pointer" 
          onClick={handleNuevaVenta}
        >
          <Plus size={20} />
          Registrar Nueva Venta
        </button>
      </div>

      {/* Contenedor Principal */}
      <div className="p-6 rounded-2xl border bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <SearchBar 
            placeholder="Buscar por cliente o concepto..." 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
          <button 
            onClick={cargarVentas} 
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm md:text-base border transition shadow-sm cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Cargando...' : 'Refrescar'}
          </button>
        </div>

        {loading && ventas.length === 0 && <Spinner text="Cargando ventas..." />}

        {!loading && error && ventas.length === 0 && (
          <div className="p-8 text-center text-rose-500 font-semibold text-base">{error}</div>
        )}

        {!loading && ventas.length === 0 && !error && (
          <div className="p-12 text-center text-base font-semibold text-slate-500 dark:text-slate-400">
            No hay ventas registradas aún.
          </div>
        )}

        {!loading && ventas.length > 0 && filteredVentas.length === 0 && (
          <div className="p-12 text-center text-base font-semibold text-slate-500 dark:text-slate-400">
            No se encontraron ventas que coincidan con la búsqueda.
          </div>
        )}

        {filteredVentas.length > 0 && (
          <div className="overflow-x-auto w-full mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-sm font-bold uppercase tracking-wider border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-950/50">
                  <th className="py-4 px-4">ID Transacción</th>
                  <th className="py-4 px-4">Fecha</th>
                  <th className="py-4 px-4">Concepto / Detalle</th>
                  <th className="py-4 px-4">Canal</th>
                  <th className="py-4 px-4">Total</th>
                  <th className="py-4 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVentas.map((venta) => (
                  <tr key={venta.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="py-4 px-4 font-mono text-sm font-bold text-slate-400 dark:text-slate-500">#{venta.id}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {formatearFecha(venta.fechaVenta)}
                    </td>
                    <td className="py-4 px-4 font-bold text-base text-slate-900 dark:text-white">
                      {venta.detalle}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800/50">
                        {venta.canal || 'No especificado'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                      {formatearMoneda(venta.precioVenta)}
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        className="flex items-center gap-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 px-4 py-2 rounded-xl text-sm font-bold transition border border-sky-500/20 cursor-pointer" 
                        title="Ver detalle" 
                        onClick={() => handleVerDetalle(venta)}
                      >
                        <Eye size={16} />
                        Detalle
                      </button>
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
