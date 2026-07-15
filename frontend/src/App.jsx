import { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Clientes from './pages/Clientes';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clientes':
        return <Clientes />;
      case 'inventario':
        return <Inventario />;
      case 'ventas':
        return <Ventas />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </MainLayout>
  );
}

export default App;
