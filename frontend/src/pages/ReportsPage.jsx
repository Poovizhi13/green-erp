import React, { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import '../styles/Pages.css';

const ReportsPage = () => {
  const [byItem, setByItem] = useState([]);
  const [bySupplier, setBySupplier] = useState([]);
  const [recommendations, setRecommendations] = useState([]);  // ✅ Added
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReports = async () => {
    try {
      setLoading(true);
      const [itemsData, suppliersData, aiData] = await Promise.all([
        reportsAPI.getEmissionsByItem(),
        reportsAPI.getEmissionsBySupplier(),
        reportsAPI.getAIRecommendations()  // ✅ AI Module
      ]);
      setByItem(itemsData);
      setBySupplier(suppliersData);
      setRecommendations(aiData.recommendations || []);  // ✅ Safe access
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

        {/* ✅ Existing tables */}
        <h3>Emissions by Item</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th><th>SKU</th><th>CO₂ per unit</th><th>Total CO₂ from orders</th>
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
            <tr><th>Supplier</th><th>Total CO₂</th><th>Order count</th></tr>
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

        {/* ✅ NEW AI SECTION */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>🤖 AI Recommendations</h3>
          {byItem.length === 0 ? (
            <p>No data yet. Create purchase orders to get AI insights!</p>
          ) : (
            <div>
              {recommendations.map((reco, i) => (
                <div key={i} style={{
                  background: '#f0f9ff', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  marginBottom: '12px',
                  borderLeft: '4px solid #2563eb'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>
                    ⚠️ {reco.high_emission_item}
                  </h4>
                  <p style={{ margin: '0 0 12px 0' }}>
                    <strong>{reco.total_co2.toFixed(1)} kg CO₂e</strong> total emissions
                  </p>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {reco.suggestions.map((suggestion, j) => (
                      <li key={j} style={{ marginBottom: '4px' }}>{suggestion}</li>
                    ))}
                  </ul>
                  <div style={{ color: '#10b981', fontWeight: 'bold' }}>
                    💰 Potential savings: {reco.potential_savings.toFixed(1)} kg CO₂e
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
