import React from 'react';
import { formatearMoneda, formatearFecha } from '../utils/formatters';
import { X } from 'lucide-react';

const ModalDetalleVenta = ({ isOpen, onClose, venta }) => {
  if (!isOpen || !venta) return null;

  const precioVenta = venta.precioVenta || 0;
  const costoAsociado = venta.costoAsociado || 0;
  const gananciaNeta = precioVenta - costoAsociado;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Detalle de Transacción #{venta.id}
          </h2>
          <button type="button" className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-500">Información General</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fecha y Hora</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{formatearFecha(venta.fechaVenta)}</span>
            </div>
            
            <div className="flex flex-col items-start">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Tipo de Venta</span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                venta.tipoVenta === 'EQUIPO'
                  ? 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800/50'
                  : 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50'
              }`}>
                {venta.tipoVenta}
              </span>
            </div>

            <div className="sm:col-span-2 flex flex-col">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Concepto / Detalle</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{venta.detalle}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Método de Pago</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{venta.metodoPago || 'No especificado'}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Canal de Venta</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{venta.canal || 'No especificado'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-500">Resumen Financiero</h3>
          
          <div className="p-4 rounded-xl border space-y-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Precio Cobrado</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatearMoneda(precioVenta)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Costo Asociado</span>
              <span className="font-bold text-rose-500">- {formatearMoneda(costoAsociado)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-base text-slate-900 dark:text-white">Ganancia Neta</span>
              <span className={`text-xl font-extrabold ${
                gananciaNeta >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {formatearMoneda(gananciaNeta)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-xl text-base font-bold border transition cursor-pointer bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleVenta;
