import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MainLayout.css';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'trabajos', label: 'Trabajos', icon: '🛠️', path: '/trabajos' },
    { id: 'clientes', label: 'Clientes', icon: '👥', path: '/clientes' },
    { id: 'inventario', label: 'Inventario', icon: '📦', path: '/inventario' },
    { id: 'ventas', label: 'Ventas', icon: '💰', path: '/ventas' },
    { id: 'vitrina', label: 'Equipos en venta', icon: '🛍️', path: '/vitrina' },
  ];

  // Helper para saber qué vista está activa
  const currentPath = location.pathname;
  const currentViewItem = menuItems.find(item => currentPath.startsWith(item.path)) || menuItems[0];

  const handleNavClick = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Overlay for mobile */}
      {isSidebarOpen && window.innerWidth <= 768 && (
        <div 
          className="sidebar-overlay" 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">TecnoAdmin</div>
          <button className="close-sidebar-btn" onClick={toggleSidebar}>
            ✕
          </button>
        </div>
        <nav className="nav-links">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPath.startsWith(item.path) ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Navbar */}
        <header className="navbar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <div className="navbar-title">
            <h3 style={{ margin: 0, fontWeight: 500, color: 'var(--text-secondary)' }}>
              {currentViewItem.label}
            </h3>
          </div>
          <div className="navbar-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={handleLogout} 
              className="btn-logout"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => { e.target.style.color = 'var(--accent-danger)'; e.target.style.borderColor = 'var(--accent-danger)'; }}
              onMouseLeave={(e) => { e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'var(--border-color)'; }}
            >
              Cerrar Sesión 🚪
            </button>
            <div className="avatar">A</div>
          </div>
        </header>

        {/* Content */}
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
