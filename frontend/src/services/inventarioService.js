import api from './api';

export const inventarioService = {
    obtenerTodo: async () => {
        return await api('/inventario/');
    },

    agregarRepuesto: async (repuesto) => {
        return await api('/inventario/', {
            method: 'POST',
            body: JSON.stringify(repuesto)
        });
    },

    crearRepuesto: async (repuesto) => {
        return await api('/inventario/', {
            method: 'POST',
            body: JSON.stringify(repuesto)
        });
    },

    actualizarStock: async (id, cantidadDisponible) => {
        return await api(`/inventario/${id}/stock`, {
            method: 'PUT',
            body: JSON.stringify({ cantidadDisponible })
        });
    },

    sumarStock: async (id, cantidadSumar, stockActual = 0) => {
        const nuevaCantidad = Number(stockActual) + Number(cantidadSumar);
        return await api(`/inventario/${id}/stock`, {
            method: 'PUT',
            body: JSON.stringify({ cantidadDisponible: nuevaCantidad })
        });
    },

    eliminarRepuesto: async (id) => {
        return await api(`/inventario/${id}`, {
            method: 'DELETE'
        });
    }
};
