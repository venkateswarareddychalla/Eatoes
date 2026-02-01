import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TrendingUp, Package, DollarSign, ShoppingBag, CheckCircle, Trophy } from 'lucide-react';
import { useAppContext } from '../Context/Context';
import './Analytics.css';

// ==================== COLOCATED COMPONENTS ====================

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="stat-card fade-in">
        <div className="stat-icon" style={{ background: `var(--${color})` }}>
            <Icon size={28} />
        </div>
        <div className="stat-content">
            <p className="stat-title">{title}</p>
            <h3 className="stat-value">{value}</h3>
            {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        </div>
    </div>
);

// Top Seller Item Component
const TopSellerItem = ({ item, rank }) => {
    const getRankColor = (rank) => {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        return 'default';
    };

    const getRankIcon = (rank) => {
        if (rank <= 3) {
            return <Trophy size={24} className={`trophy trophy-${getRankColor(rank)}`} />;
        }
        return <span className="rank-number">#{rank}</span>;
    };

    return (
        <div className="top-seller-item fade-in">
            <div className="rank-badge">
                {getRankIcon(rank)}
            </div>

            <div className="seller-image" style={{
                backgroundImage: `url(${item.image_url || 'https://via.placeholder.com/80?text=No+Image'})`
            }} />

            <div className="seller-info">
                <h4 className="seller-name">{item.name}</h4>
                <span className={`badge badge-${getCategoryColor(item.category)}`}>
                    {item.category}
                </span>
                <p className="seller-price">${item.price.toFixed(2)}</p>
            </div>

            <div className="seller-stats">
                <div className="stat-item">
                    <span className="stat-label">Sold</span>
                    <span className="stat-number">{item.total_quantity}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Revenue</span>
                    <span className="stat-number revenue">${item.total_revenue.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

// Helper function
const getCategoryColor = (category) => {
    const colors = {
        'Appetizer': 'info',
        'Main Course': 'success',
        'Dessert': 'warning',
        'Beverage': 'secondary'
    };
    return colors[category] || 'secondary';
};

// ==================== MAIN PAGE COMPONENT ====================

const Analytics = () => {
    const { API_URL } = useAppContext();
    const [stats, setStats] = useState(null);
    const [topSellers, setTopSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch analytics data
    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            const [statsResponse, topSellersResponse] = await Promise.all([
                axios.get(`${API_URL}/analytics/stats`),
                axios.get(`${API_URL}/analytics/top-sellers`)
            ]);

            setStats(statsResponse.data);
            setTopSellers(topSellersResponse.data);
        } catch (error) {
            toast.error('Failed to fetch analytics data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="analytics">
                <div className="loading-container">
                    <div className="loading-spinner" style={{ width: 40, height: 40 }} />
                    <p>Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics">
            <div className="page-header">
                <div>
                    <h1>Analytics Dashboard</h1>
                    <p className="page-subtitle">Track your restaurant's performance</p>
                </div>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Total Menu Items"
                    value={stats?.totalItems || 0}
                    icon={Package}
                    color="info"
                    subtitle={`${stats?.availableItems || 0} available`}
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.totalOrders || 0}
                    icon={ShoppingBag}
                    color="success"
                    subtitle={`${stats?.pendingOrders || 0} pending`}
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
                    icon={DollarSign}
                    color="warning"
                    subtitle="Excluding cancelled"
                />
                <StatCard
                    title="Available Items"
                    value={stats?.availableItems || 0}
                    icon={CheckCircle}
                    color="success"
                    subtitle={`${((stats?.availableItems / stats?.totalItems) * 100 || 0).toFixed(0)}% of total`}
                />
            </div>

            <div className="top-sellers-section">
                <div className="section-header">
                    <div className="header-content">
                        <TrendingUp size={28} />
                        <div>
                            <h2>Top Selling Items</h2>
                            <p>Your best performing menu items</p>
                        </div>
                    </div>
                </div>

                {topSellers.length === 0 ? (
                    <div className="empty-state">
                        <Trophy size={64} />
                        <h3>No sales data yet</h3>
                        <p>Top selling items will appear here once orders are placed</p>
                    </div>
                ) : (
                    <div className="top-sellers-list">
                        {topSellers.map((item, index) => (
                            <TopSellerItem
                                key={item.id}
                                item={item}
                                rank={index + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
