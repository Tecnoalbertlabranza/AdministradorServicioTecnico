import api from './api';

export const dashboardService = {
  obtenerResumen: async () => {
    return await api('/dashboard/resumen');
  }
};

