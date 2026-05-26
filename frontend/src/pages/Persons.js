import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../utils/helpers';

function Persons({ persons, setPersons }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [form, setForm] = useState({ type: 'عميل', name: '', phone: '', address: '' });

  const filteredPersons = persons.filter(p =>
    p.name.includes(searchTerm) || p.phone.includes(searchTerm)
  );

  const resetForm = () => {
    setForm({ type: 'عميل', name: '', phone: '', address: '' });
    setEditingPerson(null);
    setShowAddForm(false);
  };

  const handleSave = () => {
    if (!form.name) { alert('الاسم مطلوب'); return; }
    if (editingPerson) {
      setPersons(persons.map(p => p.id === editingPerson.id ? { ...p, ...form } : p));
    } else {
      setPersons([...persons, { id: Date.now(), ...form, balance: 0, hasTransactions: false }]);
    }
    resetForm();
  };

  const handleEdit = (person) => {
    setEditingPerson(person);
    setForm({ type: person.type, name: person.name, phone: person.phone, address: person.address || '' });
    setShowAddForm(true);
  };

  const handleDelete = (person) => {
    if (person.hasTransactions) { alert('لا يمكن حذف هذا الشخص لأنه مرتبط بعمليات سابقة'); return; }
    if (window.confirm(`هل أنت متأكد من حذف ${person.name}؟`)) {
      setPersons(persons.filter(p => p.id !== person.id));
    }
  };

  const types = ['عميل', 'مورد', 'مندوب'];

  const styles = {
    screen: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    addBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' },
    content: { padding: '15px' },
    searchInput: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right', marginBottom: '15px' },
    formCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '15px' },
    formTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '15px', textAlign: 'center' },
    input: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right', marginBottom: '10px' },
    typeSelector: { display: 'flex', gap: '10px', marginBottom: '15px' },
    typeBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', textAlign: 'center', cursor: 'pointer', backgroundColor: active ? '#ede9fe' : 'white', borderColor: active ? '#8b5cf6' : '#e5e7eb', color: active ? '#5b21b6' : '#6b7280', fontWeight: active ? 'bold' : 'normal', fontSize: '14px' }),
    formActions: { display: 'flex', gap: '10px', marginTop: '10px' },
    saveBtn: { flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    cancelBtn: { flex: 1, padding: '12px', backgroundColor: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '16px', fontWeight: '600', cursor: 'pointer', color: '#6b7280' },
    personCard: (hasTransactions) => ({
      backgroundColor: 'white', borderRadius: '12px', padding: '15px', marginBottom: '8px',
      display: 'flex', alignItems: 'center',
      borderRight: hasTransactions ? '3px solid #8b5cf6' : 'none'
    }),
    personName: { fontWeight: '600', fontSize: '15px', color: '#1e3a5f' },
    badge: (type) => ({
      display: 'inline-block', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold',
      backgroundColor: type === 'عميل' ? '#dbeafe' : type === 'مورد' ? '#fef3c7' : '#d1fae5',
      color: type === 'عميل' ? '#1e40af' : type === 'مورد' ? '#92400e' : '#065f46',
      marginRight: '8px'
    }),
    personPhone: { fontSize: '12px', color: '#6b7280', marginTop: '4px' },
    personAddress: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
    balance: { color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' },
    iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' },
  };

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← رجوع</button>
        <span style={styles.title}>الأشخاص</span>
        <button onClick={() => { resetForm(); setShowAddForm(true); }} style={styles.addBtn}>+</button>
      </div>
      <div style={styles.content}>
        <input style={styles.searchInput} placeholder="🔍 بحث..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} />

        {showAddForm && (
          <div style={styles.formCard}>
            <p style={styles.formTitle}>{editingPerson ? 'تعديل شخص' : 'إضافة شخص جديد'}</p>
            <div style={styles.typeSelector}>
              {types.map(t => (
                <button key={t} style={styles.typeBtn(form.type === t)}
                  onClick={() => setForm({ ...form, type: t })}>{t}</button>
              ))}
            </div>
            <input style={styles.input} placeholder="الاسم الكامل *" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input style={styles.input} placeholder="رقم الهاتف" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input style={styles.input} placeholder="العنوان" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div style={styles.formActions}>
              <button style={styles.saveBtn} onClick={handleSave}>💾 حفظ</button>
              <button style={styles.cancelBtn} onClick={resetForm}>إلغاء</button>
            </div>
          </div>
        )}

        {filteredPersons.map(person => (
          <div key={person.id} style={styles.personCard(person.hasTransactions)}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span style={styles.personName}>
                  {person.name} {person.hasTransactions ? '🔒' : ''}
                </span>
                <span style={styles.badge(person.type)}>{person.type}</span>
              </div>
              <p style={styles.personPhone}>📞 {person.phone}</p>
              <p style={styles.personAddress}>📍 {person.address || '-'}</p>
              {person.balance > 0 && (
                <p style={styles.balance}>⚠️ الذمة: {formatNumber(person.balance)} د.ع</p>
              )}
            </div>
            <div>
              <button style={styles.iconBtn} onClick={() => handleEdit(person)}>✏️</button>
              <button style={styles.iconBtn} onClick={() => handleDelete(person)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Persons;
