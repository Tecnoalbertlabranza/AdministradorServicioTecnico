import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clienteService } from '../services/clienteService';
import { X, UserPlus } from 'lucide-react';

const CANALES = [
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Presencial', label: 'Presencial' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Otro', label: 'Otro' }
];

const ModalNuevoCliente = ({ isOpen, onClose, onClienteCreado }) => {
  const [nombre, setNombre] = useState('');
  const [canal, setCanal] = useState('WhatsApp');
  const [contacto, setContacto] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      toast.error('El nombre del cliente es obligatorio');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        nombre: nombre.trim(),
        whatsapp: null,
        instagram: null
      };

      const contactoLimpio = contacto.trim();
      if (contactoLimpio) {
        if (canal === 'Instagram') {
          payload.instagram = contactoLimpio.startsWith('@') ? contactoLimpio.substring(1) : contactoLimpio;
        } else {
          payload.whatsapp = contactoLimpio;
        }
      }

      await clienteService.crearCliente(payload);
      toast.success('Cliente registrado exitosamente');

      // Limpiar formulario y cerrar
      setNombre('');
      setCanal('WhatsApp');
      setContacto('');
      
      if (onClienteCreado) {
        onClienteCreado();
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error al registrar el cliente');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <UserPlus size={22} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Nuevo Cliente
            </h2>
          </div>
          <button 
            type="button" 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" 
            onClick={onClose}
            disabled={submitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">
              Nombre del Cliente <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Carlos Silva"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">
              Plataforma / Canal de Origen
            </label>
            <select
              value={canal}
              onChange={(e) => setCanal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-sky-500 cursor-pointer"
            >
              {CANALES.map((opcion) => (
                <option key={opcion.value} value={opcion.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">
              Contacto
            </label>
            <input
              type="text"
              placeholder={canal === 'Instagram' ? 'Ej: @carlos.silva' : 'Ej: +56912345678'}
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-base font-bold transition shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevoCliente;
