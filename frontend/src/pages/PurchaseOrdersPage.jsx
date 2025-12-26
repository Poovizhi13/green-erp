import React, { useEffect, useState } from 'react';
import { itemsAPI, suppliersAPI, ordersAPI } from '../services/api';
import '../styles/Pages.css';

const PurchaseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    supplier_id: '',
    status: 'draft',
    items: [{ item_id: '', quantity: 1, unit_price: 0 }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, suppliersData, itemsData] = await Promise.all([
        ordersAPI.getPurchaseOrders(),
        suppliersAPI.getSuppliers(),
        itemsAPI.getItems(),
      ]);
      setOrders(ordersData);
      setSuppliers(suppliersData);
      setItems(itemsData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const addLine = () => {
    setForm({
      ...form,
      items: [...form.items, { item_id: '', quantity: 1, unit_price: 0 }],
    });
  };

  const removeLine = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        supplier_id: parseInt(form.supplier_id, 10),
        status: form.status,
        items: form.items
          .filter((li) => li.item_id)
          .map((li) => ({
            item_id: parseInt(li.item_id, 10),
            quantity: parseFloat(li.quantity || 0),
            unit_price: parseFloat(li.unit_price || 0),
          })),
      };

      await ordersAPI.createPurchaseOrder(payload);
      setForm({
        supplier_id: '',
        status: 'draft',
        items: [{ item_id: '', quantity: 1, unit_price: 0 }],
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create purchase order');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Purchase Orders</h2>
      </div>

      <div className="card">
        {error && <p className="error">{error}</p>}
        {loading && <p className="loading">Loading...</p>}

        <form onSubmit={handleCreate}>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <label>Supplier:</label>
              <br />
              <select
                name="supplier_id"
                value={form.supplier_id}
                onChange={handleFormChange}
                required
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Status:</label>
              <br />
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="received">Received</option>
              </select>
            </div>
          </div>

          <h4>Items</h4>
          {form.items.map((line, index) => (
            <div
              key={index}
              style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}
            >
              <select
                value={line.item_id}
                onChange={(e) =>
                  handleItemChange(index, 'item_id', e.target.value)
                }
                required
              >
                <option value="">Select item</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name} ({it.sku})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={line.quantity}
                onChange={(e) =>
                  handleItemChange(index, 'quantity', e.target.value)
                }
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Unit price"
                value={line.unit_price}
                onChange={(e) =>
                  handleItemChange(index, 'unit_price', e.target.value)
                }
              />
              {form.items.length > 1 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => removeLine(index)}
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary"
            onClick={addLine}
          >
            + Add Line
          </button>

          <div style={{ marginTop: '8px' }}>
            <button type="submit" className="btn-primary">
              Create Purchase Order
            </button>
          </div>
        </form>

        <h3 style={{ marginTop: '16px' }}>Existing Orders</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Total amount</th>
              <th>Total CO₂</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.supplier_name}</td>
                <td>{o.status}</td>
                <td>{o.total_amount}</td>
                <td>{o.total_co2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrdersPage;
