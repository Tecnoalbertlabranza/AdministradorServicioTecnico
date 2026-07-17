import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import { equipoVentaService } from '../services/equipoVentaService';
import InputMoneda from './InputMoneda';

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

const CONDICIONES = [
  { value: 'Nuevo', label: 'Nuevo' },
  { value: 'Como Nuevo', label: 'Como Nuevo' },
  { value: 'Buen Estado', label: 'Buen Estado' },
  { value: 'Con Detalles', label: 'Con Detalles' }
];

const ESTADOS = [
  { value: 'EN_TALLER', label: 'En Taller' },
  { value: 'PUBLICADO', label: 'Publicado' },
  { value: 'VENDIDO', label: 'Vendido' }
];

// Placeholder for categories, to be replaced by backend fetch later
const CATEGORIAS_MOCK = [
  { value: '1', label: 'Laptops' },
  { value: '2', label: 'Celulares' },
  { value: '3', label: 'Consolas' }
];

const FormularioNuevoEquipo = ({ isOpen, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [equipo, setEquipo] = useState({
    titulo: '',
    precioVenta: '',
    costoCompra: '',
    costoReacondicionamiento: '',
    especificaciones: '',
    condicionEstetica: 'Buen Estado',
    estadoInventario: 'EN_TALLER',
    idCategoria: '1'
  });

  const [fotoPortada, setFotoPortada] = useState(null);
  const [fotosGaleria, setFotosGaleria] = useState([]);

  const onDropPortada = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setFotoPortada(Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0])
      }));
    }
  }, []);

  const onDropGaleria = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFotosGaleria(prev => [...prev, ...newFiles]);
  }, []);

  const removeGaleriaFoto = (index) => {
    setFotosGaleria(prev => prev.filter((_, i) => i !== index));
  };

  const { getRootProps: getRootPortada, getInputProps: getInputPortada } = useDropzone({
    onDrop: onDropPortada,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const { getRootProps: getRootGaleria, getInputProps: getInputGaleria } = useDropzone({
    onDrop: onDropGaleria,
    accept: { 'image/*': [] }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fotoPortada) {
      toast.error('La foto de portada es obligatoria');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      const dto = {
        titulo: equipo.titulo,
        especificaciones: equipo.especificaciones,
        precioVenta: parseFloat(equipo.precioVenta),
        condicionEstetica: equipo.condicionEstetica,
        costoCompra: parseFloat(equipo.costoCompra) || 0,
        costoReacondicionamiento: 0,
        estadoInventario: equipo.estadoInventario,
        idCategoria: parseInt(equipo.idCategoria)
      };

      formData.append('datos', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
      formData.append('fotoPortada', fotoPortada);
      
      fotosGaleria.forEach(foto => {
        formData.append('fotosGaleria', foto);
      });

      await equipoVentaService.crearEquipo(formData);
      toast.success('Equipo registrado con éxito');
      
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Error al registrar el equipo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-large" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>Nuevo Equipo a la Venta</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-grid">
            {/* Columna Izquierda: Datos */}
            <div className="modal-grid-col">
              <h3 className="section-title">Información Principal</h3>
              <div className="form-group">
                <label>Título del Equipo</label>
                <input required type="text" placeholder="Ej: MacBook Pro 2019"
                  value={equipo.titulo} onChange={e => setEquipo({...equipo, titulo: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Categoría</label>
                  <Select options={CATEGORIAS_MOCK} styles={customSelectStyles}
                    value={CATEGORIAS_MOCK.find(c => c.value === equipo.idCategoria)}
                    onChange={sel => setEquipo({...equipo, idCategoria: sel.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Condición Estética</label>
                  <Select options={CONDICIONES} styles={customSelectStyles}
                    value={CONDICIONES.find(c => c.value === equipo.condicionEstetica)}
                    onChange={sel => setEquipo({...equipo, condicionEstetica: sel.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Estado Inventario</label>
                <Select options={ESTADOS} styles={customSelectStyles}
                  value={ESTADOS.find(c => c.value === equipo.estadoInventario)}
                  onChange={sel => setEquipo({...equipo, estadoInventario: sel.value})} />
              </div>

              <h3 className="section-title mt-4">Finanzas</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Precio de Venta Público</label>
                  <InputMoneda required placeholder="$ 0"
                    value={equipo.precioVenta} onChange={val => setEquipo({...equipo, precioVenta: val})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Costo Total Invertido</label>
                  <InputMoneda placeholder="$ 0"
                    value={equipo.costoCompra} onChange={val => setEquipo({...equipo, costoCompra: val})} />
                </div>
              </div>

              <div className="form-group mt-2">
                <label>Especificaciones</label>
                <textarea required rows="4" placeholder="Procesador, RAM, Almacenamiento..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
                  value={equipo.especificaciones} onChange={e => setEquipo({...equipo, especificaciones: e.target.value})} />
              </div>
            </div>

            {/* Columna Derecha: Imágenes */}
            <div className="modal-grid-col">
              <h3 className="section-title">Imágenes del Equipo</h3>
              
              <div className="form-group">
                <label>Foto de Portada (Obligatoria)</label>
                <div {...getRootPortada()} style={{
                  border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)',
                  padding: '2rem', textAlign: 'center', cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.02)', position: 'relative'
                }}>
                  <input {...getInputPortada()} />
                  {fotoPortada ? (
                    <img src={fotoPortada.preview} alt="Portada" style={{ maxHeight: '150px', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      <p>☁️ Arrastra una imagen aquí o haz clic</p>
                      <small>(Solo 1 imagen principal)</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group mt-4">
                <label>Galería (Opcional)</label>
                <div {...getRootGaleria()} style={{
                  border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)',
                  padding: '2rem', textAlign: 'center', cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.02)'
                }}>
                  <input {...getInputGaleria()} />
                  <div style={{ color: 'var(--text-muted)' }}>
                    <p>☁️ Arrastra más imágenes aquí</p>
                    <small>(Múltiples fotos)</small>
                  </div>
                </div>
                
                {fotosGaleria.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    {fotosGaleria.map((foto, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img src={foto.preview} alt={`Galeria ${index}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                        <button type="button" onClick={() => removeGaleriaFoto(index)} style={{
                          position: 'absolute', top: '-5px', right: '-5px',
                          background: 'red', color: 'white', border: 'none',
                          borderRadius: '50%', width: '20px', height: '20px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="modal-footer" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Subiendo...' : 'Guardar y Subir Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioNuevoEquipo;
