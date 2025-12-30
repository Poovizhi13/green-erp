import React, { useState, useEffect } from 'react';  // ✅ Fixed import
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({ total_emissions: 0 });

  useEffect(() => {
    reportsAPI.getEmissionsByItem()
      .then(data => {
        const total = data.reduce((sum, item) => sum + (item.total_co2_from_orders || 0), 0);
        setMetrics({ total_emissions: total });
      })
      .catch(() => setMetrics({ total_emissions: 0 }));
  }, []);

  const modules = [
    {
      id: 'items',
      title: 'Inventory',
      description: 'Manage items and CO2 emissions',
      icon: '📦',
      route: '/items',
      roles: ['admin', 'procurement_manager'],
    },
    {
      id: 'suppliers',
      title: 'Suppliers',
      description: 'Manage vendors',
      icon: '🏭',
      route: '/suppliers',
      roles: ['admin', 'procurement_manager'],
    },
    {
      id: 'orders',
      title: 'Purchase Orders',
      description: 'Create and track orders',
      icon: '📋',
      route: '/purchase-orders',
      roles: ['admin', 'procurement_manager'],
    },
    {
      id: 'reports',
      title: 'Reports',
      description: `${metrics.total_emissions.toFixed(1)} kg CO₂e`,  // ✅ Fixed
      icon: '📊',
      route: '/reports',
      roles: ['admin', 'sustainability_manager'],
    },
  ];

  const availableModules = modules.filter((m) =>
    m.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Green-ERP Dashboard</h1>
          <p>Welcome, <strong>{user?.username}</strong> ({user?.role})</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <section className="modules">
          <h2>Available Modules</h2>
          <div className="modules-grid">
            {availableModules.map((module) => (
              <div key={module.id} className="module-card">
                <div className="module-icon">{module.icon}</div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <button
                  onClick={() => navigate(module.route)}
                  className="btn-module"
                >
                  Open →
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
