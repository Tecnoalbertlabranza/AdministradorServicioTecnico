import { useState, useEffect } from 'react';
import { equipoVentaService } from '../services/equipoVentaService';
import { formatearMoneda } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import FormularioNuevoEquipo from '../components/FormularioNuevoEquipo';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';
import ModalCierreVenta from '../components/ModalCierreVenta';
import { Plus, RefreshCw, DollarSign, Edit2, Trash2 } from 'lucide-react';

const EquiposVenta = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
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
      case 'EN_TALLER': return 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-500/40';
      case 'PUBLICADO': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40';
      case 'VENDIDO': return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';
      default: return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';
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
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Encabezado */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Gestión de Equipos a la Venta
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Vitrina comercial, reacondicionamiento y registro de ofertas
          </p>
        </div>
        <button 
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold px-4 py-2.5 rounded-xl transition duration-200 shadow-md shadow-sky-500/20 cursor-pointer" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          Nuevo Equipo a la Venta
        </button>
      </div>

      {/* Contenedor Principal */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Vitrina Actual
          </h2>
          <button 
            onClick={cargarEquipos} 
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border text-xs transition shadow-sm cursor-pointer ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Cargando...' : 'Refrescar'}
          </button>
        </div>

        {loading ? (
          <Spinner text="Cargando vitrina..." />
        ) : equipos.length === 0 ? (
          <div className={`p-12 text-center text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No hay equipos publicados actualmente.
          </div>
        ) : (
          <div className="overflow-x-auto w-full mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'border-slate-800 text-slate-400 bg-slate-950/40' : 'border-slate-200 text-slate-500 bg-slate-50'
                }`}>
                  <th className="py-3.5 px-4">Foto</th>
                  <th className="py-3.5 px-4">Título y Categoría</th>
                  <th className="py-3.5 px-4">Condición</th>
                  <th className="py-3.5 px-4">Precio Venta</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {equipos.map((equipo) => {
                  const portada = equipo.imagenes?.find(img => img.esPortada)?.urlImagen;
                  const isVendido = equipo.estadoInventario === 'VENDIDO';
                  
                  return (
                    <tr key={equipo.id} className={`transition ${isVendido ? 'opacity-60' : ''} ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}>
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
                        <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{equipo.titulo}</div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{equipo.nombreCategoria || 'Sin Categoría'}</div>
                      </td>
                      <td className={`py-3.5 px-4 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {equipo.condicionEstetica}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-500 text-sm">
                        {formatearMoneda(equipo.precioVenta)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-block ${getStatusBadgeClass(equipo.estadoInventario)}`}>
                          {getStatusText(equipo.estadoInventario)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className={`p-1.5 rounded-lg border transition ${
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
                            className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition cursor-pointer" 
                            title="Editar Equipo" 
                            onClick={() => toast('Función en desarrollo', { icon: '🚧' })}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer" 
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
