import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import fetchWithInterceptor from '../services/api';
import { trabajoService } from '../services/trabajoService';
import DocumentoServicio from './DocumentoServicio';
import Spinner from './Spinner';
import { Sparkles, Printer, Save, Edit3, X, FileText } from 'lucide-react';

const ModalInformeIA = ({ isOpen, onClose, trabajo, onUpdate }) => {
  const [notasCrudas, setNotasCrudas] = useState('');
  const [textoFinal, setTextoFinal] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const printComponentRef = useRef();

  const tieneInformeExistente = Boolean(trabajo?.informeTecnico && trabajo.informeTecnico.trim());

  // Inicializar estado cuando se abre el modal
  useEffect(() => {
    if (isOpen && trabajo) {
      if (trabajo.informeTecnico && trabajo.informeTecnico.trim()) {
        setTextoFinal(trabajo.informeTecnico);
        setNotasCrudas(trabajo.informeTecnico);
        setModoEdicion(false);
      } else {
        const initialText = trabajo.servicio || '';
        setNotasCrudas(initialText);
        setTextoFinal(initialText);
        setModoEdicion(true);
      }
    }
  }, [isOpen, trabajo]);

  const handleMejorarConIA = async () => {
    if (!notasCrudas.trim()) return;
    
    setIsImproving(true);
    try {
      const response = await fetchWithInterceptor('/ai/mejorar-informe', {
        method: 'POST',
        body: JSON.stringify({ textoCrudo: notasCrudas })
      });
      
      if (response && response.textoMejorado) {
        setTextoFinal(response.textoMejorado);
        toast.success('Texto mejorado con éxito ✨');
      }
    } catch (error) {
      console.error('Error mejorando texto:', error);
      toast.error('Error al generar respuesta con IA');
    } finally {
      setIsImproving(false);
    }
  };

  const executePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `Informe_Tecnico_TecnoAlbert_${trabajo?.idTrabajo || ''}`,
    onAfterPrint: () => {
      setIsPrinting(false);
      toast.success('Documento de Entrega generado');
      onClose();
    },
    onPrintError: (error) => {
      console.error('Error al imprimir:', error);
      toast.error('Error al abrir la ventana de impresión');
      setIsPrinting(false);
    }
  });

  useEffect(() => {
    if (isPrinting && printComponentRef.current) {
      executePrint();
    }
  }, [isPrinting, executePrint]);

  const handleSoloImprimir = () => {
    setIsPrinting(true);
  };

  const handleGuardarEImprimir = async () => {
    if (!textoFinal.trim()) {
      toast.error('El informe técnico no puede estar vacío');
      return;
    }

    setIsSaving(true);
    try {
      await trabajoService.guardarInformeTecnico(trabajo.idTrabajo, textoFinal);
      toast.success('Informe técnico guardado correctamente 💾');
      
      if (onUpdate) {
        await onUpdate();
      }

      setIsPrinting(true);
    } catch (error) {
      console.error('Error guardando informe técnico:', error);
      toast.error(error.message || 'Error al guardar el informe técnico');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !trabajo) return null;

  const isAiDisabled = isImproving || !notasCrudas.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border p-6 shadow-2xl space-y-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {tieneInformeExistente ? (
              <FileText className="text-purple-500" size={24} />
            ) : (
              <Sparkles className="text-sky-500" size={24} />
            )}
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {tieneInformeExistente && !modoEdicion
                ? `Informe Técnico Guardado (#${trabajo.idTrabajo})`
                : `Generar / Editar Informe de Entrega (${trabajo.idTrabajo})`}
            </h2>
          </div>
          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Vista cuando YA existe informe y no se está en modo edición */}
        {tieneInformeExistente && !modoEdicion ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Informe Técnico Registrado:
              </label>
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition cursor-pointer"
                onClick={() => setModoEdicion(true)}
              >
                <Edit3 size={16} />
                ✏️ Editar / Regenerar con IA
              </button>
            </div>

            <div className="p-4 rounded-xl border text-base font-medium whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 min-h-[140px] max-h-[300px] overflow-y-auto">
              {textoFinal}
            </div>
          </div>
        ) : (
          /* Vista de Redacción / Edición */
          <div className="space-y-5">
            {tieneInformeExistente && modoEdicion && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer underline"
                  onClick={() => setModoEdicion(false)}
                >
                  Volver a vista previa guardada
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Notas del Técnico (Borrador)
              </label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 min-h-[90px]"
                value={notasCrudas}
                onChange={(e) => setNotasCrudas(e.target.value)}
                placeholder="Escribe aquí las notas rápidas de lo que hiciste..."
              />
            </div>

            <div className="flex justify-center my-2">
              <button 
                type="button"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-base font-bold bg-sky-500 hover:bg-sky-600 text-white transition shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleMejorarConIA}
                disabled={isAiDisabled}
              >
                {isImproving ? <Spinner size="small" color="#ffffff" /> : <Sparkles size={18} />}
                {isImproving ? 'Mejorando con IA...' : '✨ Mejorar redacción con IA'}
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Informe Técnico Final (Editable)
              </label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 min-h-[140px]"
                value={textoFinal}
                onChange={(e) => setTextoFinal(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            type="button"
            className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            onClick={onClose}
          >
            Cancelar
          </button>

          {tieneInformeExistente && !modoEdicion ? (
            <button 
              type="button"
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-base font-bold transition shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-50"
              onClick={handleSoloImprimir} 
              disabled={isPrinting}
            >
              <Printer size={18} />
              {isPrinting ? 'Generando PDF...' : '🖨️ Imprimir PDF'}
            </button>
          ) : (
            <button 
              type="button"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-base font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              onClick={handleGuardarEImprimir} 
              disabled={isSaving || isPrinting}
            >
              {isSaving ? <Spinner size="small" color="#ffffff" /> : <Save size={18} />}
              {isSaving ? 'Guardando...' : '💾 Guardar e Imprimir PDF'}
            </button>
          )}
        </div>

        {/* Hidden print component */}
        <DocumentoServicio 
          ref={printComponentRef} 
          trabajo={trabajo} 
          tipoDoc="ENTREGA"
          detalleReparacion={textoFinal}
        />
      </div>
    </div>
  );
};

export default ModalInformeIA;
