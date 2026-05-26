import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../utils/helpers';

function Dashboard({ user, onLogout, cashBoxes, activeCashBoxId, warehouses, inventory }) {
  const navigate = useNavigate();
  const activeCashBox = cashBoxes.find(cb => cb.id === activeCashBoxId) || cashBoxes[0];
  const userWarehouses = user.isManager ? warehouses : warehouses.filter(w => w.userId === user.userId);
  const userInventory = inventory.filter(i => userWarehouses.some(w => w.id === i.warehouseId));
  const totalStock = userInventory.reduce((sum, i) => sum + i.quantity, 0);

  const allMenuItems = [
    { title: 'المبيعات', path: '/sale', color: '#2563eb', icon: '🛒' },
    { title: 'مرتجع بيع', path: '/return', color: '#ef4444', icon: '↩️' },
    { title: 'الصندوق', path: '/cash', color: '#10b981', icon: '💰' },
    { title: 'مشتريات', path: '/purchase', color: '#06b6d4', icon: '📥' },
    { title: 'المواد', path: '/products', color: '#f59e0b', icon: '📦' },
    { title: 'الأشخاص', path: '/persons', color: '#8b5cf6', icon: '👥' },
    { title: 'خط السير', path: '/route', color: '#ec4899', icon: '🗺️' },
    { title: 'ضبط النظام', path: '/settings', color: '#6b7280', icon: '⚙️' },
  ];

  const menuItems = user.isManager
    ? allMenuItems.filter(item => item.path !== '/route')
    : allMenuItems.filter(item => ['/sale', '/return', '/cash', '/route'].includes(item.path));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <div className="page-title">
        <p style={{ fontSize: '14px', opacity: 0.9 }}>أهلاً بك</p>
        <h2>{user?.full_name}</h2>
        <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
          {user?.role} {user.isManager ? '👑 مدير النظام' : ''}
        </p>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 15px',
          borderRadius: '20px', marginTop: '12px', display: 'inline-block'
        }}>
          <p style={{ color: 'white', fontWeight: 'bold', fontSize: '13px', margin: '4px 0' }}>
            💰 رصيد الصندوق: {formatNumber(activeCashBox.balance)} د.ع
          </p>
          <p style={{ color: 'white', fontWeight: 'bold', fontSize: '13px', margin: '4px 0' }}>
            📦 المخزون: {totalStock} قطعة
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px', padding: '20px'
      }}>
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            style={{
              backgroundColor: item.color, borderRadius: '16px', padding: '20px 10px',
              border: 'none', cursor: 'pointer', display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <span style={{ fontSize: '32px' }}>{item.icon}</span>
            <span style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>{item.title}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '15px', border: '2px solid #ef4444',
            borderRadius: '12px', backgroundColor: 'white', color: '#ef4444',
            fontSize: '16px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
