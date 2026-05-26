import React, { useState, useEffect } from 'react';
import { DAYS_OF_WEEK } from '../data/initialData';

function RouteSettings({ onBack, persons, routes, setRoutes }) {
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [previewCustomers, setPreviewCustomers] = useState([]);

  const salespersons = persons.filter(p => p.type === 'مندوب');
  const customers = persons.filter(p => p.type === 'عميل');

  const handleSelectSalesperson = (sp) => {
    setSelectedSalesperson(sp);
    setSelectedDays([]);
    setPreviewCustomers([]);
  };

  const toggleDay = (day) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  // تحميل عملاء اليوم الأول من الأيام المحددة كمعاينة
  useEffect(() => {
    if (selectedDays.length > 0 && selectedSalesperson) {
      const firstDay = selectedDays[0];
      const existingRoute = routes.find(
        r => r.salespersonId === selectedSalesperson.id && r.day === firstDay
      );
      if (existingRoute) {
        setPreviewCustomers(existingRoute.customers.map(c => ({
          ...c,
          name: getCustomerInfo(c.customerId)?.name || '',
          address: getCustomerInfo(c.customerId)?.address || ''
        })));
      } else {
        setPreviewCustomers([]);
      }
    } else {
      setPreviewCustomers([]);
    }
  }, [selectedDays, selectedSalesperson, routes]);

  const getCustomerInfo = (customerId) => {
    return persons.find(p => p.id === customerId);
  };

  const getAvailableCustomers = () => {
    if (selectedDays.length === 0 || !selectedSalesperson) return [];
    const assignedCustomerIds = new Set();
    selectedDays.forEach(day => {
      const allRoutesForDay = routes.filter(r => r.day === day && r.salespersonId !== selectedSalesperson.id);
      allRoutesForDay.forEach(r => {
        r.customers.forEach(c => assignedCustomerIds.add(c.customerId));
      });
    });
    return customers.filter(c => !assignedCustomerIds.has(c.id));
  };

  const handleAddCustomer = (customerId) => {
    const customer = getCustomerInfo(customerId);
    if (!customer) return;

    const maxOrder = previewCustomers.reduce((max, c) => Math.max(max, c.order), 0);
    const newCustomer = { customerId, order: maxOrder + 1, status: 'pending', notes: '', name: customer.name, address: customer.address || '' };
    const updatedPreview = [...previewCustomers, newCustomer];
    setPreviewCustomers(updatedPreview);

    // تطبيق على جميع الأيام المحددة
    setRoutes(prevRoutes => {
      let newRoutes = [...prevRoutes];
      selectedDays.forEach(day => {
        const existingRouteIndex = newRoutes.findIndex(
          r => r.salespersonId === selectedSalesperson.id && r.day === day
        );
        if (existingRouteIndex >= 0) {
          const existingRoute = newRoutes[existingRouteIndex];
          const existingCustomerIds = new Set(existingRoute.customers.map(c => c.customerId));
          if (!existingCustomerIds.has(customerId)) {
            const maxOrderDay = existingRoute.customers.reduce((max, c) => Math.max(max, c.order), 0);
            newRoutes[existingRouteIndex] = {
              ...existingRoute,
              customers: [...existingRoute.customers, { customerId, order: maxOrderDay + 1, status: 'pending', notes: '' }]
            };
          }
        } else {
          newRoutes.push({
            id: Date.now() + Math.random(),
            salespersonId: selectedSalesperson.id,
            day: day,
            customers: [{ customerId, order: 1, status: 'pending', notes: '' }]
          });
        }
      });
      return newRoutes;
    });
  };

  const handleRemoveCustomer = (customerId) => {
    setPreviewCustomers(prev => {
      const updated = prev.filter(c => c.customerId !== customerId).map((c, i) => ({ ...c, order: i + 1 }));
      return updated;
    });

    // حذف من جميع الأيام المحددة
    setRoutes(prevRoutes => {
      return prevRoutes.map(r => {
        if (selectedDays.includes(r.day) && r.salespersonId === selectedSalesperson.id) {
          const updatedCustomers = r.customers
            .filter(c => c.customerId !== customerId)
            .map((c, i) => ({ ...c, order: i + 1 }));
          return { ...r, customers: updatedCustomers };
        }
        return r;
      });
    });
  };

  const handleMoveCustomer = (customerId, direction) => {
    const sorted = [...previewCustomers].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(c => c.customerId === customerId);
    if (direction === 'up' && index > 0) {
      const temp = sorted[index - 1].order;
      sorted[index - 1].order = sorted[index].order;
      sorted[index].order = temp;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const temp = sorted[index + 1].order;
      sorted[index + 1].order = sorted[index].order;
      sorted[index].order = temp;
    }
    const updatedPreview = [...sorted].sort((a, b) => a.order - b.order);
    setPreviewCustomers(updatedPreview);

    // تحديث الترتيب في جميع الأيام المحددة
    setRoutes(prevRoutes => {
      return prevRoutes.map(r => {
        if (selectedDays.includes(r.day) && r.salespersonId === selectedSalesperson.id) {
          const updatedCustomers = r.customers.map(c => {
            const found = updatedPreview.find(p => p.customerId === c.customerId);
            return found ? { ...c, order: found.order } : c;
          });
          return { ...r, customers: updatedCustomers };
        }
        return r;
      });
    });
  };

  const styles = {
    screen: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: { background: 'linear-gradient(135deg, #6b7280, #4b5563)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    content: { padding: '15px' },
    label: { fontWeight: '600', color: '#374151', marginBottom: '8px', fontSize: '14px', marginTop: '15px' },
    list: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' },
    chip: (active) => ({ padding: '8px 14px', borderRadius: '20px', border: '2px solid #e5e7eb', cursor: 'pointer', fontSize: '13px', backgroundColor: active ? '#dbeafe' : 'white', borderColor: active ? '#2563eb' : '#e5e7eb', color: active ? '#1e40af' : '#374151', fontWeight: active ? 'bold' : 'normal' }),
    dayCheckbox: (active) => ({ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '20px', border: '2px solid #e5e7eb', cursor: 'pointer', fontSize: '12px', backgroundColor: active ? '#ede9fe' : 'white', borderColor: active ? '#8b5cf6' : '#e5e7eb', color: active ? '#5b21b6' : '#374151', fontWeight: active ? 'bold' : 'normal' }),
    checkbox: { margin: 0, cursor: 'pointer' },
    customerCard: { backgroundColor: 'white', borderRadius: '12px', padding: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    customerName: { fontWeight: '600', fontSize: '14px' },
    smallBtn: { padding: '4px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600' },
    addBtn: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px', maxHeight: '60%', overflowY: 'auto', width: '100%', maxWidth: '480px', margin: '0 auto' },
    modalTitle: { fontWeight: 'bold', fontSize: '18px', textAlign: 'center', marginBottom: '15px' },
    modalItem: { padding: '15px', borderBottom: '1px solid #f0f4f8', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeBtn: { marginTop: '15px', padding: '12px', backgroundColor: '#f0f4f8', borderRadius: '12px', textAlign: 'center', cursor: 'pointer' },
    emptyState: { textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '13px' },
    dayBadge: (active) => ({ display: 'inline-block', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', marginRight: '6px', backgroundColor: active ? '#ede9fe' : '#f0f4f8', color: active ? '#5b21b6' : '#6b7280' }),
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
            <p style={styles.label}>اختر الأيام (يمكنك اختيار عدة أيام)</p>
            <div style={styles.list}>
              {DAYS_OF_WEEK.map(day => (
                <label key={day} style={styles.dayCheckbox(selectedDays.includes(day))} onClick={() => toggleDay(day)}>
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    style={styles.checkbox}
                  />
                  {day}
                </label>
              ))}
            </div>
          </>
        )}

        {selectedDays.length > 0 && selectedSalesperson && (
          <>
            <p style={{ ...styles.label, marginTop: '10px' }}>
              خطة {selectedSalesperson.name}
            </p>
            <div style={{ marginBottom: '8px' }}>
              {selectedDays.map(day => (
                <span key={day} style={styles.dayBadge(true)}>{day}</span>
              ))}
            </div>

            {previewCustomers.length === 0 ? (
              <p style={styles.emptyState}>لا يوجد عملاء. أضف عملاء جدد.</p>
            ) : (
              previewCustomers
                .sort((a, b) => a.order - b.order)
                .map((rc, index) => (
                  <div key={rc.customerId} style={styles.customerCard}>
                    <div style={{ flex: 1 }}>
                      <p style={styles.customerName}>{index + 1}. {rc.name}</p>
                      <p style={{ fontSize: '11px', color: '#6b7280' }}>{rc.address}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                      <button style={{ ...styles.smallBtn, backgroundColor: '#dbeafe', color: '#1e40af' }} onClick={() => handleMoveCustomer(rc.customerId, 'up')}>⬆</button>
                      <button style={{ ...styles.smallBtn, backgroundColor: '#dbeafe', color: '#1e40af' }} onClick={() => handleMoveCustomer(rc.customerId, 'down')}>⬇</button>
                      <button style={{ ...styles.smallBtn, backgroundColor: '#fef2f2', color: '#991b1b' }} onClick={() => handleRemoveCustomer(rc.customerId)}>✕</button>
                    </div>
                  </div>
                ))
            )}

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
            <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginBottom: '10px' }}>
              سيتم إضافة العميل إلى: {selectedDays.join('، ')}
            </p>
            {getAvailableCustomers().length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>لا يوجد عملاء متاحين للأيام المحددة</p>
            ) : (
              getAvailableCustomers().map(c => (
                <div key={c.id} style={styles.modalItem} onClick={() => { handleAddCustomer(c.id); setShowAddCustomer(false); }}>
                  <span>{c.name}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{c.address || '-'}</span>
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
