import api from './api';

export const authService = {
    login: async (username, password) => {
        return await api('/public/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }
};
