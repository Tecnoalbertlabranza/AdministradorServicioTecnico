import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import DocumentoServicio from '../components/DocumentoServicio';
import ModalInformeIA from '../components/ModalInformeIA';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { trabajoService } from '../services/trabajoService';
import { inventarioService } from '../services/inventarioService';
import { clienteService } from '../services/clienteService';
import { formatearFecha } from '../utils/formatters';
import { toast } from 'react-hot-toast';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import './Trabajos.css';

const COLUMNAS_ESTADOS = [
  { id: 'PENDIENTE', titulo: 'Pendiente', color: 'var(--accent-warning)' },
  { id: 'EN_REVISION', titulo: 'En Revisión', color: 'var(--accent-primary)' },
  { id: 'ESPERANDO_REPUESTO', titulo: 'Esperando Repuesto', color: 'var(--accent-danger)' },
  { id: 'FINALIZADO', titulo: 'Finalizado / Listo', color: 'var(--accent-success)' },
  { id: 'ENTREGADO', titulo: 'Entregado', color: 'var(--text-muted)' }
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
  const [columnsData, setColumnsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inventario, setInventario] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [printData, setPrintData] = useState({ trabajo: null, tipoDoc: 'INGRESO' });
  const [isPrinting, setIsPrinting] = useState(false);
  const [modalIAOpen, setModalIAOpen] = useState(false);
  const [trabajoIA, setTrabajoIA] = useState(null);
  
  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrabajo, setNewTrabajo] = useState({
    cliente: '', plataforma: 'Local', contacto: '', 
    equipo: '', modelo: '', servicio: '', 
    precioTotal: '', abono: '', idRepuesto: ''
  });

  const printComponentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: 'Documento_TecnoAlbert',
    onAfterPrint: () => {
      setPrintData({ trabajo: null, tipoDoc: 'INGRESO' });
      toast.success('Documento generado correctamente');
    },
    onPrintError: (error) => {
      console.error('Error al imprimir:', error);
      toast.error('Error al abrir la ventana de impresión');
    }
  });

  const triggerPrint = (e, trabajo, tipo) => {
    e.stopPropagation();
    if (tipo === 'ENTREGA') {
      setTrabajoIA(trabajo);
      setModalIAOpen(true);
    } else {
      setPrintData({ trabajo, tipoDoc: tipo });
      setIsPrinting(true);
    }
  };

  useEffect(() => {
    if (isPrinting && printData.trabajo && printComponentRef.current) {
      handlePrint();
      setIsPrinting(false);
    }
  }, [isPrinting, printData, handlePrint]);

  useEffect(() => {
    cargarTrabajos();
    cargarInventario();
    cargarClientes();
  }, []);

  useEffect(() => {
    // Reconstruir las columnas cuando cambian los datos o el buscador
    const term = searchTerm.toLowerCase();
    const filtered = trabajos.filter(t => {
      const matchEquipo = t.equipo?.toLowerCase().includes(term);
      const matchCliente = t.cliente?.nombre?.toLowerCase().includes(term);
      const matchFalla = t.servicio?.toLowerCase().includes(term);
      return matchEquipo || matchCliente || matchFalla;
    });

    const newColumns = {};
    COLUMNAS_ESTADOS.forEach(col => {
      newColumns[col.id] = filtered.filter(t => (t.estado || 'PENDIENTE') === col.id);
    });
    setColumnsData(newColumns);
  }, [trabajos, searchTerm]);

  const cargarTrabajos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trabajoService.obtenerTodos();
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

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Validar si hay destino y si cambió de lugar
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumnId = source.droppableId;
    const destColumnId = destination.droppableId;

    // Obtener los arrays de origen y destino
    const sourceItems = Array.from(columnsData[sourceColumnId]);
    const destItems = sourceColumnId === destColumnId ? sourceItems : Array.from(columnsData[destColumnId]);
    
    // Remover el item arrastrado
    const [movedItem] = sourceItems.splice(source.index, 1);
    
    // Cambiar estado en el objeto
    const itemToInsert = { ...movedItem, estado: destColumnId };
    
    // Insertar en la nueva posición
    destItems.splice(destination.index, 0, itemToInsert);

    // Actualizar columnas en la UI de inmediato (Optimistic UI)
    setColumnsData(prev => ({
      ...prev,
      [sourceColumnId]: sourceItems,
      [destColumnId]: destItems
    }));

    // Sincronizar el array principal
    setTrabajos(prev => prev.map(t => t.idTrabajo.toString() === draggableId ? itemToInsert : t));

    // Si cambió de columna, enviar al servidor
    if (sourceColumnId !== destColumnId) {
      try {
        await trabajoService.actualizarEstado(movedItem.idTrabajo, destColumnId);
        toast.success(`Trabajo movido a ${COLUMNAS_ESTADOS.find(c => c.id === destColumnId).titulo}`);
      } catch (err) {
        // Revertir en caso de error
        toast.error('Error al actualizar el estado. Se revirtió el cambio.');
        cargarTrabajos(); // recargar para recuperar el estado original
      }
    }
  };

  return (
    <div className="layout-page-container">
      <div className="trabajos-header">
        <h1 className="trabajos-title">Tablero Kanban de Trabajos</h1>
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
        <Spinner text="Cargando tablero kanban..." />
      ) : (
        <div className="kanban-scroll-container">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board">
              {COLUMNAS_ESTADOS.map((columna) => (
                <div key={columna.id} className="kanban-column">
                  <div className="kanban-column-header" style={{ borderTop: `3px solid ${columna.color}` }}>
                    <h3>{columna.titulo}</h3>
                    <span className="kanban-column-count">
                      {columnsData[columna.id]?.length || 0}
                    </span>
                  </div>
                  
                  <Droppable droppableId={columna.id}>
                    {(provided, snapshot) => (
                      <div 
                        className={`kanban-droppable-area ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {columnsData[columna.id]?.map((trabajo, index) => (
                          <Draggable 
                            key={trabajo.idTrabajo.toString()} 
                            draggableId={trabajo.idTrabajo.toString()} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                className={`kanban-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="card-header">
                                  <div>
                                    <span className="card-id">#{trabajo.idTrabajo}</span>
                                    <span className="card-date">{formatearFecha(trabajo.fechaIngreso)}</span>
                                  </div>
                                  <div className="card-print-actions">
                                    <button 
                                      className="btn-print-icon" 
                                      onClick={(e) => triggerPrint(e, trabajo, 'INGRESO')} 
                                      title="Imprimir Orden de Ingreso"
                                    >📥</button>
                                    <button 
                                      className="btn-print-icon" 
                                      onClick={(e) => triggerPrint(e, trabajo, 'ENTREGA')} 
                                      title="Imprimir Informe de Entrega"
                                    >📤</button>
                                  </div>
                                </div>
                                <h4 className="card-equipo">{trabajo.equipo}</h4>
                                <div className="card-cliente">{trabajo.cliente?.nombre || 'Sin registrar'}</div>
                                <div className="card-servicio">{trabajo.servicio}</div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Hidden print component (hidden via CSS class) - Solo para INGRESO */}
      <DocumentoServicio 
        ref={printComponentRef} 
        trabajo={printData.trabajo} 
        tipoDoc={printData.tipoDoc} 
      />

      <ModalInformeIA 
        isOpen={modalIAOpen}
        onClose={() => setModalIAOpen(false)}
        trabajo={trabajoIA}
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
                    <input type="number" placeholder="Ej: 150000" required min="0"
                      value={newTrabajo.precioTotal} onChange={(e) => setNewTrabajo({...newTrabajo, precioTotal: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Abono Inicial</label>
                    <input type="number" placeholder="Ej: 50000" min="0"
                      value={newTrabajo.abono} onChange={(e) => setNewTrabajo({...newTrabajo, abono: e.target.value})} />
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
