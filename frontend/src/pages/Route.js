import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DAYS_OF_WEEK } from '../data/initialData';

function Route({ user, routes, setRoutes, persons, setSelectedCustomer }) {
  const navigate = useNavigate();

  const todayIndex = new Date().getDay();
  const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const todayName = DAYS_OF_WEEK[adjustedIndex];

  const todayRoutes = routes.filter(
    r => r.salespersonId === user.id && r.day === todayName
  );

  const getCustomerInfo = (customerId) => {
    return persons.find(p => p.id === customerId);
  };

  const updateStatus = (routeId, customerId, newStatus) => {
    setRoutes(routes.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          customers: r.customers.map(c =>
            c.customerId === customerId ? { ...c, status: newStatus } : c
          )
        };
      }
      return r;
    }));
  };

  const openWaze = (address) => {
    const url = `https://waze.com/ul?q=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const startSale = (customer) => {
    setSelectedCustomer(customer);
    navigate('/sale');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return '✅';
      case 'cancelled': return '❌';
      default: return '⏳';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'done': return 'تمت';
      case 'cancelled': return 'ملغاة';
      default: return 'معلقة';
    }
  };

  const styles = {
    screen: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    content: { padding: '15px' },
    dayBadge: { backgroundColor: 'white', borderRadius: '12px', padding: '15px', textAlign: 'center', marginBottom: '15px', border: '2px solid #8b5cf6' },
    dayText: { fontSize: '20px', fontWeight: 'bold', color: '#5b21b6' },
    customerCard: (status) => ({
      backgroundColor: 'white', borderRadius: '12px', padding: '15px', marginBottom: '10px',
      borderRight: status === 'done' ? '4px solid #10b981' : status === 'cancelled' ? '4px solid #ef4444' : '4px solid #f59e0b'
    }),
    customerName: { fontWeight: '600', fontSize: '16px', color: '#1e3a5f' },
    customerInfo: { fontSize: '13px', color: '#6b7280', marginTop: '5px' },
    actions: { display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' },
    actionBtn: (color) => ({ padding: '8px 12px', backgroundColor: color, color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }),
    statusBadge: (status) => ({ display: 'inline-block', padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', backgroundColor: status === 'done' ? '#d1fae5' : status === 'cancelled' ? '#fef2f2' : '#fef3c7', color: status === 'done' ? '#065f46' : status === 'cancelled' ? '#991b1b' : '#92400e' }),
    emptyState: { textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px', color: '#6b7280', fontSize: '16px' },
  };

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← رجوع</button>
        <span style={styles.title}>خط السير</span>
        <div style={{ width: '40px' }}></div>
      </div>
      <div style={styles.content}>
        <div style={styles.dayBadge}>
          <p style={styles.dayText}>📅 {todayName}</p>
          <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>
            {todayRoutes.reduce((sum, r) => sum + r.customers.length, 0)} عملاء في خط السير
          </p>
        </div>

        {todayRoutes.length === 0 ? (
          <div style={styles.emptyState}>
            <p>🎉 لا يوجد عملاء مجدولون اليوم</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>يرجى مراجعة مدير النظام لتحديث خط السير</p>
          </div>
        ) : (
          todayRoutes.map(route => (
            <div key={route.id}>
              {route.customers
                .sort((a, b) => a.order - b.order)
                .map((rc, index) => {
                  const customer = getCustomerInfo(rc.customerId);
                  if (!customer) return null;
                  return (
                    <div key={rc.customerId} style={styles.customerCard(rc.status)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={styles.customerName}>
                          {index + 1}. {customer.name}
                        </span>
                        <span style={styles.statusBadge(rc.status)}>
                          {getStatusIcon(rc.status)} {getStatusText(rc.status)}
                        </span>
                      </div>
                      <p style={styles.customerInfo}>📞 {customer.phone}</p>
                      <p style={styles.customerInfo}>📍 {customer.address}</p>

                      <div style={styles.actions}>
                        <button style={styles.actionBtn('#3b82f6')} onClick={() => openWaze(customer.address)}>
                          🚗 Waze
                        </button>
                        <button style={styles.actionBtn('#10b981')} onClick={() => startSale(customer)}>
                          🛒 بدء البيع
                        </button>
                        {rc.status === 'pending' && (
                          <>
                            <button style={styles.actionBtn('#10b981')} onClick={() => updateStatus(route.id, rc.customerId, 'done')}>
                              ✅ تمت
                            </button>
                            <button style={styles.actionBtn('#ef4444')} onClick={() => updateStatus(route.id, rc.customerId, 'cancelled')}>
                              ❌ إلغاء
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Route;
