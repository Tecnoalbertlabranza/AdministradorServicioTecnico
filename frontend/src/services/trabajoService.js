import api from './api';

export const trabajoService = {
    obtenerTodos: async () => {
        // TODO: Descomentar para conectar con la API real de Spring Boot.
        // return await api('/trabajos/');

        return new Promise((resolve) => {
            setTimeout(() => {
                const baseDate = Date.now();
                const dias = (n) => baseDate - n * 86400000;
                
                resolve([
                    // PENDIENTE
                    { idTrabajo: 1, equipo: 'iPhone 13 Pro', cliente: { nombre: 'Juan Pérez' }, estado: 'PENDIENTE', servicio: 'Cambio de pantalla', precioTotal: 150000, costoInsumos: 80000, abono: 50000, fechaIngreso: new Date(dias(2)).toISOString() },
                    { idTrabajo: 2, equipo: 'Samsung Galaxy A54', cliente: { nombre: 'Lucía Torres' }, estado: 'PENDIENTE', servicio: 'Cambio de pin de carga', precioTotal: 25000, costoInsumos: 5000, abono: 0, fechaIngreso: new Date(dias(1)).toISOString() },
                    { idTrabajo: 3, equipo: 'Xiaomi Redmi Note 12', cliente: { nombre: 'Carlos Ruiz' }, estado: 'PENDIENTE', servicio: 'Actualización de software', precioTotal: 15000, costoInsumos: 0, abono: 15000, fechaIngreso: new Date().toISOString() },
                    
                    // EN_REVISION
                    { idTrabajo: 4, equipo: 'MacBook Pro M2', cliente: { nombre: 'Andrés Silva' }, estado: 'EN_REVISION', servicio: 'No enciende, revisión placa', precioTotal: 0, costoInsumos: 0, abono: 20000, fechaIngreso: new Date(dias(5)).toISOString() },
                    { idTrabajo: 5, equipo: 'iPad Air 4', cliente: { nombre: 'María Paz' }, estado: 'EN_REVISION', servicio: 'Batería se descarga rápido', precioTotal: 0, costoInsumos: 0, abono: 0, fechaIngreso: new Date(dias(3)).toISOString() },
                    { idTrabajo: 6, equipo: 'Nintendo Switch OLED', cliente: { nombre: 'Felipe Gómez' }, estado: 'EN_REVISION', servicio: 'Error pantalla azul', precioTotal: 0, costoInsumos: 0, abono: 0, fechaIngreso: new Date(dias(4)).toISOString() },
                    
                    // ESPERANDO_REPUESTO
                    { idTrabajo: 7, equipo: 'iPhone 11', cliente: { nombre: 'Camila Rojas' }, estado: 'ESPERANDO_REPUESTO', servicio: 'Cambio de batería', precioTotal: 40000, costoInsumos: 15000, abono: 10000, fechaIngreso: new Date(dias(10)).toISOString() },
                    { idTrabajo: 8, equipo: 'Samsung Galaxy S22 Ultra', cliente: { nombre: 'Roberto Castro' }, estado: 'ESPERANDO_REPUESTO', servicio: 'Cambio módulo completo', precioTotal: 280000, costoInsumos: 190000, abono: 100000, fechaIngreso: new Date(dias(15)).toISOString() },
                    { idTrabajo: 9, equipo: 'PS5 Digital', cliente: { nombre: 'Diego López' }, estado: 'ESPERANDO_REPUESTO', servicio: 'Cambio puerto HDMI', precioTotal: 65000, costoInsumos: 12000, abono: 30000, fechaIngreso: new Date(dias(8)).toISOString() },
                    
                    // FINALIZADO
                    { idTrabajo: 10, equipo: 'Motorola Edge 30', cliente: { nombre: 'Sofía Reyes' }, estado: 'FINALIZADO', servicio: 'Cambio tapa trasera', precioTotal: 35000, costoInsumos: 15000, abono: 0, fechaIngreso: new Date(dias(7)).toISOString() },
                    { idTrabajo: 11, equipo: 'iPhone 14 Plus', cliente: { nombre: 'Javier Vega' }, estado: 'FINALIZADO', servicio: 'Limpieza de altavoces', precioTotal: 20000, costoInsumos: 0, abono: 20000, fechaIngreso: new Date(dias(2)).toISOString() },
                    { idTrabajo: 12, equipo: 'Apple Watch S7', cliente: { nombre: 'Paula Muñoz' }, estado: 'FINALIZADO', servicio: 'Cambio de cristal', precioTotal: 85000, costoInsumos: 35000, abono: 40000, fechaIngreso: new Date(dias(12)).toISOString() },
                    
                    // ENTREGADO
                    { idTrabajo: 13, equipo: 'Xbox Series S', cliente: { nombre: 'Tomás Medina' }, estado: 'ENTREGADO', servicio: 'Mantenimiento térmico', precioTotal: 45000, costoInsumos: 8000, abono: 45000, fechaIngreso: new Date(dias(20)).toISOString() },
                    { idTrabajo: 14, equipo: 'POCO X3 Pro', cliente: { nombre: 'Valentina Díaz' }, estado: 'ENTREGADO', servicio: 'Reballing CPU', precioTotal: 75000, costoInsumos: 5000, abono: 75000, fechaIngreso: new Date(dias(18)).toISOString() },
                    { idTrabajo: 15, equipo: 'iPhone 12 Mini', cliente: { nombre: 'Sebastián Mora' }, estado: 'ENTREGADO', servicio: 'Cambio cámara trasera', precioTotal: 95000, costoInsumos: 55000, abono: 95000, fechaIngreso: new Date(dias(25)).toISOString() }
                ]);
            }, 800);
        });
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
                            precioTotal: 85000,
                            costoInsumos: 30000
                        },
                        {
                            idTrabajo: 102,
                            fechaIngreso: new Date(Date.now() - 432000000).toISOString(),
                            equipo: 'MacBook Air M1',
                            servicio: 'Mantenimiento y limpieza de polvo',
                            estado: 'FINALIZADO',
                            precioTotal: 35000,
                            costoInsumos: 5000
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
                            precioTotal: 25000,
                            costoInsumos: 10000
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
