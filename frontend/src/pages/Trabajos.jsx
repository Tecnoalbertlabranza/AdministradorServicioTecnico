import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import DocumentoServicio from '../components/DocumentoServicio';
import ModalInformeIA from '../components/ModalInformeIA';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { trabajoService } from '../services/trabajoService';
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

const Trabajos = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [columnsData, setColumnsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [printData, setPrintData] = useState({ trabajo: null, tipoDoc: 'INGRESO' });
  const [isPrinting, setIsPrinting] = useState(false);
  const [modalIAOpen, setModalIAOpen] = useState(false);
  const [trabajoIA, setTrabajoIA] = useState(null);
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
        <button className="btn-secondary" onClick={cargarTrabajos} disabled={loading}>
          {loading ? '↻ Cargando...' : '↻ Refrescar Tablero'}
        </button>
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
    </div>
  );
};

export default Trabajos;
