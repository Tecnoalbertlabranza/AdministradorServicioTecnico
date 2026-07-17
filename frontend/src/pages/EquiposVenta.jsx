import { useState, useEffect } from 'react';
import { equipoVentaService } from '../services/equipoVentaService';
import { formatearMoneda } from '../utils/formatters';
import FormularioNuevoEquipo from '../components/FormularioNuevoEquipo';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';
import './Inventario.css';

const EquiposVenta = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      case 'EN_TALLER': return 'bg-yellow-900 text-yellow-300';
      case 'PUBLICADO': return 'bg-green-900 text-green-300';
      case 'VENDIDO': return 'bg-gray-700 text-gray-300';
      default: return 'bg-gray-700 text-gray-300';
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

  return (
    <div className="dashboard-container">
      <div className="inventario-header">
        <h1 className="inventario-title">Gestión de Equipos a la Venta</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>+</span> 
          Nuevo Equipo a la Venta
        </button>
      </div>

      <div className="data-section">
        <div className="data-section-header">
          <h2 className="data-section-title">Vitrina Actual</h2>
          <button onClick={cargarEquipos} disabled={loading} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}>
            {loading ? '↻ Cargando...' : '↻ Refrescar'}
          </button>
        </div>

        {loading ? (
          <Spinner text="Cargando vitrina..." />
        ) : equipos.length === 0 ? (
          <div className="empty-state">No hay equipos publicados actualmente.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Título y Categoría</th>
                  <th>Condición</th>
                  <th>Precio Venta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map((equipo) => {
                  const portada = equipo.imagenes?.find(img => img.esPortada)?.urlImagen;
                  return (
                    <tr key={equipo.id}>
                      <td>
                        {portada ? (
                          <img src={portada} alt={equipo.titulo} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>Sin foto</div>
                        )}
                      </td>
                      <td>
                        <div className="item-name">{equipo.titulo}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{equipo.nombreCategoria || 'Sin Categoría'}</div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-secondary)' }}>{equipo.condicionEstetica}</div>
                      </td>
                      <td>
                        <div className="item-price">{formatearMoneda(equipo.precioVenta)}</div>
                      </td>
                      <td>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block' }} className={getStatusBadgeClass(equipo.estadoInventario)}>
                          {getStatusText(equipo.estadoInventario)}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn-icon edit" title="Editar Equipo" onClick={() => toast('Función en desarrollo', { icon: '🚧' })}>✎</button>
                          <button className="btn-icon delete" title="Eliminar Equipo" onClick={() => toast('Función en desarrollo', { icon: '🚧' })}>🗑</button>
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
    </div>
  );
};

export default EquiposVenta;
