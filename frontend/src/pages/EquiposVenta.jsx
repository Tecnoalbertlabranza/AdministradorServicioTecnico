import { useState, useEffect } from 'react';
import { equipoVentaService } from '../services/equipoVentaService';
import { formatearMoneda } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import FormularioNuevoEquipo from '../components/FormularioNuevoEquipo';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';
import ModalCierreVenta from '../components/ModalCierreVenta';
import { Plus, RefreshCw, DollarSign, Edit2, Trash2, LayoutGrid, Table as TableIcon } from 'lucide-react';

const EquiposVenta = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vistaGrid, setVistaGrid] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCierreModalOpen, setIsCierreModalOpen] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = async () => {
    try {
      setLoading(true);
      const data = await equipoVentaService.obtenerTodos();
      setEquipos(data);
    } catch (error) {
      toast.error('Error al cargar la vitrina de equipos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'EN_TALLER': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50';
      case 'PUBLICADO': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50';
      case 'VENDIDO': return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'EN_TALLER': return 'En Taller';
      case 'PUBLICADO': return 'Publicado';
      case 'VENDIDO': return 'Vendido';
      default: return estado;
    }
  };

  const handleAbrirVenta = (equipo) => {
    setEquipoSeleccionado(equipo);
    setIsCierreModalOpen(true);
  };

  return (
    <div className={`w-full min-h-screen p-4 md:p-6 space-y-6 transition-colors duration-300 ${
      isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Encabezado */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border ${
        isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Gestión de Equipos a la Venta
          </h1>
          <p className={`text-base mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Vitrina comercial, reacondicionamiento y registro de ofertas
          </p>
        </div>
        <button 
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-sm md:text-base px-5 py-2.5 rounded-xl transition duration-200 shadow-md shadow-sky-500/20 cursor-pointer" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} />
          Nuevo Equipo a la Venta
        </button>
      </div>

      {/* Contenedor Principal */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'bg-[#1e293b] border-slate-800 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Vitrina Comercial
          </h2>
          <div className="flex items-center gap-3">
            {/* Toggle de Vista */}
            <div className="flex items-center p-1 rounded-xl border bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setVistaGrid(true)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  vistaGrid 
                    ? 'bg-sky-500 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Vista Cuadrícula / Tarjetas"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setVistaGrid(false)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  !vistaGrid 
                    ? 'bg-sky-500 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Vista Tabla"
              >
                <TableIcon size={18} />
              </button>
            </div>

            <button 
              onClick={cargarEquipos} 
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm md:text-base border transition shadow-sm cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Cargando...' : 'Refrescar'}
            </button>
          </div>
        </div>

        {loading ? (
          <Spinner text="Cargando vitrina..." />
        ) : equipos.length === 0 ? (
          <div className={`p-12 text-center text-base font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No hay equipos publicados actualmente.
          </div>
        ) : vistaGrid ? (
          /* Vista Cuadrícula / Tarjetas */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 mt-6">
            {equipos.map((equipo) => {
              const portada = equipo.imagenes?.find(img => img.esPortada)?.urlImagen;
              const isVendido = equipo.estadoInventario === 'VENDIDO';
              
              return (
                <div 
                  key={equipo.id} 
                  className={`backdrop-blur-sm border hover:border-sky-500/50 transition-all duration-200 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4 w-full min-w-[280px] ${
                    isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white/90 border-slate-200'
                  } ${isVendido ? 'opacity-60' : ''}`}
                >
                  <div className="space-y-3">
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      {portada ? (
                        <img src={portada} alt={equipo.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold">
                          Sin foto
                        </div>
                      )}
                      <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${getStatusBadgeClass(equipo.estadoInventario)}`}>
                        {getStatusText(equipo.estadoInventario)}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-bold text-base line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{equipo.titulo}</h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{equipo.nombreCategoria || 'Sin Categoría'}</p>
                    </div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Condición: <strong className="text-slate-900 dark:text-white font-bold">{equipo.condicionEstetica || 'Bueno'}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    <span className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                      {formatearMoneda(equipo.precioVenta)}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        className={`p-2 rounded-xl border transition ${
                          isVendido 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed' 
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 cursor-pointer'
                        }`}
                        title={isVendido ? "El equipo ya fue vendido" : "Vender Equipo"} 
                        onClick={() => !isVendido && handleAbrirVenta(equipo)}
                        disabled={isVendido}
                      >
                        <DollarSign size={18} />
                      </button>
                      <button 
                        className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition cursor-pointer" 
                        title="Editar Equipo" 
                        onClick={() => toast('Función en desarrollo', { icon: '🚧' })}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer" 
                        title="Eliminar Equipo" 
                        onClick={() => toast('Función en desarrollo', { icon: '🚧' })}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Vista Tabla */
          <div className="overflow-x-auto w-full mt-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg bg-white dark:bg-slate-900/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100/80 dark:bg-slate-950/80">
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Foto</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Título y Categoría</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Condición</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Precio Venta</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Estado</th>
                  <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {equipos.map((equipo) => {
                  const portada = equipo.imagenes?.find(img => img.esPortada)?.urlImagen;
                  const isVendido = equipo.estadoInventario === 'VENDIDO';
                  
                  return (
                    <tr key={equipo.id} className={`hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors duration-150 ease-in-out cursor-pointer ${isVendido ? 'opacity-60' : ''}`}>
                      <td className="py-3.5 px-4">
                        {portada ? (
                          <img src={portada} alt={equipo.titulo} className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-950 flex items-center justify-center rounded-xl text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-800">
                            Sin foto
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{equipo.titulo}</div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{equipo.nombreCategoria || 'Sin Categoría'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                        {equipo.condicionEstetica}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                        {formatearMoneda(equipo.precioVenta)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border inline-block ${getStatusBadgeClass(equipo.estadoInventario)}`}>
                          {getStatusText(equipo.estadoInventario)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className={`p-2 rounded-xl border transition ${
                              isVendido 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed' 
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 cursor-pointer'
                            }`}
                            title={isVendido ? "El equipo ya fue vendido" : "Vender Equipo"} 
                            onClick={() => !isVendido && handleAbrirVenta(equipo)}
                            disabled={isVendido}
                          >
                            <DollarSign size={16} />
                          </button>
                          <button 
                            className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition cursor-pointer" 
                            title="Editar Equipo" 
                            onClick={() => toast('Función en desarrollo', { icon: '🚧' })}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer" 
                            title="Eliminar Equipo" 
                            onClick={() => toast('Función en desarrollo', { icon: '🚧' })}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormularioNuevoEquipo 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUpdate={cargarEquipos} 
      />

      <ModalCierreVenta
        isOpen={isCierreModalOpen}
        onClose={() => setIsCierreModalOpen(false)}
        equipo={equipoSeleccionado}
        onVentaExitosa={cargarEquipos}
      />
    </div>
  );
};

export default EquiposVenta;
