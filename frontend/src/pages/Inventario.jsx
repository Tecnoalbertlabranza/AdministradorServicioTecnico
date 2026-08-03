import { useState, useEffect } from 'react';
import { inventarioService } from '../services/inventarioService';
import { formatearMoneda, formatearFecha } from '../utils/formatters';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import InputMoneda from '../components/InputMoneda';
import { Plus, RefreshCw, LayersPlus, Trash2, X } from 'lucide-react';

const Inventario = () => {
  const [repuestos, setRepuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modales y formularios
  const [isNuevoModalOpen, setIsNuevoModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [repuestoSeleccionado, setRepuestoSeleccionado] = useState(null);
  const [cantidadSumar, setCantidadSumar] = useState(1);

  // Nuevo Repuesto Form
  const [nuevoRepuesto, setNuevoRepuesto] = useState({
    nombre: '',
    cantidadDisponible: '',
    costoUnitario: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventarioService.obtenerTodo();
      data.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setRepuestos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el inventario');
      setRepuestos([
        { idRepuesto: 1, nombre: 'Pantalla iPhone 13 Pro (OLED Original)', cantidadDisponible: 2, costoUnitario: 45000, ultimaActualizacion: new Date().toISOString() },
        { idRepuesto: 2, nombre: 'Batería Macbook Pro 13" A1708 (2016-2017)', cantidadDisponible: 5, costoUnitario: 28000, ultimaActualizacion: new Date().toISOString() },
        { idRepuesto: 3, nombre: 'Módulo Carga USB-C Samsung A52', cantidadDisponible: 0, costoUnitario: 3500, ultimaActualizacion: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearRepuesto = async (e) => {
    e.preventDefault();
    if (!nuevoRepuesto.nombre) return toast.error('El nombre es obligatorio');
    
    try {
      await inventarioService.crearRepuesto({
        nombre: nuevoRepuesto.nombre,
        cantidadDisponible: parseInt(nuevoRepuesto.cantidadDisponible) || 0,
        costoUnitario: parseFloat(nuevoRepuesto.costoUnitario) || 0
      });
      toast.success('Repuesto agregado al inventario');
      setIsNuevoModalOpen(false);
      setNuevoRepuesto({ nombre: '', cantidadDisponible: '', costoUnitario: '' });
      cargarInventario();
    } catch (err) {
      toast.error(err.message || 'Error al crear el repuesto');
    }
  };

  const handleSumarStock = async (e) => {
    e.preventDefault();
    if (!repuestoSeleccionado) return;
    
    try {
      await inventarioService.sumarStock(
        repuestoSeleccionado.idRepuesto, 
        parseInt(cantidadSumar) || 1,
        repuestoSeleccionado.cantidadDisponible || 0
      );
      toast.success('Stock actualizado correctamente');
      setIsStockModalOpen(false);
      setCantidadSumar(1);
      setRepuestoSeleccionado(null);
      cargarInventario();
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el stock');
    }
  };

  const handleEliminarRepuesto = async () => {
    if (!repuestoSeleccionado) return;
    try {
      await inventarioService.eliminarRepuesto(repuestoSeleccionado.idRepuesto);
      toast.success('Repuesto eliminado');
      setIsDeleteModalOpen(false);
      setRepuestoSeleccionado(null);
      cargarInventario();
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const getStockBadge = (cantidad) => {
    if (cantidad === 0) {
      return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50">Sin Stock (Agotado)</span>;
    }
    if (cantidad <= 2) {
      return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-orange-700 border border-amber-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50">Stock Crítico ({cantidad})</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50">Disponible ({cantidad})</span>;
  };

  const filteredRepuestos = repuestos.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen p-4 md:p-6 space-y-6 transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Control de Inventario y Repuestos
          </h1>
          <p className="text-base mt-1 font-medium text-slate-500 dark:text-slate-400">
            Gestión de stock de insumos, costos unitarios y reposiciones
          </p>
        </div>
        <button 
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-sm md:text-base px-5 py-2.5 rounded-xl transition duration-200 shadow-md shadow-sky-500/20 cursor-pointer" 
          onClick={() => setIsNuevoModalOpen(true)}
        >
          <Plus size={20} />
          Agregar Insumo
        </button>
      </div>

      {/* Contenedor Principal */}
      <div className="p-6 rounded-2xl border bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <SearchBar 
            placeholder="Buscar repuesto por nombre..." 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
          <button 
            onClick={cargarInventario} 
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm md:text-base border transition shadow-sm cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Cargando...' : 'Refrescar'}
          </button>
        </div>

        {loading && repuestos.length === 0 && <Spinner text="Cargando inventario..." />}

        {!loading && error && repuestos.length === 0 && (
          <div className="p-8 text-center text-rose-500 font-semibold text-base">{error}</div>
        )}

        {!loading && repuestos.length === 0 && !error && (
          <div className="p-12 text-center text-base font-semibold text-slate-500 dark:text-slate-400">
            No hay insumos registrados en el inventario.
          </div>
        )}

        {!loading && repuestos.length > 0 && filteredRepuestos.length === 0 && (
          <div className="p-12 text-center text-base font-semibold text-slate-500 dark:text-slate-400">
            No se encontraron repuestos que coincidan con la búsqueda.
          </div>
        )}

        {filteredRepuestos.length > 0 && (
          <div className="overflow-x-auto w-full mt-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg bg-white dark:bg-slate-900/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100/80 dark:bg-slate-950/80">
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Insumo / Repuesto</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Costo Unitario</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Estado de Stock</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Última Actualización</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredRepuestos.map((item) => (
                  <tr key={item.idRepuesto} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors duration-150 ease-in-out cursor-pointer">
                    <td className="py-4 px-4 font-bold text-base text-slate-900 dark:text-white">
                      {item.nombre}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-base text-rose-500">
                      {formatearMoneda(item.costoUnitario || 0)}
                    </td>
                    <td className="py-4 px-4">{getStockBadge(item.cantidadDisponible)}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {formatearFecha(item.ultimaActualizacion)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          className="flex items-center gap-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 px-3.5 py-2 rounded-xl text-sm font-bold transition border border-sky-500/20 cursor-pointer" 
                          title="Añadir stock" 
                          onClick={() => {
                            setRepuestoSeleccionado(item);
                            setIsStockModalOpen(true);
                          }}
                        >
                          <LayersPlus size={16} />
                          + Stock
                        </button>
                        <button 
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer" 
                          title="Eliminar Repuesto" 
                          onClick={() => {
                            setRepuestoSeleccionado(item);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
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

      {/* Modal Nuevo Repuesto */}
      {isNuevoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={() => setIsNuevoModalOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Agregar Nuevo Insumo / Repuesto</h3>
              <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" onClick={() => setIsNuevoModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCrearRepuesto} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Nombre del Insumo</label>
                <input 
                  type="text" 
                  placeholder="Ej: Pantalla iPhone 13, Conector USB-C" 
                  required 
                  value={nuevoRepuesto.nombre}
                  onChange={(e) => setNuevoRepuesto({ ...nuevoRepuesto, nombre: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Stock Inicial</label>
                  <input 
                    type="number" 
                    min="0" 
                    placeholder="Ej: 5" 
                    value={nuevoRepuesto.cantidadDisponible}
                    onChange={(e) => setNuevoRepuesto({ ...nuevoRepuesto, cantidadDisponible: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Costo Unitario</label>
                  <InputMoneda 
                    placeholder="Ej: $ 15.000"
                    value={nuevoRepuesto.costoUnitario}
                    onChange={(val) => setNuevoRepuesto({ ...nuevoRepuesto, costoUnitario: val })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="button" 
                  className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                  onClick={() => setIsNuevoModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-base font-bold transition shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sumar Stock */}
      {isStockModalOpen && repuestoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={() => setIsStockModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Añadir Stock</h3>
              <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" onClick={() => setIsStockModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSumarStock} className="space-y-4">
              <p className="text-base font-medium text-slate-600 dark:text-slate-300">
                Repuesto: <strong className="text-sky-500">{repuestoSeleccionado.nombre}</strong>
              </p>

              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Cantidad a ingresar</label>
                <input 
                  type="number" 
                  min="1" 
                  required 
                  value={cantidadSumar}
                  onChange={(e) => setCantidadSumar(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="button" 
                  className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                  onClick={() => setIsStockModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-base font-bold transition shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  Sumar al Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {isDeleteModalOpen && repuestoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-extrabold tracking-tight text-rose-500">Confirmar Eliminación</h3>
              <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" onClick={() => setIsDeleteModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <p className="text-base font-medium text-slate-600 dark:text-slate-300">
              ¿Estás seguro de que deseas eliminar <strong className="text-slate-900 dark:text-white">{repuestoSeleccionado.nombre}</strong> del inventario? Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button 
                type="button" 
                className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleEliminarRepuesto}
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl text-base font-bold transition shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
