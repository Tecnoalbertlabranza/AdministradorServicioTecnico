import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Menu, X, LayoutDashboard, Wrench, Users, Package, ShoppingCart, Store } from 'lucide-react';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'trabajos', label: 'Trabajos', icon: Wrench, path: '/trabajos' },
    { id: 'clientes', label: 'Clientes', icon: Users, path: '/clientes' },
    { id: 'inventario', label: 'Inventario', icon: Package, path: '/inventario' },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart, path: '/ventas' },
    { id: 'vitrina', label: 'Equipos en venta', icon: Store, path: '/vitrina' },
  ];

  const currentPath = location.pathname;
  const currentViewItem = menuItems.find((item) => currentPath.startsWith(item.path)) || menuItems[0];

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

  const isDark = theme === 'dark';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Overlay para móviles */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-300 ease-in-out flex flex-col border-r bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm`}
      >
        {/* Header del Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-sky-400 to-cyan-500 bg-clip-text text-transparent">
              TecnoAdmin
            </span>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white"
            onClick={toggleSidebar}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación del Sidebar */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border-l-4 border-sky-500 pl-3 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-sky-500 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar Header */}
        <header className="h-16 px-6 flex items-center justify-between border-b backdrop-blur-md z-30 bg-white/80 dark:bg-[#1e293b]/80 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white"
              onClick={toggleSidebar}
            >
              <Menu size={22} />
            </button>
            <h3 className="text-lg font-bold tracking-tight">
              {currentViewItem.label}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            {/* TOGGLE SOL/LUNA DE MODO CLARO / OSCURO */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sky-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* BOTÓN CERRAR SESIÓN */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition duration-200 cursor-pointer border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>

            {/* AVATAR DE USUARIO */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white font-bold flex items-center justify-center shadow-sm">
              A
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
