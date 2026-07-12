import { useState } from 'react';
import './MainLayout.css';

const MainLayout = ({ children, currentView, setView }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'inventario', label: 'Inventario', icon: '📦' },
    { id: 'ventas', label: 'Ventas', icon: '💰' },
  ];

  const handleNavClick = (id) => {
    setView(id);
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
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
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
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
              {menuItems.find(i => i.id === currentView)?.label || 'Panel'}
            </h3>
          </div>
          <div className="navbar-profile">
            <div className="avatar">A</div>
          </div>
        </header>

        {/* Content */}
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
