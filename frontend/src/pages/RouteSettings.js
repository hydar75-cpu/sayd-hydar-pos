import React, { useState } from 'react';
import { DAYS_OF_WEEK } from '../data/initialData';

function RouteSettings({ onBack, persons, routes, setRoutes }) {
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const salespersons = persons.filter(p => p.type === 'مندوب');
  const customers = persons.filter(p => p.type === 'عميل');

  const handleSelectSalesperson = (sp) => {
    setSelectedSalesperson(sp);
    setSelectedDay(null);
    setSelectedRoute(null);
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    const existingRoute = routes.find(
      r => r.salespersonId === selectedSalesperson.id && r.day === day
    );
    setSelectedRoute(existingRoute || null);
  };

  const getCustomerInfo = (customerId) => {
    return persons.find(p => p.id === customerId);
  };

  const getAvailableCustomers = () => {
    if (!selectedDay || !selectedSalesperson) return [];
    const allRoutesForDay = routes.filter(r => r.day === selectedDay && r.id !== selectedRoute?.id);
    const assignedCustomerIds = new Set();
    allRoutesForDay.forEach(r => {
      r.customers.forEach(c => assignedCustomerIds.add(c.customerId));
    });
    return customers.filter(c => !assignedCustomerIds.has(c.id));
  };

  const handleAddCustomer = (customerId) => {
    if (!selectedRoute) {
      const newRoute = {
        id: Date.now(),
        salespersonId: selectedSalesperson.id,
        day: selectedDay,
        customers: [{ customerId, order: 1, status: 'pending' }]
      };
      setRoutes([...routes, newRoute]);
      setSelectedRoute(newRoute);
    } else {
      const maxOrder = selectedRoute.customers.reduce((max, c) => Math.max(max, c.order), 0);
      const updatedRoute = {
        ...selectedRoute,
        customers: [...selectedRoute.customers, { customerId, order: maxOrder + 1, status: 'pending' }]
      };
      setRoutes(routes.map(r => r.id === selectedRoute.id ? updatedRoute : r));
      setSelectedRoute(updatedRoute);
    }
  };

  const handleRemoveCustomer = (customerId) => {
    if (!selectedRoute) return;
    const updatedCustomers = selectedRoute.customers
      .filter(c => c.customerId !== customerId)
      .map((c, index) => ({ ...c, order: index + 1 }));
    const updatedRoute = { ...selectedRoute, customers: updatedCustomers };
    setRoutes(routes.map(r => r.id === selectedRoute.id ? updatedRoute : r));
    setSelectedRoute(updatedRoute);
  };

  const handleMoveCustomer = (customerId, direction) => {
    if (!selectedRoute) return;
    const customers = [...selectedRoute.customers].sort((a, b) => a.order - b.order);
    const index = customers.findIndex(c => c.customerId === customerId);
    if (direction === 'up' && index > 0) {
      [customers[index - 1].order, customers[index].order] = [customers[index].order, customers[index - 1].order];
    } else if (direction === 'down' && index < customers.length - 1) {
      [customers[index + 1].order, customers[index].order] = [customers[index].order, customers[index + 1].order];
    }
    const updatedRoute = { ...selectedRoute, customers: [...customers] };
    setRoutes(routes.map(r => r.id === selectedRoute.id ? updatedRoute : r));
    setSelectedRoute(updatedRoute);
  };

  const styles = {
    screen: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: { background: 'linear-gradient(135deg, #6b7280, #4b5563)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    content: { padding: '15px' },
    label: { fontWeight: '600', color: '#374151', marginBottom: '8px', fontSize: '14px' },
    list: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' },
    chip: (active) => ({ padding: '8px 14px', borderRadius: '20px', border: '2px solid #e5e7eb', cursor: 'pointer', fontSize: '13px', backgroundColor: active ? '#dbeafe' : 'white', borderColor: active ? '#2563eb' : '#e5e7eb', color: active ? '#1e40af' : '#374151', fontWeight: active ? 'bold' : 'normal' }),
    dayChip: (active) => ({ padding: '8px 12px', borderRadius: '20px', border: '2px solid #e5e7eb', cursor: 'pointer', fontSize: '12px', backgroundColor: active ? '#ede9fe' : 'white', borderColor: active ? '#8b5cf6' : '#e5e7eb', color: active ? '#5b21b6' : '#374151', fontWeight: active ? 'bold' : 'normal' }),
    customerCard: { backgroundColor: 'white', borderRadius: '12px', padding: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    customerName: { fontWeight: '600', fontSize: '14px' },
    smallBtn: { padding: '4px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600' },
    addBtn: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px', maxHeight: '60%', overflowY: 'auto', width: '100%', maxWidth: '480px', margin: '0 auto' },
    modalTitle: { fontWeight: 'bold', fontSize: '18px', textAlign: 'center', marginBottom: '15px' },
    modalItem: { padding: '15px', borderBottom: '1px solid #f0f4f8', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeBtn: { marginTop: '15px', padding: '12px', backgroundColor: '#f0f4f8', borderRadius: '12px', textAlign: 'center', cursor: 'pointer' },
  };

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>← رجوع</button>
        <span style={styles.title}>ضبط خط السير</span>
        <div style={{ width: '40px' }}></div>
      </div>
      <div style={styles.content}>
        <p style={styles.label}>اختر المندوب</p>
        <div style={styles.list}>
          {salespersons.map(sp => (
            <button key={sp.id} style={styles.chip(selectedSalesperson?.id === sp.id)} onClick={() => handleSelectSalesperson(sp)}>
              {sp.name}
            </button>
          ))}
        </div>

        {selectedSalesperson && (
          <>
            <p style={styles.label}>اختر اليوم</p>
            <div style={styles.list}>
              {DAYS_OF_WEEK.map(day => (
                <button key={day} style={styles.dayChip(selectedDay === day)} onClick={() => handleSelectDay(day)}>
                  {day}
                </button>
              ))}
            </div>
          </>
        )}

        {selectedDay && selectedSalesperson && (
          <>
            <p style={{ ...styles.label, marginTop: '15px' }}>
              عملاء {selectedDay} - {selectedSalesperson.name}
            </p>

            {selectedRoute && selectedRoute.customers
              .sort((a, b) => a.order - b.order)
              .map((rc, index) => {
                const customer = getCustomerInfo(rc.customerId);
                if (!customer) return null;
                return (
                  <div key={rc.customerId} style={styles.customerCard}>
                    <div style={{ flex: 1 }}>
                      <p style={styles.customerName}>{index + 1}. {customer.name}</p>
                      <p style={{ fontSize: '11px', color: '#6b7280' }}>{customer.address}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                      <button style={{ ...styles.smallBtn, backgroundColor: '#dbeafe', color: '#1e40af' }} onClick={() => handleMoveCustomer(rc.customerId, 'up')}>⬆</button>
                      <button style={{ ...styles.smallBtn, backgroundColor: '#dbeafe', color: '#1e40af' }} onClick={() => handleMoveCustomer(rc.customerId, 'down')}>⬇</button>
                      <button style={{ ...styles.smallBtn, backgroundColor: '#fef2f2', color: '#991b1b' }} onClick={() => handleRemoveCustomer(rc.customerId)}>✕</button>
                    </div>
                  </div>
                );
              })}

            <button style={styles.addBtn} onClick={() => setShowAddCustomer(true)}>
              + إضافة عميل
            </button>
          </>
        )}
      </div>

      {showAddCustomer && (
        <div style={styles.modalOverlay} onClick={() => setShowAddCustomer(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p style={styles.modalTitle}>إضافة عميل</p>
            {getAvailableCustomers().length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>لا يوجد عملاء متاحين لهذا اليوم</p>
            ) : (
              getAvailableCustomers().map(c => (
                <div key={c.id} style={styles.modalItem} onClick={() => { handleAddCustomer(c.id); setShowAddCustomer(false); }}>
                  <span>{c.name}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{c.address}</span>
                </div>
              ))
            )}
            <div style={styles.closeBtn} onClick={() => setShowAddCustomer(false)}>إغلاق</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteSettings;
