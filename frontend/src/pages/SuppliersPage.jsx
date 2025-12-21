import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuppliersPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate('/dashboard')}>← Back</button>
      <h1>Suppliers</h1>
      <p>Coming soon...</p>
    </div>
  );
};

export default SuppliersPage;
