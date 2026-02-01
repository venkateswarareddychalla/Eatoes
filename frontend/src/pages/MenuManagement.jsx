import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, Trash2, X, Filter, ChefHat, Clock } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useAppContext } from '../Context/Context';
import './MenuManagement.css';

// ==================== COLOCATED COMPONENTS ====================

// Search Bar Component
const SearchBar = ({ searchTerm, setSearchTerm, isSearching }) => (
    <div className="search-bar">
        <Search size={20} />
        <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
        />
        {isSearching && <div className="loading-spinner" />}
    </div>
);

// Filter Bar Component
const FilterBar = ({ filters, setFilters }) => {
    const categories = ['All', 'Appetizer', 'Main Course', 'Dessert', 'Beverage'];

    return (
        <div className="filter-bar">
            <div className="filter-group">
                <Filter size={18} />
                <span>Category:</span>
                <div className="filter-buttons">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`filter-btn ${filters.category === (cat === 'All' ? '' : cat) ? 'active' : ''}`}
                            onClick={() => setFilters({ ...filters, category: cat === 'All' ? '' : cat })}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-group">
                <span>Availability:</span>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filters.availability === 'all' ? 'active' : ''}`}
                        onClick={() => setFilters({ ...filters, availability: 'all' })}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filters.availability === 'true' ? 'active' : ''}`}
                        onClick={() => setFilters({ ...filters, availability: 'true' })}
                    >
                        Available
                    </button>
                    <button
                        className={`filter-btn ${filters.availability === 'false' ? 'active' : ''}`}
                        onClick={() => setFilters({ ...filters, availability: 'false' })}
                    >
                        Unavailable
                    </button>
                </div>
            </div>
        </div>
    );
};

// Menu Card Component
const MenuCard = ({ item, onEdit, onDelete, onToggleAvailability }) => {
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        setIsToggling(true);
        await onToggleAvailability(item.id);
        setIsToggling(false);
    };

    return (
        <div className="menu-card fade-in">
            <div className="menu-card-image" style={{
                backgroundImage: `url(${item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'})`
            }}>
                <div className={`availability-badge ${item.is_available ? 'available' : 'unavailable'}`}>
                    {item.is_available ? 'Available' : 'Unavailable'}
                </div>
            </div>

            <div className="menu-card-content">
                <div className="menu-card-header">
                    <h3>{item.name}</h3>
                    <span className={`badge badge-${getCategoryColor(item.category)}`}>
                        {item.category}
                    </span>
                </div>

                <p className="menu-card-description">{item.description}</p>

                <div className="menu-card-meta">
                    <div className="meta-item">
                        <Clock size={16} />
                        <span>{item.preparation_time} min</span>
                    </div>
                    <div className="meta-item">
                        <ChefHat size={16} />
                        <span>{item.ingredients?.length || 0} ingredients</span>
                    </div>
                </div>

                <div className="menu-card-footer">
                    <div className="price">${item.price.toFixed(2)}</div>

                    <div className="menu-card-actions">
                        <button
                            className={`btn-toggle ${item.is_available ? 'active' : ''}`}
                            onClick={handleToggle}
                            disabled={isToggling}
                        >
                            {isToggling ? <div className="loading-spinner" /> : (item.is_available ? 'Available' : 'Unavailable')}
                        </button>
                        <button className="btn btn-icon btn-secondary" onClick={() => onEdit(item)}>
                            <Edit2 size={16} />
                        </button>
                        <button className="btn btn-icon btn-danger" onClick={() => onDelete(item.id)}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Menu Form Component (Modal)
const MenuForm = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Appetizer',
        price: '',
        ingredients: '',
        preparation_time: '',
        image_url: '',
        is_available: true
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                category: item.category || 'Appetizer',
                price: item.price || '',
                ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '',
                preparation_time: item.preparation_time || '',
                image_url: item.image_url || '',
                is_available: item.is_available !== false
            });
        }
    }, [item]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const ingredientsArray = formData.ingredients
            .split(',')
            .map(i => i.trim())
            .filter(i => i);

        const dataToSave = {
            ...formData,
            price: parseFloat(formData.price),
            preparation_time: parseInt(formData.preparation_time),
            ingredients: ingredientsArray
        };

        onSave(dataToSave);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="menu-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category *</label>
                            <select
                                className="form-select"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="Appetizer">Appetizer</option>
                                <option value="Main Course">Main Course</option>
                                <option value="Dessert">Dessert</option>
                                <option value="Beverage">Beverage</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Price ($) *</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-input"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Preparation Time (min)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.preparation_time}
                                onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Ingredients (comma separated)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.ingredients}
                            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                            placeholder="e.g., tomato, cheese, basil"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Image URL</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-checkbox">
                            <input
                                type="checkbox"
                                checked={formData.is_available}
                                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                            />
                            <span>Available</span>
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {item ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
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

const MenuManagement = () => {
    const { API_URL } = useAppContext();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        availability: 'all'
    });
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch menu items
    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            let url = `${API_URL}/menu?`;

            if (filters.category) url += `category=${filters.category}&`;
            if (filters.availability !== 'all') url += `availability=${filters.availability}&`;

            const response = await axios.get(url);
            setMenuItems(response.data);
        } catch (error) {
            toast.error('Failed to fetch menu items');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Search menu items
    const searchMenuItems = async (query) => {
        if (!query.trim()) {
            fetchMenuItems();
            return;
        }

        try {
            setIsSearching(true);
            const response = await axios.get(`${API_URL}/menu/search?q=${query}`);
            setMenuItems(response.data);
        } catch (error) {
            toast.error('Search failed');
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        if (debouncedSearchTerm) {
            searchMenuItems(debouncedSearchTerm);
        } else {
            fetchMenuItems();
        }
    }, [debouncedSearchTerm, filters]);

    // Create or update menu item
    const handleSaveItem = async (data) => {
        try {
            if (editingItem) {
                await axios.put(`${API_URL}/menu/${editingItem.id}`, data);
                toast.success('Menu item updated successfully');
            } else {
                await axios.post(`${API_URL}/menu`, data);
                toast.success('Menu item created successfully');
            }

            setShowForm(false);
            setEditingItem(null);
            fetchMenuItems();
        } catch (error) {
            toast.error(editingItem ? 'Failed to update item' : 'Failed to create item');
            console.error(error);
        }
    };

    // Delete menu item
    const handleDeleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await axios.delete(`${API_URL}/menu/${id}`);
            toast.success('Menu item deleted successfully');
            fetchMenuItems();
        } catch (error) {
            toast.error('Failed to delete item');
            console.error(error);
        }
    };

    // Toggle availability with optimistic UI update
    const handleToggleAvailability = async (id) => {
        const itemIndex = menuItems.findIndex(item => item.id === id);
        const previousState = [...menuItems];

        // Optimistic update
        const updatedItems = [...menuItems];
        updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            is_available: !updatedItems[itemIndex].is_available
        };
        setMenuItems(updatedItems);

        try {
            await axios.patch(`${API_URL}/menu/${id}/availability`);
            toast.success('Availability updated');
        } catch (error) {
            // Rollback on error
            setMenuItems(previousState);
            toast.error('Failed to update availability. Changes reverted.');
            console.error(error);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    return (
        <div className="menu-management">
            <div className="page-header">
                <div>
                    <h1>Menu Management</h1>
                    <p className="page-subtitle">Manage your restaurant menu items</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={20} />
                    Add Menu Item
                </button>
            </div>

            <div className="menu-controls">
                <SearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    isSearching={isSearching}
                />
                <FilterBar filters={filters} setFilters={setFilters} />
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner" style={{ width: 40, height: 40 }} />
                    <p>Loading menu items...</p>
                </div>
            ) : menuItems.length === 0 ? (
                <div className="empty-state">
                    <ChefHat size={64} />
                    <h3>No menu items found</h3>
                    <p>Add your first menu item to get started</p>
                </div>
            ) : (
                <div className="menu-grid">
                    {menuItems.map((item) => (
                        <MenuCard
                            key={item.id}
                            item={item}
                            onEdit={handleEdit}
                            onDelete={handleDeleteItem}
                            onToggleAvailability={handleToggleAvailability}
                        />
                    ))}
                </div>
            )}

            {showForm && (
                <MenuForm
                    item={editingItem}
                    onClose={() => {
                        setShowForm(false);
                        setEditingItem(null);
                    }}
                    onSave={handleSaveItem}
                />
            )}
        </div>
    );
};

export default MenuManagement;
