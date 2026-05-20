import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, History, FileText, PlusCircle, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/dashboard.css';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { path: '/dashboard/inventory', icon: <LayoutDashboard size={20} />, label: 'Tablero' },
    { path: '/dashboard/inventory', icon: <Package size={20} />, label: 'Inventario' },
    // 'Agregar item' and 'Usuarios' are admin-only
    ...(user && user.role === 'Administrador' ? [
      { path: '/dashboard/add', icon: <PlusCircle size={20} />, label: 'Agregar item' },
      { path: '/dashboard/usuarios', icon: <Users size={20} />, label: 'Usuarios' },
    ] : []),
    { path: '/dashboard/history', icon: <History size={20} />, label: 'Historial' },
    { path: '/dashboard/reports', icon: <FileText size={20} />, label: 'Reportes' },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <h2 className="dashboard-sidebar-title">Inventory</h2>
        {user && <p className="dashboard-sidebar-user">{user.name}</p>}
      </div>

      <nav className="dashboard-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={`${item.path}-${item.label}`}
            to={item.path}
            end={item.label === 'Inventario' || item.label === 'Tablero'}
            className={({ isActive }) =>
              `dashboard-sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
