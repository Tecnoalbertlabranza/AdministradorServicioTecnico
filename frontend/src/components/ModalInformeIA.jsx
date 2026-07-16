import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';
import fetchWithInterceptor from '../services/api';
import DocumentoServicio from './DocumentoServicio';
import Spinner from './Spinner';
import './ModalInformeIA.css';

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
      // El interceptor ya muestra el toast
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

  // Trigger print logic safely after state is set
  useEffect(() => {
    if (isPrinting && printComponentRef.current) {
      executePrint();
      // We don't set isPrinting to false here because executePrint might be async.
      // We rely on onAfterPrint and onPrintError. But if the print dialog is cancelled, 
      // onAfterPrint is still called by some browsers. To be safe, we just let it be.
    }
  }, [isPrinting, executePrint]);

  if (!isOpen) return null;

  const isAiDisabled = isImproving || !notasCrudas.trim();

  return (
    <div className="modal-ia-overlay" onClick={onClose}>
      <div className="modal-ia-content" onClick={e => e.stopPropagation()}>
        <div className="modal-ia-header">
          <h2 className="modal-ia-title">Generar Informe de Entrega</h2>
          <button className="modal-ia-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-ia-section">
          <label className="modal-ia-label">Notas del Técnico (Borrador)</label>
          <textarea
            className="modal-ia-textarea"
            value={notasCrudas}
            onChange={(e) => setNotasCrudas(e.target.value)}
            placeholder="Escribe aquí las notas rápidas de lo que hiciste..."
          />
        </div>

        <div className="modal-ia-action-center">
          <button 
            className="btn-ai-magic" 
            onClick={handleMejorarConIA}
            disabled={isAiDisabled}
          >
            {isImproving ? <Spinner text="" size="small" color="#ffffff" /> : '✨'}
            {isImproving ? 'Mejorando...' : 'Mejorar redacción con IA'}
          </button>
        </div>

        <div className="modal-ia-section">
          <label className="modal-ia-label">Informe Técnico Final (Editable)</label>
          <textarea
            className="modal-ia-textarea"
            value={textoFinal}
            onChange={(e) => setTextoFinal(e.target.value)}
            style={{ minHeight: '150px' }}
          />
        </div>

        <div className="modal-ia-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handlePrintClick} disabled={isPrinting}>
            {isPrinting ? 'Generando...' : '🖨️ Generar PDF'}
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
