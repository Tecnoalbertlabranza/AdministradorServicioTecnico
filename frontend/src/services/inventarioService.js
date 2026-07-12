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
    }
};
