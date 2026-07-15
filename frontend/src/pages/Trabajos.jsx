import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { trabajoService } from '../services/trabajoService';
import SearchBar from '../components/SearchBar';
import './Trabajos.css';

const COLUMNAS_ESTADOS = [
  { id: 'PENDIENTE', titulo: 'Pendiente', color: 'var(--accent-warning)' },
  { id: 'EN_REVISION', titulo: 'En Revisión', color: 'var(--accent-primary)' },
  { id: 'ESPERANDO_REPUESTO', titulo: 'Esperando Repuesto', color: 'var(--accent-danger)' },
  { id: 'FINALIZADO', titulo: 'Finalizado / Listo', color: 'var(--accent-success)' },
  { id: 'ENTREGADO', titulo: 'Entregado', color: 'var(--text-muted)' }
];

const Trabajos = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [columnsData, setColumnsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarTrabajos();
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
      // TODO: Llamar al endpoint PATCH del backend justo donde debería ir la petición para actualizar el estado en la base de datos real en el futuro.
      // Ejemplo: await trabajoService.actualizarEstado(movedItem.idTrabajo, destColumnId);
      console.log(`Simulando PATCH /api/trabajos/${movedItem.idTrabajo}/estado con nuevo estado: ${destColumnId}`);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
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
        <button className="btn-secondary" onClick={cargarTrabajos} disabled={loading}>
          {loading ? '↻ Cargando...' : '↻ Refrescar Tablero'}
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

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
                                <span className="card-id">#{trabajo.idTrabajo}</span>
                                <span className="card-date">{formatDate(trabajo.fechaIngreso)}</span>
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
    </div>
  );
};

export default Trabajos;
