import React, { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import '../styles/Pages.css';

const ReportsPage = () => {
  const [byItem, setByItem] = useState([]);
  const [bySupplier, setBySupplier] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReports = async () => {
    try {
      setLoading(true);
      const [itemsData, suppliersData] = await Promise.all([
        reportsAPI.getEmissionsByItem(),
        reportsAPI.getEmissionsBySupplier(),
      ]);
      setByItem(itemsData);
      setBySupplier(suppliersData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Emissions Reports</h2>
      </div>

      <div className="card">
        {error && <p className="error">{error}</p>}
        {loading && <p className="loading">Loading...</p>}

        <h3>Emissions by Item</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>SKU</th>
              <th>CO₂ per unit</th>
              <th>Total CO₂ from orders</th>
            </tr>
          </thead>
          <tbody>
            {byItem.map((row) => (
              <tr key={row.item_id}>
                <td>{row.item_name}</td>
                <td>{row.sku}</td>
                <td>{row.co2_per_unit}</td>
                <td>{row.total_co2_from_orders}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ marginTop: '16px' }}>Emissions by Supplier</h3>
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Total CO₂</th>
              <th>Order count</th>
            </tr>
          </thead>
          <tbody>
            {bySupplier.map((row) => (
              <tr key={row.supplier_id}>
                <td>{row.supplier_name}</td>
                <td>{row.total_co2}</td>
                <td>{row.order_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
