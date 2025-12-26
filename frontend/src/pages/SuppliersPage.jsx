import React, { useEffect, useState } from 'react';
import { suppliersAPI } from '../services/api';
import '../styles/Pages.css';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    contact_email: '',
    phone: '',
    address: '',
    sustainability_score: '',
    certifications: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await suppliersAPI.getSuppliers();
      setSuppliers(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await suppliersAPI.createSupplier({
        ...form,
        sustainability_score: parseFloat(form.sustainability_score || 0),
      });
      setForm({
        name: '',
        contact_email: '',
        phone: '',
        address: '',
        sustainability_score: '',
        certifications: '',
      });
      loadSuppliers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create supplier');
    }
  };

  return (
    <div className="page">
      <h2>Suppliers</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}

      <form onSubmit={handleCreate}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="contact_email"
          placeholder="Email"
          value={form.contact_email}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <input
          name="sustainability_score"
          placeholder="Sustainability score"
          value={form.sustainability_score}
          onChange={handleChange}
        />
        <input
          name="certifications"
          placeholder="Certifications"
          value={form.certifications}
          onChange={handleChange}
        />
        <button type="submit">Add Supplier</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.contact_email}</td>
              <td>{s.phone}</td>
              <td>{s.sustainability_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuppliersPage;
