import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Utensils, Package, ChefHat } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Analytics' },
        { path: '/menu', icon: Utensils, label: 'Menu Management' },
        { path: '/orders', icon: Package, label: 'Orders' }
    ];

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand">
                        <ChefHat size={32} className="brand-icon" />
                        <div className="brand-text">
                            <h2>Eatoes</h2>
                            <p>Admin Dashboard</p>
                        </div>
                    </div>
                    <button className="sidebar-close" onClick={toggleSidebar}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <p>© 2026 Eatoes</p>
                    <p className="version">Made with ❤️ by Venky Reddy!</p>
                </div>
            </aside>

            {/* Sidebar overlay for mobile */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={toggleSidebar} />
            )}

            {/* Main Content */}
            <div className="main-content">
                <header className="top-header">
                    <button className="menu-toggle" onClick={toggleSidebar}>
                        <Menu size={24} />
                    </button>
                    <div className="header-title">
                        <h1>Restaurant Admin Dashboard</h1>
                    </div>
                </header>

                <main className="content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
