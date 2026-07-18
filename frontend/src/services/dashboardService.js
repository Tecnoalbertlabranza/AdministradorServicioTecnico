const API_URL = '/api/v1/dashboard';

export const dashboardService = {
  obtenerResumen: async () => {
    try {
      const response = await fetch(`${API_URL}/resumen`);
      if (!response.ok) {
        throw new Error('Error al obtener el resumen del dashboard');
      }
      return await response.json();
    } catch (error) {
      console.error("Error en dashboardService:", error);
      throw error;
    }
  }
};
