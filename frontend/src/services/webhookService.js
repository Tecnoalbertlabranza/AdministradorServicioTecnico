import api from './api';

export const webhookService = {
    simularN8n: async (webhookToken, webhookPayload) => {
        // Este endpoint usualmente lo consume n8n, no el frontend. 
        // Se deja como utilidad para pruebas manuales si el token es conocido.
        return await api('/webhook/n8n', {
            method: 'POST',
            headers: {
                'X-Webhook-Token': webhookToken
            },
            body: JSON.stringify(webhookPayload)
        });
    }
};
