import { useState, useEffect } from 'react';
import { trabajoService } from '../services/trabajoService';
import { inventarioService } from '../services/inventarioService';
import './Dashboard.css';

const Dashboard = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrabajo, setNewTrabajo] = useState({ cliente: '', equipo: '', servicio: '', precioTotal: '', idRepuesto: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const dataTrabajos = await trabajoService.obtenerTodos();
      dataTrabajos.sort((a, b) => b.idTrabajo - a.idTrabajo);
      setTrabajos(dataTrabajos);
      
      const dataInventario = await inventarioService.obtenerTodo();
      setInventario(dataInventario);
    } catch (err) {
      setError(err.message || 'Error al cargar los trabajos');
      // Mock data temporal en caso de que el backend no esté corriendo aún
      console.log("Usando datos de prueba por fallo de conexión al backend");
      setTrabajos([
        {
          idTrabajo: 1,
          equipo: 'iPhone 13 Pro',
          cliente: { nombre: 'Juan Pérez' },
          estado: 'PENDIENTE',
          servicio: 'Cambio de pantalla',
          precioTotal: 150000,
          costoInsumos: 80000,
          abono: 50000,
          fechaIngreso: new Date().toISOString()
        },
        {
          idTrabajo: 2,
          equipo: 'Samsung Galaxy S22',
          cliente: { nombre: 'María Gómez' },
          estado: 'FINALIZADO',
          servicio: 'Cambio batería',
          precioTotal: 45000,
          costoInsumos: 15000,
          abono: 45000,
          fechaIngreso: new Date().toISOString() // Cambiado a mes actual para que se vea en el resumen
        }
      ]);
      
      setInventario([
        { idRepuesto: 1, nombre: 'Pantalla iPhone 13', costoUnitario: 80000, cantidadDisponible: 2 },
        { idRepuesto: 2, nombre: 'Batería Samsung S22', costoUnitario: 15000, cantidadDisponible: 5 },
        { idRepuesto: 3, nombre: 'Disco SSD 240GB', costoUnitario: 12000, cantidadDisponible: 8 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      setUpdatingId(id);
      await trabajoService.actualizarEstado(id, nuevoEstado);
      // Refrescar los datos luego de actualizar exitosamente
      await cargarTrabajos();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      // Actualización optimista o mock si el backend falla
      if (error) { 
        // Estamos usando mocks, actualizamos estado local
        setTrabajos(prev => prev.map(t => t.idTrabajo === id ? { ...t, estado: nuevoEstado } : t));
      } else {
        alert(err.message || "No se pudo actualizar el estado.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const getBadgeClass = (estado) => {
    if (!estado) return 'badge-pendiente';
    const est = estado.toLowerCase();
    if (est === 'finalizado') return 'badge-finalizado';
    if (est === 'entregado') return 'badge-entregado';
    return 'badge-pendiente';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount || 0);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Sin fecha';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleGuardarTrabajo = (e) => {
    e.preventDefault();
    
    // Obtener costo de insumos desde inventario si seleccionó algo
    let costoInsumoCalculado = 0;
    if (newTrabajo.idRepuesto) {
      const repuestoSelec = inventario.find(r => r.idRepuesto.toString() === newTrabajo.idRepuesto);
      if (repuestoSelec) {
        costoInsumoCalculado = repuestoSelec.costoUnitario || 0;
      }
    }

    const nuevoTrabajoGuardado = {
      idTrabajo: trabajos.length > 0 ? Math.max(...trabajos.map(t => t.idTrabajo)) + 1 : 1,
      cliente: { nombre: newTrabajo.cliente },
      equipo: newTrabajo.equipo,
      servicio: newTrabajo.servicio,
      precioTotal: parseFloat(newTrabajo.precioTotal) || 0,
      costoInsumos: costoInsumoCalculado,
      estado: 'PENDIENTE',
      abono: 0,
      fechaIngreso: new Date().toISOString()
    };

    setTrabajos([nuevoTrabajoGuardado, ...trabajos]);
    setIsModalOpen(false);
    setNewTrabajo({ cliente: '', equipo: '', servicio: '', precioTotal: '', idRepuesto: '' });
  };

  // Cálculos financieros del Mes Actual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const trabajosDelMes = trabajos.filter(t => {
    if (!t.fechaIngreso) return false;
    const date = new Date(t.fechaIngreso);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const ingresosMes = trabajosDelMes.reduce((sum, t) => sum + (t.precioTotal || 0), 0);
  const gastosMes = trabajosDelMes.reduce((sum, t) => sum + (t.costoInsumos || 0), 0);
  const gananciaNeta = ingresosMes - gastosMes;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Resumen Financiero del Mes</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + Nuevo Trabajo Manual
          </button>
          <button className="refresh-btn" onClick={cargarDatos} disabled={loading} style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'wait' : 'pointer'
          }}>
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Ingresos del Mes</span>
          <span className="stat-value">{formatCurrency(ingresosMes)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Gastos del Mes (Insumos)</span>
          <span className="stat-value" style={{ color: 'var(--accent-danger)' }}>
            -{formatCurrency(gastosMes)}
          </span>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--accent-success)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
          <span className="stat-label" style={{ color: 'var(--accent-success)' }}>Ganancia Neta</span>
          <span className="stat-value" style={{ color: 'var(--accent-success)' }}>{formatCurrency(gananciaNeta)}</span>
        </div>
      </div>

      <div className="data-section">
        <div className="data-section-header">
          <h2 className="data-section-title">Últimos Trabajos (Webhook n8n)</h2>
        </div>
        
        {loading && trabajos.length === 0 && <div className="loading-state">Cargando datos...</div>}
        
        {!loading && error && trabajos.length === 0 && (
          <div className="error-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && trabajos.length === 0 && !error && (
          <div className="empty-state">No hay trabajos registrados.</div>
        )}

        {trabajos.length > 0 && (
          <div className="table-responsive">
            <table className="trabajos-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Equipo</th>
                  <th>Fecha ingreso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {trabajos.map((trabajo) => (
                  <tr key={trabajo.idTrabajo}>
                    <td>
                      <div className="cell-client-name">
                        {trabajo.cliente ? trabajo.cliente.nombre : 'Sin registrar'}
                      </div>
                      <div className="cell-client-service">{trabajo.servicio}</div>
                    </td>
                    <td>
                      <div className="cell-device">{trabajo.equipo}</div>
                      <div className="cell-price">Abono: {formatCurrency(trabajo.abono)}</div>
                    </td>
                    <td>
                      <div className="cell-date">{formatDate(trabajo.fechaIngreso)}</div>
                    </td>
                    <td>
                      <div className="select-container">
                        <select
                          className={`status-select ${getBadgeClass(trabajo.estado)}`}
                          value={trabajo.estado || 'PENDIENTE'}
                          onChange={(e) => handleEstadoChange(trabajo.idTrabajo, e.target.value)}
                          disabled={updatingId === trabajo.idTrabajo}
                        >
                          <option value="PENDIENTE">PENDIENTE</option>
                          <option value="FINALIZADO">FINALIZADO</option>
                          <option value="ENTREGADO">ENTREGADO</option>
                        </select>
                        {updatingId === trabajo.idTrabajo && <span className="updating-spinner">⏳</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nuevo Trabajo Manual */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nuevo Trabajo Manual</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form className="modal-form" onSubmit={handleGuardarTrabajo}>
              <div className="form-group">
                <label>Cliente</label>
                <input 
                  type="text" 
                  placeholder="Ej: Juan Pérez" 
                  required 
                  value={newTrabajo.cliente}
                  onChange={(e) => setNewTrabajo({...newTrabajo, cliente: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Equipo</label>
                <input 
                  type="text" 
                  placeholder="Ej: iPhone 13 Pro" 
                  required 
                  value={newTrabajo.equipo}
                  onChange={(e) => setNewTrabajo({...newTrabajo, equipo: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Falla / Servicio</label>
                <input 
                  type="text" 
                  placeholder="Ej: Cambio de pantalla" 
                  required 
                  value={newTrabajo.servicio}
                  onChange={(e) => setNewTrabajo({...newTrabajo, servicio: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Precio Total a Cobrar (Ingreso)</label>
                <input 
                  type="number" 
                  placeholder="Ej: 150000" 
                  required 
                  min="0"
                  value={newTrabajo.precioTotal}
                  onChange={(e) => setNewTrabajo({...newTrabajo, precioTotal: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Repuesto a utilizar (Opcional)</label>
                <select 
                  value={newTrabajo.idRepuesto}
                  onChange={(e) => setNewTrabajo({...newTrabajo, idRepuesto: e.target.value})}
                  className="inventory-select"
                >
                  <option value="">-- Sin repuesto / Insumo externo --</option>
                  {inventario.map(item => (
                    <option key={item.idRepuesto} value={item.idRepuesto} disabled={item.cantidadDisponible === 0}>
                      {item.nombre} - Stock: {item.cantidadDisponible} {item.costoUnitario ? `(Costo: $${item.costoUnitario})` : ''}
                    </option>
                  ))}
                </select>
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

export default Dashboard;
