import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../utils/helpers';

function Products({ products, setProducts }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', barcode: '', price: '', boxQty: '' });

  const filteredProducts = products.filter(p =>
    p.name.includes(searchTerm) || p.code.includes(searchTerm)
  );

  const resetForm = () => {
    setForm({ name: '', code: '', barcode: '', price: '', boxQty: '' });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSave = () => {
    if (!form.name || !form.code) { alert('الاسم والرمز مطلوبان'); return; }
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id
        ? { ...p, ...form, price: parseInt(form.price) || 0, boxQty: parseInt(form.boxQty) || 1 }
        : p
      ));
    } else {
      setProducts([...products, {
        id: Date.now(), ...form,
        price: parseInt(form.price) || 0,
        boxQty: parseInt(form.boxQty) || 1,
        hasTransactions: false
      }]);
    }
    resetForm();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name, code: product.code, barcode: product.barcode || '',
      price: product.price.toString(), boxQty: product.boxQty.toString()
    });
    setShowAddForm(true);
  };

  const handleDelete = (product) => {
    if (product.hasTransactions) { alert('لا يمكن حذف هذه المادة لأنها مرتبطة بعمليات سابقة'); return; }
    if (window.confirm(`هل أنت متأكد من حذف ${product.name}؟`)) {
      setProducts(products.filter(p => p.id !== product.id));
    }
  };

  const styles = {
    screen: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    addBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' },
    content: { padding: '15px' },
    searchInput: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right', marginBottom: '15px' },
    formCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '15px' },
    formTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '15px', textAlign: 'center' },
    input: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right', marginBottom: '10px' },
    formRow: { display: 'flex', gap: '10px' },
    formActions: { display: 'flex', gap: '10px', marginTop: '10px' },
    saveBtn: { flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    cancelBtn: { flex: 1, padding: '12px', backgroundColor: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '16px', fontWeight: '600', cursor: 'pointer', color: '#6b7280' },
    productCard: (hasTransactions) => ({
      backgroundColor: 'white', borderRadius: '12px', padding: '15px', marginBottom: '8px',
      display: 'flex', alignItems: 'center',
      borderRight: hasTransactions ? '3px solid #3b82f6' : 'none'
    }),
    productName: { fontWeight: '600', fontSize: '15px', color: '#1e3a5f' },
    productCode: { fontSize: '12px', color: '#6b7280', marginTop: '3px' },
    productPrice: { fontSize: '12px', color: '#2563eb', marginTop: '3px' },
    actions: { display: 'flex', flexDirection: 'column', gap: '8px' },
    iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' },
  };

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← رجوع</button>
        <span style={styles.title}>المواد</span>
        <button onClick={() => { resetForm(); setShowAddForm(true); }} style={styles.addBtn}>+</button>
      </div>
      <div style={styles.content}>
        <input style={styles.searchInput} placeholder="🔍 بحث في المواد..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} />

        {showAddForm && (
          <div style={styles.formCard}>
            <p style={styles.formTitle}>{editingProduct ? 'تعديل مادة' : 'إضافة مادة جديدة'}</p>
            <input style={styles.input} placeholder="اسم المادة *" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div style={styles.formRow}>
              <input style={{ ...styles.input, flex: 1 }} placeholder="الرمز *" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })} />
              <input style={{ ...styles.input, flex: 1 }} placeholder="الباركود" value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
            </div>
            <div style={styles.formRow}>
              <input style={{ ...styles.input, flex: 1 }} placeholder="سعر البيع" type="number" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input style={{ ...styles.input, flex: 1 }} placeholder="عدد القطع بالصندوق" type="number" value={form.boxQty}
                onChange={(e) => setForm({ ...form, boxQty: e.target.value })} />
            </div>
            <div style={styles.formActions}>
              <button style={styles.saveBtn} onClick={handleSave}>💾 حفظ</button>
              <button style={styles.cancelBtn} onClick={resetForm}>إلغاء</button>
            </div>
          </div>
        )}

        {filteredProducts.map(product => (
          <div key={product.id} style={styles.productCard(product.hasTransactions)}>
            <div style={{ flex: 1 }}>
              <p style={styles.productName}>
                {product.name} {product.hasTransactions ? '🔒' : ''}
              </p>
              <p style={styles.productCode}>🔢 {product.code}</p>
              <p style={styles.productPrice}>
                💰 {formatNumber(product.price)} د.ع | 📦 الصندوق: {product.boxQty} قطعة
              </p>
            </div>
            <div style={styles.actions}>
              <button style={styles.iconBtn} onClick={() => handleEdit(product)}>✏️</button>
              <button style={styles.iconBtn} onClick={() => handleDelete(product)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
