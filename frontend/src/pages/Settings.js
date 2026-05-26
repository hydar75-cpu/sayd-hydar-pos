import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Settings({ warehouses, setWarehouses }) {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({ name: '', location: '' });

  const handleSaveWarehouse = () => {
    if (!warehouseForm.name) { alert('اسم المخزن مطلوب'); return; }
    setWarehouses([...warehouses, {
      id: Date.now(),
      name: warehouseForm.name,
      location: warehouseForm.location,
      hasTransactions: false,
      userId: 0
    }]);
    setWarehouseForm({ name: '', location: '' });
    setShowAddForm(false);
    alert('تمت إضافة المخزن بنجاح');
  };

  const handleDeleteWarehouse = (warehouse) => {
    if (warehouse.hasTransactions) { alert('لا يمكن حذف هذا المخزن لأنه مرتبط بعمليات سابقة'); return; }
    if (warehouses.length <= 1) { alert('يجب وجود مخزن واحد على الأقل'); return; }
    if (window.confirm(`هل أنت متأكد من حذف ${warehouse.name}؟`)) {
      setWarehouses(warehouses.filter(w => w.id !== warehouse.id));
    }
  };

  const settingsItems = [
    { title: 'المخازن', icon: '🏭', section: 'warehouses' },
    { title: 'الصلاحيات', icon: '🔑', section: 'permissions' },
    { title: 'النسخ الاحتياطي', icon: '💾', section: 'backup' },
    { title: 'إعدادات الطباعة', icon: '🖨️', section: 'printer' },
    { title: 'سجل العمليات', icon: '📋', section: 'logs' },
    { title: 'حول النظام', icon: 'ℹ️', section: 'about' },
  ];

  const styles = {
    screen: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: { background: 'linear-gradient(135deg, #6b7280, #4b5563)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    addBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' },
    content: { padding: '15px' },
    menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
    menuItem: { backgroundColor: 'white', borderRadius: '16px', padding: '20px 10px', textAlign: 'center', cursor: 'pointer', border: '2px solid #e5e7eb' },
    menuIcon: { fontSize: '32px', marginBottom: '8px', display: 'block' },
    menuText: { fontWeight: '600', fontSize: '13px', color: '#374151' },
    formCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '15px' },
    formTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '15px', textAlign: 'center' },
    input: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right', marginBottom: '10px' },
    formActions: { display: 'flex', gap: '10px' },
    saveBtn: { flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    cancelBtn: { flex: 1, padding: '12px', backgroundColor: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '16px', fontWeight: '600', cursor: 'pointer', color: '#6b7280' },
    warehouseCard: (hasTransactions) => ({
      backgroundColor: 'white', borderRadius: '12px', padding: '15px', marginBottom: '8px',
      display: 'flex', alignItems: 'center',
      borderRight: hasTransactions ? '3px solid #06b6d4' : 'none'
    }),
    warehouseName: { fontWeight: '600', fontSize: '15px', color: '#1e3a5f' },
    warehouseLocation: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
    iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' },
  };

  if (currentSection === 'warehouses') {
    return (
      <div style={styles.screen}>
        <div style={styles.header}>
          <button onClick={() => setCurrentSection(null)} style={styles.backBtn}>← رجوع</button>
          <span style={styles.title}>إدارة المخازن</span>
          <button onClick={() => setShowAddForm(true)} style={styles.addBtn}>+</button>
        </div>
        <div style={styles.content}>
          {showAddForm && (
            <div style={styles.formCard}>
              <p style={styles.formTitle}>إضافة مخزن</p>
              <input style={styles.input} placeholder="اسم المخزن *" value={warehouseForm.name}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })} />
              <input style={styles.input} placeholder="الموقع (اختياري)" value={warehouseForm.location}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })} />
              <div style={styles.formActions}>
                <button style={styles.saveBtn} onClick={handleSaveWarehouse}>💾 حفظ المخزن</button>
                <button style={styles.cancelBtn} onClick={() => { setShowAddForm(false); setWarehouseForm({ name: '', location: '' }); }}>إلغاء</button>
              </div>
            </div>
          )}
          {warehouses.map(w => (
            <div key={w.id} style={styles.warehouseCard(w.hasTransactions)}>
              <div style={{ flex: 1 }}>
                <p style={styles.warehouseName}>🏭 {w.name} {w.hasTransactions ? '🔒' : ''}</p>
                <p style={styles.warehouseLocation}>📍 {w.location || 'غير محدد'}</p>
              </div>
              <button style={styles.iconBtn} onClick={() => handleDeleteWarehouse(w)}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← رجوع</button>
        <span style={styles.title}>ضبط النظام</span>
        <div style={{ width: '40px' }}></div>
      </div>
      <div style={styles.content}>
        <div style={styles.menuGrid}>
          {settingsItems.map((item, index) => (
            <div key={index} style={styles.menuItem} onClick={() => {
              if (item.section === 'warehouses') setCurrentSection('warehouses');
              else alert(`إعدادات ${item.title} ستتوفر قريباً`);
            }}>
              <span style={styles.menuIcon}>{item.icon}</span>
              <span style={styles.menuText}>{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;
