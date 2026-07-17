import { useState, useEffect } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { trabajoService } from '../services/trabajoService';
import { inventarioService } from '../services/inventarioService';
import { clienteService } from '../services/clienteService';
import { formatearFecha, formatearMoneda } from '../utils/formatters';
import ModalInformeIA from '../components/ModalInformeIA';
import InputMoneda from '../components/InputMoneda';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import ModalDetalleTrabajo from '../components/ModalDetalleTrabajo';
import './Trabajos.css';

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const COLUMNAS_ESTADOS = [
  { id: 'PENDIENTE', titulo: 'Pendiente', color: 'var(--accent-warning)' },
  { id: 'EN_REVISION', titulo: 'En Revisión', color: 'var(--accent-primary)' },
  { id: 'ESPERANDO_REPUESTO', titulo: 'Esperando Repuesto', color: 'var(--accent-danger)' },
  { id: 'FINALIZADO', titulo: 'Finalizado / Listo', color: 'var(--accent-success)' },
  { id: 'ENTREGADO', titulo: 'Entregado', color: '#a855f7' }
];

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--bg-primary, #1e293b)',
    borderColor: state.isFocused ? 'var(--accent-primary, #3b82f6)' : 'var(--border-color, #334155)',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
    padding: '0.15rem',
    borderRadius: 'var(--radius-md, 0.375rem)',
    '&:hover': {
      borderColor: 'var(--accent-primary, #3b82f6)'
    }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--bg-surface, #0f172a)',
    border: '1px solid var(--border-color, #334155)',
    zIndex: 100
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--accent-primary, #3b82f6)'
      : state.isFocused
      ? 'rgba(59, 130, 246, 0.1)'
      : 'transparent',
    color: state.isDisabled ? '#ef4444' : 'var(--text-primary, #f8fafc)',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    fontStyle: state.isDisabled ? 'italic' : 'normal',
    '&:active': {
      backgroundColor: state.isDisabled ? 'transparent' : 'var(--accent-primary, #3b82f6)'
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--text-primary, #f8fafc)'
  }),
  input: (base) => ({
    ...base,
    color: 'var(--text-primary, #f8fafc)'
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--text-muted, #94a3b8)'
  })
};

const Trabajos = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [inventario, setInventario] = useState([]);
  const [clientes, setClientes] = useState([]);
  
  // Estado para el modal de detalle
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  
  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrabajo, setNewTrabajo] = useState({
    cliente: '', plataforma: 'Local', contacto: '', 
    equipo: '', modelo: '', servicio: '', 
    precioTotal: '', abono: '', idRepuesto: ''
  });

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1 a 12
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
    switch(estado) {
      case 'PENDIENTE': return 'status-badge status-pendiente';
      case 'FINALIZADO': return 'status-badge status-finalizado';
      case 'ENTREGADO': return 'status-badge status-entregado';
      case 'ESPERANDO_REPUESTO': return 'status-badge status-error';
      case 'EN_REVISION': return 'status-badge status-primary';
      default: return 'status-badge';
    }
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
      // Ordenar por ID para consistencia visual (los más antiguos primero)
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
      await cargarInventario(); // Refrescar inventario por si se descontó
      await cargarClientes(); // Refrescar por si se creó uno nuevo
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
      // Autocompletar plataforma y contacto
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

  const getContactoConfig = () => {
    switch (newTrabajo.plataforma) {
      case 'WhatsApp': return { placeholder: 'Ej: +56912345678', disabled: false };
      case 'Instagram': return { placeholder: 'Ej: @usuario', disabled: false };
      default: return { placeholder: 'No aplica', disabled: true };
    }
  };
  const contactoConfig = getContactoConfig();

  const TabsNav = () => (
    <div className="tabs-container">
      <button 
        className={`tab-btn ${filtroEstado === 'Todos' ? 'active' : ''}`}
        onClick={() => setFiltroEstado('Todos')}
      >
        Todos
      </button>
      {COLUMNAS_ESTADOS.map(col => (
        <button
          key={col.id}
          className={`tab-btn ${filtroEstado === col.id ? 'active' : ''}`}
          onClick={() => setFiltroEstado(col.id)}
          style={filtroEstado === col.id ? { borderBottomColor: col.color, color: col.color } : {}}
        >
          {col.titulo}
        </button>
      ))}
    </div>
  );

  return (
    <div className="layout-page-container">
      <div className="trabajos-header">
        <h1 className="trabajos-title">Gestor de Trabajos</h1>
      </div>

      <div className="trabajos-toolbar">
        <SearchBar 
          placeholder="Buscar por equipo, cliente o falla..." 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + Nuevo Trabajo Manual
          </button>
          <button className="btn-secondary" onClick={cargarTrabajos} disabled={loading}>
            {loading ? '↻ Cargando...' : '↻ Refrescar Tablero'}
          </button>
        </div>
      </div>

      {error && <div className="error-state">{error}</div>}

      {loading && trabajos.length === 0 ? (
        <Spinner text="Cargando trabajos..." />
      ) : (
        <div className="data-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <TabsNav />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-primary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>&lsaquo;</button>
              <span style={{ fontWeight: '500', textTransform: 'capitalize', minWidth: '120px', textAlign: 'center', color: 'var(--text-primary)' }}>
                {getMonthName(currentMonth)} {currentYear}
              </span>
              <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>&rsaquo;</button>
            </div>
          </div>

          {filteredTrabajos.length === 0 ? (
            <div className="empty-state">No se encontraron trabajos para este filtro.</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID / Fecha</th>
                    <th>Cliente</th>
                    <th>Equipo y Modelo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrabajos.map(trabajo => (
                    <tr key={trabajo.idTrabajo}>
                      <td>
                        <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{trabajo.idTrabajo}</div>
                        <div style={{ fontSize: '0.85rem' }}>{formatearFecha(trabajo.fechaIngreso)}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{trabajo.cliente?.nombre || 'Sin registrar'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{trabajo.equipo}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{trabajo.modelo || 'Genérico'}</div>
                      </td>
                      <td>
                        <span className={getEstadoBadgeClass(trabajo.estado || 'PENDIENTE')}>
                          {(trabajo.estado || 'PENDIENTE').replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-action" 
                          onClick={() => handleVerDetalles(trabajo)}
                          title="Ver Detalles"
                        >
                          <IconEye />
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

      <ModalDetalleTrabajo
        isOpen={isDetalleModalOpen}
        onClose={() => setIsDetalleModalOpen(false)}
        trabajo={selectedTrabajo}
        onUpdate={cargarTrabajos}
      />

      {/* Modal Nuevo Trabajo Manual (2 columnas) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-large">
            <div className="modal-header">
              <h2>Nuevo Trabajo Manual</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form className="modal-form" onSubmit={handleGuardarTrabajo}>
              <div className="modal-grid">
                
                {/* Columna Izquierda: Cliente y Cobros */}
                <div className="modal-grid-col">
                  <h3 className="section-title">Datos del Cliente</h3>
                  <div className="form-group">
                    <label>Nombre</label>
                    <CreatableSelect
                      options={clienteOptions}
                      styles={customSelectStyles}
                      placeholder="Selecciona o escribe un nombre..."
                      value={newTrabajo.cliente ? { label: newTrabajo.cliente, value: newTrabajo.cliente } : null}
                      onChange={handleClienteChange}
                      formatCreateLabel={(inputValue) => `Crear nuevo cliente: "${inputValue}"`}
                      noOptionsMessage={() => "No se encontraron clientes"}
                      isClearable
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Plataforma de Contacto</label>
                    <Select
                      options={plataformaOptions}
                      styles={customSelectStyles}
                      value={selectedPlataformaOption}
                      onChange={(selected) => setNewTrabajo({...newTrabajo, plataforma: selected ? selected.value : 'Local'})}
                      isSearchable={false}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contacto (Número o @usuario)</label>
                    <input type="text" 
                      placeholder={contactoConfig.placeholder} 
                      disabled={contactoConfig.disabled}
                      value={contactoConfig.disabled ? '' : newTrabajo.contacto} 
                      onChange={(e) => setNewTrabajo({...newTrabajo, contacto: e.target.value})} 
                      style={contactoConfig.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    />
                  </div>

                  <h3 className="section-title mt-4">Cobros</h3>
                  <div className="form-group">
                    <label>Precio Total a Cobrar</label>
                    <InputMoneda placeholder="Ej: $ 150.000" required
                      value={newTrabajo.precioTotal} onChange={(val) => setNewTrabajo({...newTrabajo, precioTotal: val})} />
                  </div>
                  <div className="form-group">
                    <label>Abono Inicial</label>
                    <InputMoneda placeholder="Ej: $ 50.000"
                      value={newTrabajo.abono} onChange={(val) => setNewTrabajo({...newTrabajo, abono: val})} />
                  </div>
                </div>

                {/* Columna Derecha: Equipo e Inventario */}
                <div className="modal-grid-col">
                  <h3 className="section-title">Datos del Equipo</h3>
                  <div className="form-group">
                    <label>Equipo</label>
                    <input type="text" placeholder="Ej: Laptop, Consola, Celular" required 
                      value={newTrabajo.equipo} onChange={(e) => setNewTrabajo({...newTrabajo, equipo: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input type="text" placeholder="Ej: HP Pavilion, PS5" 
                      value={newTrabajo.modelo} onChange={(e) => setNewTrabajo({...newTrabajo, modelo: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Falla / Servicio a realizar</label>
                    <textarea placeholder="Ej: Cambio de pantalla" required rows="3" style={{width:'100%', padding:'0.75rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-color)', backgroundColor:'var(--bg-surface)'}}
                      value={newTrabajo.servicio} onChange={(e) => setNewTrabajo({...newTrabajo, servicio: e.target.value})} />
                  </div>

                  <h3 className="section-title mt-4">Inventario</h3>
                  <div className="form-group">
                    <label>Repuesto a utilizar (Opcional)</label>
                    <Select
                      options={inventoryOptions}
                      styles={customSelectStyles}
                      placeholder="Buscar repuesto..."
                      isClearable
                      noOptionsMessage={() => "No se encontraron repuestos"}
                      value={selectedInventoryOption}
                      onChange={(selected) => setNewTrabajo({...newTrabajo, idRepuesto: selected ? selected.value : ''})}
                    />
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Trabajo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trabajos;
