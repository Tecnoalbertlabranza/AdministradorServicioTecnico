import { useState, useEffect } from 'react';
import { inventarioService } from '../services/inventarioService';
import SearchBar from '../components/SearchBar';
import './Inventario.css';

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el Modal de Edición
  const [editingItem, setEditingItem] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Estados para el Modal de Eliminación
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventarioService.obtenerTodo();
      // Ordenar por ID para consistencia visual
      data.sort((a, b) => a.idRepuesto - b.idRepuesto);
      setInventario(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el inventario');
      
      // Fallback a Mock Data si el backend está caído
      console.log("Usando mock data para Inventario...");
      setInventario([
        {
          idRepuesto: 1,
          nombre: 'Pantalla iPhone 13 Pro',
          cantidadDisponible: 12,
          costoUnitario: 85000,
          ultimaReposicion: new Date().toISOString()
        },
        {
          idRepuesto: 2,
          nombre: 'Batería Samsung S22',
          cantidadDisponible: 3,
          costoUnitario: 25000,
          ultimaReposicion: new Date(Date.now() - 432000000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
  };

  const handleCloseDeleteModal = () => {
    setDeletingItem(null);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setIsDeleting(true);
      await inventarioService.eliminarRepuesto(deletingItem.idRepuesto);
      
      // Refresco dinámico de la UI (eliminar del estado local)
      setInventario(prev => prev.filter(i => i.idRepuesto !== deletingItem.idRepuesto));
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
      if (error) { 
        // Mock mode: simulamos la eliminación exitosa localmente
        setInventario(prev => prev.filter(i => i.idRepuesto !== deletingItem.idRepuesto));
        handleCloseDeleteModal();
      } else {
        // Mostrar alerta clara de error
        alert(err.message || 'Error: No se pudo eliminar el repuesto (podría estar asociado a un trabajo).');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setNewStock(item.cantidadDisponible);
  };

  const handleCloseEditModal = () => {
    setEditingItem(null);
    setNewStock('');
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setIsSaving(true);
      await inventarioService.actualizarStock(editingItem.idRepuesto, parseInt(newStock, 10));
      
      // Refresco dinámico de UI (actualizar estado local) para ser súper rápido
      setInventario(prev => prev.map(i => i.idRepuesto === editingItem.idRepuesto ? { ...i, cantidadDisponible: parseInt(newStock, 10) } : i));
      handleCloseEditModal();
      
      // Opcional: cargarInventario() de nuevo en background si quieres asegurar la sincronización exacta
      // cargarInventario();
    } catch (err) {
      console.error(err);
      if (error) { 
        // Mock mode
        setInventario(prev => prev.map(i => i.idRepuesto === editingItem.idRepuesto ? { ...i, cantidadDisponible: parseInt(newStock, 10) } : i));
        handleCloseEditModal();
      } else {
        alert(err.message || 'No se pudo actualizar el stock.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleNuevoIngreso = () => {
    alert("Próximamente: Se abrirá modal para añadir un nuevo repuesto");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount || 0);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Sin fecha';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStockClass = (cantidad) => {
    if (cantidad <= 0) return 'stock-critical';
    if (cantidad <= 5) return 'stock-low';
    return 'stock-ok';
  };

  const filteredInventario = inventario.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <div className="inventario-header">
        <h1 className="inventario-title">Gestión de Inventario</h1>
        <button className="btn-primary" onClick={handleNuevoIngreso}>
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>+</span> 
          Nuevo Ingreso a Inventario
        </button>
      </div>

      <div className="data-section">
        <div className="data-section-header">
          <h2 className="data-section-title">Stock Actual</h2>
          <button 
            onClick={cargarInventario} 
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {loading ? '↻ Cargando...' : '↻ Refrescar'}
          </button>
        </div>

        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <SearchBar 
            placeholder="Buscar repuesto o equipo..." 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
        </div>
        
        {loading && inventario.length === 0 && <div className="loading-state">Cargando inventario...</div>}
        
        {!loading && error && inventario.length === 0 && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && inventario.length === 0 && !error && (
          <div className="empty-state">No hay repuestos registrados en el inventario.</div>
        )}

        {!loading && inventario.length > 0 && filteredInventario.length === 0 && (
          <div className="empty-state">No se encontraron repuestos que coincidan con la búsqueda.</div>
        )}

        {filteredInventario.length > 0 && (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre del Repuesto</th>
                  <th>Stock Disponible</th>
                  <th>Costo Unitario</th>
                  <th>Última Reposición</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventario.map((item) => (
                  <tr key={item.idRepuesto}>
                    <td>
                      <div className="item-name">{item.nombre}</div>
                    </td>
                    <td>
                      <div className={`item-stock ${getStockClass(item.cantidadDisponible)}`}>
                        {item.cantidadDisponible} und.
                      </div>
                    </td>
                    <td>
                      <div className="item-price">{formatCurrency(item.costoUnitario)}</div>
                    </td>
                    <td>
                      <div className="item-date">{formatDate(item.ultimaReposicion)}</div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon edit" title="Editar stock" onClick={() => handleEditClick(item)}>
                          ✎
                        </button>
                        <button className="btn-icon delete" title="Eliminar repuesto" onClick={() => handleDeleteClick(item)}>
                          🗑
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

      {/* Modal de Edición de Stock */}
      {editingItem && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Actualizar Stock</h3>
              <button className="btn-close" onClick={handleCloseEditModal}>✕</button>
            </div>
            
            <form onSubmit={handleSaveStock}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <span className="form-label">Repuesto</span>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{editingItem.nombre}</div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="newStock" className="form-label">Cantidad Disponible (Und.)</label>
                  <input 
                    type="number" 
                    id="newStock"
                    className="form-input"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    min="0"
                    required
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseEditModal} disabled={isSaving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Eliminación */}
      {deletingItem && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div className="modal-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
              <h3 className="modal-title" style={{ color: 'var(--accent-danger)' }}>Eliminar Repuesto</h3>
              <button className="btn-close" onClick={handleCloseDeleteModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                ¿Estás seguro de eliminar <strong>"{deletingItem.nombre}"</strong>?
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Esta acción no se puede deshacer y borrará permanentemente este registro del inventario.
              </p>
            </div>
            
            <div className="modal-footer" style={{ borderTopColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'transparent' }}>
              <button type="button" className="btn-secondary" onClick={handleCloseDeleteModal} disabled={isDeleting}>
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={confirmDelete} 
                disabled={isDeleting}
                style={{ backgroundColor: 'var(--accent-danger)' }}
              >
                {isDeleting ? 'Eliminando ⏳' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
