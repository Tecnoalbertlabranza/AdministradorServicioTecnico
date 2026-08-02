import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import { equipoVentaService } from '../services/equipoVentaService';
import { useTheme } from '../context/ThemeContext';
import InputMoneda from './InputMoneda';
import { X, UploadCloud } from 'lucide-react';

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

const CATEGORIAS_MOCK = [
  { value: '1', label: 'Laptops' },
  { value: '2', label: 'Celulares' },
  { value: '3', label: 'Consolas' }
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

const FormularioNuevoEquipo = ({ isOpen, onClose, onUpdate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  const selectStyles = getSelectStyles(isDark);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Nuevo Equipo a la Venta</h2>
          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form className="p-6 overflow-y-auto flex-grow space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna Izquierda: Datos */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-sky-500">Información Principal</h3>
              
              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Título del Equipo</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ej: MacBook Pro 2019"
                  value={equipo.titulo} 
                  onChange={e => setEquipo({...equipo, titulo: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Categoría</label>
                  <Select 
                    options={CATEGORIAS_MOCK} 
                    styles={selectStyles}
                    value={CATEGORIAS_MOCK.find(c => c.value === equipo.idCategoria)}
                    onChange={sel => setEquipo({...equipo, idCategoria: sel.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Condición Estética</label>
                  <Select 
                    options={CONDICIONES} 
                    styles={selectStyles}
                    value={CONDICIONES.find(c => c.value === equipo.condicionEstetica)}
                    onChange={sel => setEquipo({...equipo, condicionEstetica: sel.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Estado Inventario</label>
                <Select 
                  options={ESTADOS} 
                  styles={selectStyles}
                  value={ESTADOS.find(c => c.value === equipo.estadoInventario)}
                  onChange={sel => setEquipo({...equipo, estadoInventario: sel.value})} 
                />
              </div>

              <h3 className="text-base font-extrabold uppercase tracking-wider text-sky-500 pt-2">Finanzas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Precio de Venta Público</label>
                  <InputMoneda 
                    required 
                    placeholder="$ 0"
                    value={equipo.precioVenta} 
                    onChange={val => setEquipo({...equipo, precioVenta: val})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Costo Total Invertido</label>
                  <InputMoneda 
                    placeholder="$ 0"
                    value={equipo.costoCompra} 
                    onChange={val => setEquipo({...equipo, costoCompra: val})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Especificaciones</label>
                <textarea 
                  required 
                  rows="4" 
                  placeholder="Procesador, RAM, Almacenamiento..."
                  value={equipo.especificaciones} 
                  onChange={e => setEquipo({...equipo, especificaciones: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500"
                />
              </div>
            </div>

            {/* Columna Derecha: Imágenes */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-sky-500">Imágenes del Equipo</h3>
              
              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Foto de Portada (Obligatoria)</label>
                <div {...getRootPortada()} className="p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-sky-500">
                  <input {...getInputPortada()} />
                  {fotoPortada ? (
                    <img src={fotoPortada.preview} alt="Portada" className="max-h-40 mx-auto rounded-lg shadow-sm" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <UploadCloud size={32} />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Arrastra una imagen aquí o haz clic</p>
                      <span className="text-xs text-slate-500">(Solo 1 imagen principal)</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Galería (Opcional)</label>
                <div {...getRootGaleria()} className="p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-sky-500">
                  <input {...getInputGaleria()} />
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <UploadCloud size={32} />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Arrastra más imágenes aquí</p>
                    <span className="text-xs text-slate-500">(Múltiples fotos)</span>
                  </div>
                </div>
                
                {fotosGaleria.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {fotosGaleria.map((foto, index) => (
                      <div key={index} className="relative group">
                        <img src={foto.preview} alt={`Galeria ${index}`} className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                        <button 
                          type="button" 
                          onClick={() => removeGaleriaFoto(index)} 
                          className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              type="button" 
              className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              onClick={onClose} 
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-base font-bold transition shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Subiendo...' : 'Guardar y Subir Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioNuevoEquipo;
