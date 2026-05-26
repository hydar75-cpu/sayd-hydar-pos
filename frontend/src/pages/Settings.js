import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Settings({ user, warehouses, setWarehouses, persons, setPersons }) {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(null);

  if (!user.isManager) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>غير مصرح لك بالوصول</p>
      </div>
    );
  }

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
    content: { padding: '15px' },
    menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
    menuItem: { backgroundColor: 'white', borderRadius: '16px', padding: '20px 10px', textAlign: 'center', cursor: 'pointer', border: '2px solid #e5e7eb' },
    menuIcon: { fontSize: '32px', marginBottom: '8px', display: 'block' },
    menuText: { fontWeight: '600', fontSize: '13px', color: '#374151' },
  };

  if (currentSection === 'warehouses') {
    return <WarehousesSection onBack={() => setCurrentSection(null)} warehouses={warehouses} setWarehouses={setWarehouses} />;
  }

  if (currentSection === 'permissions') {
    return <PermissionsSection onBack={() => setCurrentSection(null)} persons={persons} setPersons={setPersons} />;
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
              else if (item.section === 'permissions') setCurrentSection('permissions');
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

// ============================================
// قسم المخازن
// ============================================
function WarehousesSection({ onBack, warehouses, setWarehouses }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({ name: '', location: '' });

  const handleSave = () => {
    if (!warehouseForm.name) { alert('اسم المخزن مطلوب'); return; }
    setWarehouses([...warehouses, { id: Date.now(), name: warehouseForm.name, location: warehouseForm.location, hasTransactions: false, userId: 0 }]);
    setWarehouseForm({ name: '', location: '' });
    setShowAddForm(false);
  };

  const handleDelete = (warehouse) => {
    if (warehouse.hasTransactions) { alert('لا يمكن حذف هذا المخزن لأنه مرتبط بعمليات سابقة'); return; }
    if (warehouses.length <= 1) { alert('يجب وجود مخزن واحد على الأقل'); return; }
    if (window.confirm(`حذف ${warehouse.name}؟`)) {
      setWarehouses(warehouses.filter(w => w.id !== warehouse.id));
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <div style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>← رجوع</button>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>إدارة المخازن</span>
        <button onClick={() => setShowAddForm(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
      </div>
      <div style={{ padding: '15px' }}>
        {showAddForm && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '15px' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '15px', textAlign: 'center' }}>إضافة مخزن</p>
            <input style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right', marginBottom: '10px' }} placeholder="اسم المخزن *" value={warehouseForm.name} onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })} />
            <input style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right', marginBottom: '10px' }} placeholder="الموقع" value={warehouseForm.location} onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleSave}>💾 حفظ المخزن</button>
              <button style={{ flex: 1, padding: '12px', backgroundColor: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '16px', fontWeight: '600', cursor: 'pointer', color: '#6b7280' }} onClick={() => { setShowAddForm(false); setWarehouseForm({ name: '', location: '' }); }}>إلغاء</button>
            </div>
          </div>
        )}
        {warehouses.map(w => (
          <div key={w.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px', marginBottom: '8px', display: 'flex', alignItems: 'center', borderRight: w.hasTransactions ? '3px solid #06b6d4' : 'none' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', fontSize: '15px' }}>🏭 {w.name} {w.hasTransactions ? '🔒' : ''}</p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>📍 {w.location || 'غير محدد'}</p>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} onClick={() => handleDelete(w)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// قسم الصلاحيات
// ============================================
function PermissionsSection({ onBack, persons, setPersons }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const salespersons = persons.filter(p => p.type === 'مندوب');

  const handleChangePassword = () => {
    if (!newPassword) { alert('الرجاء إدخال كلمة المرور الجديدة'); return; }
    setPersons(persons.map(p => p.id === selectedUser.id ? { ...p, password: newPassword } : p));
    setShowPasswordForm(false);
    setNewPassword('');
    alert('تم تغيير كلمة المرور بنجاح');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <div style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>← رجوع</button>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>إدارة الصلاحيات</span>
        <div style={{ width: '40px' }}></div>
      </div>
      <div style={{ padding: '15px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '15px', color: '#374151' }}>المستخدمين</p>
        {salespersons.map(sp => (
          <div key={sp.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px', marginBottom: '8px', display: 'flex', alignItems: 'center', borderRight: sp.isManager ? '3px solid #f59e0b' : '3px solid #e5e7eb' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', fontSize: '15px' }}>
                {sp.name} {sp.isManager ? '👑' : ''}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>👤 {sp.username}</p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>🔑 {sp.password}</p>
              <p style={{ fontSize: '11px', color: sp.isManager ? '#f59e0b' : '#10b981', marginTop: '3px' }}>
                {sp.isManager ? 'مدير النظام - صلاحيات كاملة' : 'مندوب - صلاحيات محدودة'}
              </p>
            </div>
            <button
              style={{ padding: '8px 12px', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px' }}
              onClick={() => { setSelectedUser(sp); setShowPasswordForm(true); setNewPassword(''); }}
            >
              تغيير كلمة المرور
            </button>
          </div>
        ))}
      </div>

      {showPasswordForm && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowPasswordForm(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <p style={{ fontWeight: 'bold', fontSize: '18px', textAlign: 'center', marginBottom: '15px' }}>تغيير كلمة المرور</p>
            <p style={{ textAlign: 'center', marginBottom: '10px' }}>{selectedUser.name}</p>
            <input
              style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right', marginBottom: '10px' }}
              type="password"
              placeholder="كلمة المرور الجديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleChangePassword}>حفظ</button>
              <button style={{ flex: 1, padding: '12px', backgroundColor: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '16px', fontWeight: '600', cursor: 'pointer', color: '#6b7280' }} onClick={() => setShowPasswordForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
