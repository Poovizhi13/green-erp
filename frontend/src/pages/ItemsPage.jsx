// frontend/src/pages/ItemsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/ItemsPage.css';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit: '',
    stock: 0,
    reorder_level: 10,
    co2_per_unit: 0,
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await itemsAPI.getItems();
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load items');
    }
    setLoading(false);
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await itemsAPI.createItem(formData);
      setFormData({
        name: '',
        sku: '',
        category: '',
        unit: '',
        stock: 0,
        reorder_level: 10,
        co2_per_unit: 0,
      });
      setShowForm(false);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      await itemsAPI.deleteItem(id);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="items-container">
      <header className="items-header">
        <div>
          <h1>Inventory Management</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-back"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="items-main">
        <section className="items-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {(user?.role === 'admin' || user?.role === 'procurement_manager') && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-create"
            >
              {showForm ? '✕ Cancel' : '+ New Item'}
            </button>
          )}
        </section>

        {error && <div className="error-message">{error}</div>}

        {showForm && (user?.role === 'admin' || user?.role === 'procurement_manager') && (
          <section className="create-form">
            <h2>Create New Item</h2>
            <form onSubmit={handleCreateItem}>
              <div className="form-row">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Steel Frame"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="e.g., SF-001"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., Materials"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Unit *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    placeholder="e.g., kg, piece, liter"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Current Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) =>
                      setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>CO2 per Unit (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.co2_per_unit}
                    onChange={(e) =>
                      setFormData({ ...formData, co2_per_unit: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit">
                Create Item
              </button>
            </form>
          </section>
        )}

        <section className="items-list">
          <h2>Items ({filteredItems.length})</h2>

          {loading && <p className="loading">Loading items...</p>}

          {filteredItems.length === 0 && !loading && (
            <p className="no-data">No items found. Create your first item!</p>
          )}

          <table className="items-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Reorder Level</th>
                <th>CO2/Unit (kg)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.category}</td>
                  <td>
                    <span
                      className={
                        item.stock < item.reorder_level ? 'low-stock' : ''
                      }
                    >
                      {item.stock} {item.unit}
                    </span>
                  </td>
                  <td>{item.reorder_level}</td>
                  <td>{item.co2_per_unit.toFixed(2)}</td>
                  <td>
                    {(user?.role === 'admin' || user?.role === 'procurement_manager') && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default ItemsPage;
