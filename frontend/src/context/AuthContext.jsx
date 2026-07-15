import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión en localStorage al cargar la app
    const session = localStorage.getItem('tecnoadmin_session');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // TODO: Reemplazar validación mockeada por llamada POST a la API de Spring Boot
    // Ejemplo: const response = await api.post('/auth/login', { username, password });
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
          setIsAuthenticated(true);
          localStorage.setItem('tecnoadmin_session', 'true');
          resolve({ success: true });
        } else {
          reject(new Error('Credenciales incorrectas'));
        }
      }, 500); // Simular latencia de red
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('tecnoadmin_session');
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
