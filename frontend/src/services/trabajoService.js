import api from './api';

export const trabajoService = {
    obtenerTodos: async (mes, anio) => {
        let url = '/trabajos/';
        if (mes && anio) {
            url += `?mes=${mes}&anio=${anio}`;
        }
        return await api(url);
    },

    obtenerPendientes: async () => {
        return await api('/trabajos/pendientes');
    },


    obtenerPorId: async (id) => {
        return await api(`/trabajos/${id}`);
    },

    obtenerPorCliente: async (idCliente) => {
        return await api(`/trabajos/cliente/${idCliente}`);
    },

    crear: async (datosTrabajo) => {
        return await api('/trabajos/', {
            method: 'POST',
            body: JSON.stringify(datosTrabajo)
        });
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
