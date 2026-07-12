import api from './api';

export const trabajoService = {
    obtenerTodos: async () => {
        return await api('/trabajos/');
    },

    obtenerPorId: async (id) => {
        return await api(`/trabajos/${id}`);
    },

    actualizarEstado: async (id, estado) => {
        return await api(`/trabajos/${id}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado })
        });
    },

    sumarAbono: async (id, monto) => {
        return await api(`/trabajos/${id}/abono`, {
            method: 'PUT',
            body: JSON.stringify({ monto })
        });
    }
};
