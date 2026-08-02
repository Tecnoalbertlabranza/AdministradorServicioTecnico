import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import fetchWithInterceptor from '../services/api';
import DocumentoServicio from './DocumentoServicio';
import Spinner from './Spinner';
import { Sparkles, Printer, X } from 'lucide-react';

const ModalInformeIA = ({ isOpen, onClose, trabajo }) => {
  const [notasCrudas, setNotasCrudas] = useState('');
  const [textoFinal, setTextoFinal] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const printComponentRef = useRef();

  // Inicializar estado cuando se abre el modal
  useEffect(() => {
    if (isOpen && trabajo) {
      const initialText = trabajo.servicio || '';
      setNotasCrudas(initialText);
      setTextoFinal(initialText);
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
    } finally {
      setIsImproving(false);
    }
  };

  const executePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: 'Informe_Tecnico_TecnoAlbert',
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

  const handlePrintClick = () => {
    setIsPrinting(true);
  };

  useEffect(() => {
    if (isPrinting && printComponentRef.current) {
      executePrint();
    }
  }, [isPrinting, executePrint]);

  if (!isOpen) return null;

  const isAiDisabled = isImproving || !notasCrudas.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border p-6 shadow-2xl space-y-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Generar Informe de Entrega (IA)
          </h2>
          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
            Notas del Técnico (Borrador)
          </label>
          <textarea
            className="w-full px-4 py-2.5 rounded-xl border text-base font-medium outline-none transition bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 min-h-[100px]"
            value={notasCrudas}
            onChange={(e) => setNotasCrudas(e.target.value)}
            placeholder="Escribe aquí las notas rápidas de lo que hiciste..."
          />
        </div>

        <div className="flex justify-center my-2">
          <button 
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-base font-bold bg-sky-500 hover:bg-sky-600 text-white transition shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleMejorarConIA}
            disabled={isAiDisabled}
          >
            {isImproving ? <Spinner size="small" color="#ffffff" /> : <Sparkles size={18} />}
            {isImproving ? 'Mejorando con IA...' : 'Mejorar redacción con IA'}
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

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-base font-bold transition shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-50"
            onClick={handlePrintClick} 
            disabled={isPrinting}
          >
            <Printer size={18} />
            {isPrinting ? 'Generando...' : 'Generar PDF'}
          </button>
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
