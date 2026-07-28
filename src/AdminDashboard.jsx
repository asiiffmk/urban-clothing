import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';

export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();

  const handleBack = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="admin-dashboard-container" style={{ width: '100%' }}>
      <AdminPanel onBack={handleBack} onLogout={onLogout} />
    </div>
  );
}
