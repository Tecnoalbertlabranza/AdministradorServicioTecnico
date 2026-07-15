import api from './api';

export const trabajoService = {
    obtenerTodos: async () => {
        return await api('/trabajos/');
    },

    obtenerPorId: async (id) => {
        return await api(`/trabajos/${id}`);
    },

    obtenerPorCliente: async (idCliente) => {
        // TODO: Descomentar para conectar con la API real de Spring Boot.
        // return await api(`/trabajos/cliente/${idCliente}`);

        // Mock Data simulando latencia de red para desarrollo UI
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generar datos ficticios dependiendo del ID para probar estados vacíos o llenos
                if (idCliente === '1') {
                    resolve([
                        {
                            idTrabajo: 101,
                            fechaIngreso: new Date().toISOString(),
                            equipo: 'iPhone 13 Pro',
                            servicio: 'Cambio de pantalla y Mica de cristal',
                            estado: 'ENTREGADO',
                            precioTotal: 85000
                        },
                        {
                            idTrabajo: 102,
                            fechaIngreso: new Date(Date.now() - 432000000).toISOString(),
                            equipo: 'MacBook Air M1',
                            servicio: 'Mantenimiento y limpieza de polvo',
                            estado: 'FINALIZADO',
                            precioTotal: 35000
                        }
                    ]);
                } else if (idCliente === '2') {
                    resolve([
                        {
                            idTrabajo: 105,
                            fechaIngreso: new Date(Date.now() - 86400000).toISOString(),
                            equipo: 'Samsung Galaxy S22',
                            servicio: 'Reemplazo de puerto de carga',
                            estado: 'PENDIENTE',
                            precioTotal: 25000
                        }
                    ]);
                } else {
                    // Cliente 3 sin historial
                    resolve([]);
                }
            }, 800); // 800ms de retraso simulado
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
