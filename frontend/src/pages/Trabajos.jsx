import { useState, useEffect } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { trabajoService } from '../services/trabajoService';
import { inventarioService } from '../services/inventarioService';
import { clienteService } from '../services/clienteService';
import { formatearFecha } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import InputMoneda from '../components/InputMoneda';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import ModalDetalleTrabajo from '../components/ModalDetalleTrabajo';
import { Eye, Plus, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react';

const COLUMNAS_ESTADOS = [
  { 
    id: 'PENDIENTE', 
    titulo: 'Pendiente', 
    badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50' 
  },
  { 
    id: 'EN_REVISION', 
    titulo: 'En Revisión', 
    badge: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800/50' 
  },
  { 
    id: 'ESPERANDO_REPUESTO', 
    titulo: 'Esperando Repuesto', 
    badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' 
  },
  { 
    id: 'FINALIZADO', 
    titulo: 'Finalizado / Listo', 
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' 
  },
  { 
    id: 'ENTREGADO', 
    titulo: 'Entregado', 
    badge: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50' 
  }
];

const getSelectStyles = (isDark) => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: state.isFocused ? '#0284c7' : isDark ? '#334155' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(2, 132, 199, 0.2)' : 'none',
    padding: '0.25rem',
    borderRadius: '0.75rem',
    fontSize: '0.95rem',
    color: isDark ? '#f8fafc' : '#0f172a',
    '&:hover': {
      borderColor: '#0284c7'
    }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '0.75rem',
    boxShadow: isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 100
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#0284c7'
      : state.isFocused
      ? isDark ? 'rgba(2, 132, 199, 0.2)' : '#f1f5f9'
      : 'transparent',
    color: state.isDisabled ? '#ef4444' : isDark ? '#f8fafc' : '#0f172a',
    fontSize: '0.95rem',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer'
  }),
  singleValue: (base) => ({
    ...base,
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: '0.95rem'
  }),
  input: (base) => ({
    ...base,
    color: isDark ? '#f8fafc' : '#0f172a',
    fontSize: '0.95rem'
  }),
  placeholder: (base) => ({
    ...base,
    color: isDark ? '#64748b' : '#94a3b8',
    fontSize: '0.95rem'
  })
});

const Trabajos = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [inventario, setInventario] = useState([]);
  const [clientes, setClientes] = useState([]);
  
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTrabajo, setNewTrabajo] = useState({
    cliente: '', plataforma: 'Local', contacto: '', 
    equipo: '', modelo: '', servicio: '', 
    precioTotal: '', abono: '', idRepuesto: ''
  });

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    cargarTrabajos();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    cargarInventario();
    cargarClientes();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getMonthName = (m) => {
    const d = new Date(2000, m - 1, 1);
    return d.toLocaleString('es-ES', { month: 'long' });
  };

  const filteredTrabajos = trabajos.filter(t => {
    const term = searchTerm.toLowerCase();
    const matchSearch = (t.equipo?.toLowerCase().includes(term)) || 
                        (t.cliente?.nombre?.toLowerCase().includes(term)) || 
                        (t.servicio?.toLowerCase().includes(term));
    const matchEstado = filtroEstado === 'Todos' ? true : (t.estado || 'PENDIENTE') === filtroEstado;
    return matchSearch && matchEstado;
  });

  const getEstadoBadgeClass = (estado) => {
    const item = COLUMNAS_ESTADOS.find(c => c.id === estado);
    return item ? item.badge : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  };

  const handleVerDetalles = (trabajo) => {
    setSelectedTrabajo(trabajo);
    setIsDetalleModalOpen(true);
  };

  const cargarTrabajos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trabajoService.obtenerTodos(currentMonth, currentYear);
      data.sort((a, b) => a.idTrabajo - b.idTrabajo);
      setTrabajos(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los trabajos');
    } finally {
      setLoading(false);
    }
  };

  const cargarInventario = async () => {
    try {
      const data = await inventarioService.obtenerTodo();
      setInventario(data);
    } catch (err) {
      console.error('Error al cargar inventario', err);
    }
  };

  const cargarClientes = async () => {
    try {
      const data = await clienteService.obtenerTodos();
      setClientes(data);
    } catch (err) {
      console.error('Error al cargar clientes', err);
    }
  };

  const handleGuardarTrabajo = async (e) => {
    e.preventDefault();
    const payload = {
      nombreCliente: newTrabajo.cliente,
      plataforma: newTrabajo.plataforma,
      contacto: newTrabajo.contacto,
      equipo: newTrabajo.equipo,
      modelo: newTrabajo.modelo,
      servicio: newTrabajo.servicio,
      precioTotal: parseFloat(newTrabajo.precioTotal) || 0,
      abono: parseFloat(newTrabajo.abono) || 0,
      idRepuestoUtilizado: newTrabajo.idRepuesto ? parseInt(newTrabajo.idRepuesto) : null
    };

    try {
      await trabajoService.crear(payload);
      toast.success('Trabajo creado correctamente');
      setIsModalOpen(false);
      setNewTrabajo({ cliente: '', plataforma: 'Local', contacto: '', equipo: '', modelo: '', servicio: '', precioTotal: '', abono: '', idRepuesto: '' });
      await cargarTrabajos();
      await cargarInventario();
      await cargarClientes();
    } catch (err) {
      toast.error(err.message || 'Error al crear el trabajo');
    }
  };

  const inventoryOptions = inventario.map(item => ({
    value: item.idRepuesto.toString(),
    label: `${item.nombre} - Stock: ${item.cantidadDisponible} ${item.costoUnitario ? `(Costo: $${item.costoUnitario})` : ''}`,
    isDisabled: item.cantidadDisponible === 0
  }));

  const selectedInventoryOption = inventoryOptions.find(op => op.value === newTrabajo.idRepuesto) || null;

  const plataformaOptions = [
    { value: 'Local', label: 'Local (Presencial)' },
    { value: 'WhatsApp', label: 'WhatsApp' },
    { value: 'Instagram', label: 'Instagram' }
  ];
  
  const selectedPlataformaOption = plataformaOptions.find(op => op.value === newTrabajo.plataforma) || plataformaOptions[0];

  const clienteOptions = clientes.map(c => ({
    value: c.nombre,
    label: c.nombre,
    cliente: c
  }));

  const handleClienteChange = (selected, actionMeta) => {
    if (!selected) {
      setNewTrabajo({...newTrabajo, cliente: '', plataforma: 'Local', contacto: ''});
      return;
    }
    
    if (actionMeta.action === 'select-option' && selected.cliente) {
      let plat = 'Local';
      let cont = '';
      if (selected.cliente.whatsapp) {
        plat = 'WhatsApp';
        cont = selected.cliente.whatsapp;
      } else if (selected.cliente.instagram) {
        plat = 'Instagram';
        cont = selected.cliente.instagram;
      }
      setNewTrabajo({...newTrabajo, cliente: selected.value, plataforma: plat, contacto: cont});
    } else {
      setNewTrabajo({...newTrabajo, cliente: selected.value});
    }
  };

  const selectStyles = getSelectStyles(isDark);

  return (
    <div className="w-full min-h-screen p-4 md:p-6 space-y-6 transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Gestor de Trabajos
          </h1>
          <p className="text-base mt-1 font-medium text-slate-500 dark:text-slate-400">
            Control integral de servicios técnicos, entregas y estados
          </p>
        </div>
      </div>

      {/* Toolbar de Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <SearchBar 
          placeholder="Buscar por equipo, cliente o falla..." 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
        <div className="flex flex-wrap items-center gap-3">
          <button 
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-sm md:text-base px-5 py-2.5 rounded-xl transition duration-200 shadow-md shadow-sky-500/20 cursor-pointer" 
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
            Nuevo Trabajo Manual
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm md:text-base border transition shadow-sm cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700" 
            onClick={cargarTrabajos} 
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Cargando...' : 'Refrescar Tablero'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 font-semibold text-base">
          {error}
        </div>
      )}

      {loading && trabajos.length === 0 ? (
        <Spinner text="Cargando trabajos..." />
      ) : (
        <div className="p-6 rounded-2xl border bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
          {/* Navegación por pestañas y filtro de mes */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            {/* Pestañas de estado */}
            <div className="flex flex-wrap gap-2 p-2 rounded-xl border bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  filtroEstado === 'Todos'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                }`}
                onClick={() => setFiltroEstado('Todos')}
              >
                Todos
              </button>
              {COLUMNAS_ESTADOS.map((col) => (
                <button
                  key={col.id}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    filtroEstado === col.id
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setFiltroEstado(col.id)}
                >
                  {col.titulo}
                </button>
              ))}
            </div>

            {/* Selector de Mes */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border text-base font-bold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white">
              <button 
                onClick={handlePrevMonth} 
                className="p-1 hover:text-sky-500 transition cursor-pointer"
                title="Mes Anterior"
              >
                <ChevronLeft size={22} />
              </button>
              <span className="capitalize min-w-[140px] text-center font-extrabold">
                {getMonthName(currentMonth)} {currentYear}
              </span>
              <button 
                onClick={handleNextMonth} 
                className="p-1 hover:text-sky-500 transition cursor-pointer"
                title="Mes Siguiente"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          {filteredTrabajos.length === 0 ? (
            <div className="p-12 text-center text-base font-semibold text-slate-500 dark:text-slate-400">
              No se encontraron trabajos para este filtro.
            </div>
          ) : (
            <div className="overflow-x-auto w-full rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg bg-white dark:bg-slate-900/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100/80 dark:bg-slate-950/80">
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">ID / Fecha</th>
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Cliente</th>
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Equipo y Modelo</th>
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Estado</th>
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {filteredTrabajos.map((trabajo) => (
                    <tr key={trabajo.idTrabajo} className="hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors duration-150 ease-in-out cursor-pointer">
                      <td className="py-4 px-4">
                        <div className="font-mono text-sm font-bold text-slate-400 dark:text-slate-500">#{trabajo.idTrabajo}</div>
                        <div className="text-sm mt-0.5 font-medium text-slate-600 dark:text-slate-300">{formatearFecha(trabajo.fechaIngreso)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-base text-slate-900 dark:text-white">
                          {trabajo.cliente?.nombre || 'Sin registrar'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-base text-slate-800 dark:text-slate-100">{trabajo.equipo}</div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{trabajo.modelo || 'Genérico'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3.5 py-1.5 rounded-full text-sm font-bold border inline-block ${getEstadoBadgeClass(trabajo.estado || 'PENDIENTE')}`}>
                          {(trabajo.estado || 'PENDIENTE').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          className="flex items-center gap-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 px-4 py-2 rounded-xl text-sm font-bold transition border border-sky-500/20 cursor-pointer" 
                          onClick={() => handleVerDetalles(trabajo)}
                          title="Ver Detalles"
                        >
                          <Eye size={16} />
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Detalle Trabajo */}
      <ModalDetalleTrabajo
        isOpen={isDetalleModalOpen}
        onClose={() => setIsDetalleModalOpen(false)}
        trabajo={selectedTrabajo}
        onUpdate={cargarTrabajos}
      />

      {/* Modal Nuevo Trabajo Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border p-6 shadow-2xl space-y-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Nuevo Trabajo Manual</h2>
              <button 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleGuardarTrabajo} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna Izquierda: Cliente y Cobros */}
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold uppercase tracking-wider text-sky-500">Datos del Cliente</h3>
                  
                  <div>
                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Nombre</label>
                    <CreatableSelect
                      options={clienteOptions}
                      styles={selectStyles}
                      placeholder="Selecciona o escribe un nombre..."
                      value={newTrabajo.cliente ? { label: newTrabajo.cliente, value: newTrabajo.cliente } : null}
                      onChange={handleClienteChange}
                      formatCreateLabel={(inputValue) => `Crear nuevo cliente: "${inputValue}"`}
                      noOptionsMessage={() => "No se encontraron clientes"}
                      isClearable
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Plataforma de Contacto</label>
                    <Select
                      options={plataformaOptions}
                      styles={selectStyles}
                      value={selectedPlataformaOption}
                      onChange={(selected) => setNewTrabajo({...newTrabajo, plataforma: selected ? selected.value : 'Local'})}
                      isSearchable={false}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Contacto (Número o @usuario)</label>
                    <input 
                      type="text" 
                      placeholder={newTrabajo.plataforma === 'WhatsApp' ? 'Ej: +56912345678' : newTrabajo.plataforma === 'Instagram' ? 'Ej: @usuario' : 'No aplica'} 
                      disabled={newTrabajo.plataforma === 'Local'}
                      value={newTrabajo.plataforma === 'Local' ? '' : newTrabajo.contacto} 
                      onChange={(e) => setNewTrabajo({...newTrabajo, contacto: e.target.value})} 
                      className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed focus:border-sky-500"
                    />
                  </div>

                  <h3 className="text-base font-extrabold uppercase tracking-wider text-sky-500 pt-2">Cobros</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Precio Total</label>
                      <InputMoneda 
                        placeholder="Ej: $ 150.000" 
                        required
                        value={newTrabajo.precioTotal} 
                        onChange={(val) => setNewTrabajo({...newTrabajo, precioTotal: val})} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Abono Inicial</label>
                      <InputMoneda 
                        placeholder="Ej: $ 50.000"
                        value={newTrabajo.abono} 
                        onChange={(val) => setNewTrabajo({...newTrabajo, abono: val})} 
                      />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Equipo e Inventario */}
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold uppercase tracking-wider text-sky-500">Datos del Equipo</h3>
                  
                  <div>
                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Equipo</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Laptop, Consola, Celular" 
                      required 
                      value={newTrabajo.equipo} 
                      onChange={(e) => setNewTrabajo({...newTrabajo, equipo: e.target.value})} 
                      className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Modelo</label>
                    <input 
                      type="text" 
                      placeholder="Ej: HP Pavilion, PS5" 
                      value={newTrabajo.modelo} 
                      onChange={(e) => setNewTrabajo({...newTrabajo, modelo: e.target.value})} 
                      className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Falla / Servicio a realizar</label>
                    <textarea 
                      placeholder="Ej: Cambio de pantalla" 
                      required 
                      rows="3" 
                      value={newTrabajo.servicio} 
                      onChange={(e) => setNewTrabajo({...newTrabajo, servicio: e.target.value})} 
                      className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500"
                    />
                  </div>

                  <h3 className="text-base font-extrabold uppercase tracking-wider text-sky-500 pt-2">Inventario</h3>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Repuesto a utilizar (Opcional)</label>
                    <Select
                      options={inventoryOptions}
                      styles={selectStyles}
                      placeholder="Buscar repuesto..."
                      isClearable
                      noOptionsMessage={() => "No se encontraron repuestos"}
                      value={selectedInventoryOption}
                      onChange={(selected) => setNewTrabajo({...newTrabajo, idRepuesto: selected ? selected.value : ''})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="button" 
                  className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-base font-bold transition shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  Guardar Trabajo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trabajos;
