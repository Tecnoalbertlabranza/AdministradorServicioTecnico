/**
 * Formatea un número o string numérico a formato de pesos chilenos (CLP).
 * Ejemplo: 150000 -> "$ 150.000"
 */
export const formatearMoneda = (valor) => {
    if (valor === null || valor === undefined) return '$0';
    
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    }).format(valor);
};

/**
 * Formatea un string de fecha (ej. ISO 8601 del backend) a un formato amigable.
 * Ejemplo: "2026-07-15T15:26:00" -> "15 de Jul, 15:26"
 */
export const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    
    try {
        const dateObj = new Date(fecha);
        return dateObj.toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', '');
    } catch (e) {
        return fecha; // Fallback al string original si falla
    }
};
