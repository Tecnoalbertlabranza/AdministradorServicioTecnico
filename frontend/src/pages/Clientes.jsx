import { useState, useEffect } from 'react';
import { clienteService } from '../services/clienteService';
import { trabajoService } from '../services/trabajoService';
import { formatearMoneda, formatearFecha } from '../utils/formatters';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';
import ModalNuevoCliente from '../components/ModalNuevoCliente';
import { RefreshCw, ListFilter, X, MessageCircle, UserPlus } from 'lucide-react';

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-500">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para el modal de historial
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [historialTrabajos, setHistorialTrabajos] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState(null);

  // Estado para el modal de nuevo cliente
  const [isNuevoClienteModalOpen, setIsNuevoClienteModalOpen] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clienteService.obtenerTodos();
      data.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));
      setClientes(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los clientes');
      setClientes([
        { idCliente: '1', nombre: 'Juan Pérez', whatsapp: '+56912345678', instagram: null, fechaRegistro: new Date().toISOString() },
        { idCliente: '2', nombre: 'María Gómez', whatsapp: null, instagram: 'mariag.tech', fechaRegistro: new Date(Date.now() - 86400000).toISOString() },
        { idCliente: '3', nombre: 'Pedro Soto', whatsapp: '+56998765432', instagram: 'psoto99', fechaRegistro: new Date(Date.now() - 172800000).toISOString() }
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
      trabajos.sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso));
      setHistorialTrabajos(trabajos);
    } catch (err) {
      setErrorHistorial(err.message || 'Error al obtener el historial de pedidos.');
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

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50';
      case 'EN_REVISION': return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800/50';
      case 'ESPERANDO_REPUESTO': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
      case 'FINALIZADO': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50';
      case 'ENTREGADO': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getContactInfo = (cliente) => {
    const contacts = [];
    if (cliente.whatsapp) {
      contacts.push(
        <div key="wa" className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
          <MessageCircle size={16} />
          <span>{cliente.whatsapp}</span>
        </div>
      );
    }
    if (cliente.instagram) {
      contacts.push(
        <div key="ig" className="flex items-center gap-2 text-sm font-bold text-pink-600 dark:text-pink-400">
          <IconInstagram />
          <span>@{cliente.instagram}</span>
        </div>
      );
    }

    if (contacts.length === 0) return <span className="text-slate-400 text-sm">Sin contacto</span>;

    return <div className="flex flex-col gap-1">{contacts}</div>;
  };

  const getChannelBadge = (cliente) => {
    if (cliente.whatsapp && cliente.instagram) {
      return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800/50">Multicanal</span>;
    }
    if (cliente.whatsapp) {
      return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50">WhatsApp</span>;
    }
    if (cliente.instagram) {
      return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-pink-100 text-pink-700 border border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800/50">Instagram</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">Desconocido</span>;
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen p-4 md:p-6 space-y-6 transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Directorio de Clientes
          </h1>
          <p className="text-base mt-1 font-medium text-slate-500 dark:text-slate-400">
            Historial de clientes, canales de contacto y registros de servicio
          </p>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="p-6 rounded-2xl border bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <SearchBar 
            placeholder="Buscar cliente por nombre..." 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
          <div className="flex items-center gap-3">
            <button 
              onClick={cargarClientes} 
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm md:text-base border transition shadow-sm cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Cargando...' : 'Refrescar'}
            </button>
            <button 
              onClick={() => setIsNuevoClienteModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm md:text-base bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white transition shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <UserPlus size={18} />
              + Nuevo Cliente
            </button>
          </div>
        </div>

        {loading && clientes.length === 0 && <Spinner text="Cargando directorio de clientes..." />}

        {!loading && error && clientes.length === 0 && (
          <div className="p-8 text-center text-rose-500 font-semibold text-base">{error}</div>
        )}

        {!loading && clientes.length === 0 && !error && (
          <div className="p-12 text-center text-base font-semibold text-slate-500 dark:text-slate-400">
            No hay clientes registrados aún.
          </div>
        )}

        {!loading && clientes.length > 0 && filteredClientes.length === 0 && (
          <div className="p-12 text-center text-base font-semibold text-slate-500 dark:text-slate-400">
            No se encontraron clientes que coincidan con la búsqueda.
          </div>
        )}

        {filteredClientes.length > 0 && (
          <div className="overflow-x-auto w-full mt-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg bg-white dark:bg-slate-900/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100/80 dark:bg-slate-950/80">
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Nombre del Cliente</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Contacto</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Canal de Origen</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.idCliente} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors duration-150 ease-in-out cursor-pointer">
                    <td className="py-4 px-4 font-bold text-base text-slate-900 dark:text-white">
                      {cliente.nombre}
                    </td>
                    <td className="py-4 px-4">{getContactInfo(cliente)}</td>
                    <td className="py-4 px-4">{getChannelBadge(cliente)}</td>
                    <td className="py-4 px-4">
                      <button 
                        className="flex items-center gap-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 px-4 py-2 rounded-xl text-sm font-bold transition border border-sky-500/20 cursor-pointer" 
                        onClick={() => handleVerPedidos(cliente)}
                        title="Ver historial de trabajos"
                      >
                        <ListFilter size={16} />
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

      {/* Modal Crear Nuevo Cliente */}
      <ModalNuevoCliente
        isOpen={isNuevoClienteModalOpen}
        onClose={() => setIsNuevoClienteModalOpen(false)}
        onClienteCreado={cargarClientes}
      />

      {/* Modal Historial de Pedidos */}
      {selectedCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={handleCloseModal}>
          <div className="w-full max-w-3xl rounded-2xl border p-6 shadow-2xl space-y-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Historial de Pedidos</h3>
              <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-base font-medium text-slate-600 dark:text-slate-300">
                Mostrando trabajos registrados de <strong className="text-sky-500">{selectedCliente.nombre}</strong>.
              </p>
              
              {loadingHistorial && <Spinner text="Cargando historial..." />}

              {!loadingHistorial && errorHistorial && (
                <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500 font-semibold text-center text-base">{errorHistorial}</div>
              )}

              {!loadingHistorial && !errorHistorial && historialTrabajos.length === 0 && (
                <div className="p-8 text-center rounded-xl border border-dashed text-base font-semibold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  Este cliente aún no tiene pedidos registrados.
                </div>
              )}

              {!loadingHistorial && !errorHistorial && historialTrabajos.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg bg-white dark:bg-slate-900/40">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100/80 dark:bg-slate-950/80">
                        <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">ID</th>
                        <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Fecha</th>
                        <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Equipo / Falla</th>
                        <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Estado</th>
                        <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                      {historialTrabajos.map(trabajo => (
                        <tr key={trabajo.idTrabajo} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors duration-150 ease-in-out cursor-pointer">
                          <td className="py-3.5 px-4 font-mono text-sm font-bold text-slate-400 dark:text-slate-500">#{trabajo.idTrabajo}</td>
                          <td className="py-3.5 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">{formatearFecha(trabajo.fechaIngreso)}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-base text-slate-900 dark:text-white">{trabajo.equipo}</div>
                            <div className="text-sm font-medium text-slate-400">{trabajo.servicio || trabajo.falla}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-3.5 py-1.5 rounded-full text-sm font-bold border inline-block ${getEstadoBadgeClass(trabajo.estado)}`}>
                              {trabajo.estado}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                            {formatearMoneda(trabajo.precioTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <button 
                type="button" 
                className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                onClick={handleCloseModal}
              >
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
