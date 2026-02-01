import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Package, ChevronDown, ChevronUp, Calendar, User, Hash, DollarSign } from 'lucide-react';
import { useAppContext } from '../Context/Context';
import './OrdersDashboard.css';

// ==================== COLOCATED COMPONENTS ====================

// Status Badge Component
const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'warning',
            'Preparing': 'info',
            'Ready': 'success',
            'Delivered': 'secondary',
            'Cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    };

    return (
        <span className={`badge badge-${getStatusColor(status)}`}>
            {status}
        </span>
    );
};

// Order Card Component
const OrderCard = ({ order, onStatusChange, onToggleExpand, isExpanded }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);
        await onStatusChange(order.id, newStatus);
        setIsUpdating(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="order-card fade-in">
            <div className="order-card-header" onClick={() => onToggleExpand(order.id)}>
                <div className="order-info">
                    <div className="order-number">
                        <Hash size={18} />
                        <span>{order.order_number}</span>
                    </div>
                    <div className="order-meta">
                        <div className="meta-item">
                            <User size={16} />
                            <span>{order.customer_name || 'Guest'}</span>
                        </div>
                        <div className="meta-item">
                            <Calendar size={16} />
                            <span>{formatDate(order.created_at)}</span>
                        </div>
                        {order.table_number && (
                            <div className="meta-item">
                                <span>Table {order.table_number}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="order-summary">
                    <StatusBadge status={order.status} />
                    <div className="order-total">
                        <DollarSign size={18} />
                        <span>${order.total_amount.toFixed(2)}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {isExpanded && (
                <div className="order-details">
                    <div className="order-items">
                        <h4>Order Items</h4>
                        <div className="items-list">
                            {order.items?.map((item, index) => (
                                <div key={index} className="order-item">
                                    <div className="item-info">
                                        <span className="item-name">{item.menu_item_name}</span>
                                        <span className="item-category badge badge-secondary">
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="item-quantity">
                                        <span>Qty: {item.quantity}</span>
                                        <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="order-actions">
                        <label className="status-label">Update Status:</label>
                        <div className="status-buttons">
                            {['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'].map((status) => (
                                <button
                                    key={status}
                                    className={`btn btn-sm status-btn ${order.status === status ? 'active' : ''}`}
                                    onClick={() => handleStatusChange(status)}
                                    disabled={isUpdating || order.status === status}
                                >
                                    {isUpdating && order.status === status ? (
                                        <div className="loading-spinner" />
                                    ) : (
                                        status
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination">
            <button
                className="btn btn-secondary btn-sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>

            <div className="page-numbers">
                {startPage > 1 && (
                    <>
                        <button className="page-btn" onClick={() => onPageChange(1)}>
                            1
                        </button>
                        {startPage > 2 && <span className="page-dots">...</span>}
                    </>
                )}

                {pages.map((page) => (
                    <button
                        key={page}
                        className={`page-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="page-dots">...</span>}
                        <button className="page-btn" onClick={() => onPageChange(totalPages)}>
                            {totalPages}
                        </button>
                    </>
                )}
            </div>

            <button
                className="btn btn-secondary btn-sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
};

// Status Filter Component
const StatusFilter = ({ selectedStatus, onStatusChange }) => {
    const statuses = ['All', 'Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

    return (
        <div className="status-filter">
            <span className="filter-label">Filter by Status:</span>
            <div className="filter-buttons">
                {statuses.map((status) => (
                    <button
                        key={status}
                        className={`filter-btn ${selectedStatus === (status === 'All' ? '' : status) ? 'active' : ''}`}
                        onClick={() => onStatusChange(status === 'All' ? '' : status)}
                    >
                        {status}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ==================== MAIN PAGE COMPONENT ====================

const OrdersDashboard = () => {
    const { API_URL } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    // Fetch orders
    const fetchOrders = async (page = 1) => {
        try {
            setLoading(true);
            let url = `${API_URL}/orders?page=${page}&limit=10`;

            if (statusFilter) {
                url += `&status=${statusFilter}`;
            }

            const response = await axios.get(url);
            setOrders(response.data.orders);
            setCurrentPage(response.data.pagination.page);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            toast.error('Failed to fetch orders');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(currentPage);
    }, [statusFilter, currentPage]);

    // Update order status
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.patch(`${API_URL}/orders/${orderId}/status`, {
                status: newStatus
            });
            toast.success('Order status updated');
            fetchOrders(currentPage);
        } catch (error) {
            toast.error('Failed to update order status');
            console.error(error);
        }
    };

    // Toggle order expansion
    const handleToggleExpand = (orderId) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setExpandedOrders(new Set()); // Collapse all when changing pages
    };

    return (
        <div className="orders-dashboard">
            <div className="page-header">
                <div>
                    <h1>Orders Dashboard</h1>
                    <p className="page-subtitle">Manage and track customer orders</p>
                </div>
            </div>

            <div className="orders-controls">
                <StatusFilter
                    selectedStatus={statusFilter}
                    onStatusChange={setStatusFilter}
                />
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner" style={{ width: 40, height: 40 }} />
                    <p>Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <Package size={64} />
                    <h3>No orders found</h3>
                    <p>Orders will appear here once customers place them</p>
                </div>
            ) : (
                <>
                    <div className="orders-list">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onStatusChange={handleStatusChange}
                                onToggleExpand={handleToggleExpand}
                                isExpanded={expandedOrders.has(order.id)}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default OrdersDashboard;
