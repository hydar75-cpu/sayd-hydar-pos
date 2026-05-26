import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationDisplay from '../components/LocationDisplay';
import { formatNumber, getCurrentPosition } from '../utils/helpers';

function Return({ invoices, inventory, setInventory }) {
  const navigate = useNavigate();
  const [searchInvoice, setSearchInvoice] = useState('');
  const [foundInvoice, setFoundInvoice] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getLocation = async () => {
    setLoadingLocation(true);
    try { const pos = await getCurrentPosition(); setCurrentLocation(pos); } catch (err) {}
    setLoadingLocation(false);
  };

  const searchForInvoice = () => {
    const found = invoices.find(inv => inv.number === searchInvoice);
    if (found) {
      setFoundInvoice(found);
      setReturnItems(found.items.map(item => ({ ...item, returnQty: 0, maxReturn: item.qty })));
    } else {
      alert('لم يتم العثور على الفاتورة');
    }
  };

  const updateReturnQty = (productId, qty) => {
    setReturnItems(items => items.map(item =>
      item.productId === productId ? { ...item, returnQty: Math.max(0, Math.min(qty, item.maxReturn)) } : item
    ));
  };

  const handleReturn = async () => {
    const itemsToReturn = returnItems.filter(item => item.returnQty > 0);
    if (itemsToReturn.length === 0) { alert('لم يتم تحديد كمية'); return; }

    const newInventory = [...inventory];
    itemsToReturn.forEach(item => {
      const invIdx = newInventory.findIndex(i => i.productId === item.productId && i.warehouseId === item.warehouseId);
      if (invIdx >= 0) newInventory[invIdx] = { ...newInventory[invIdx], quantity: newInventory[invIdx].quantity + item.returnQty };
    });
    setInventory(newInventory);

    const returnTotal = itemsToReturn.reduce((sum, item) => sum + (item.price * item.returnQty), 0);
    alert(`تم تسجيل المرتجع\nقيمة المرتجع: ${formatNumber(returnTotal)} د.ع`);
    setFoundInvoice(null);
    setSearchInvoice('');
  };

  const styles = {
    screen: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    content: { padding: '15px' },
    searchRow: { display: 'flex', gap: '10px', marginBottom: '15px' },
    searchInput: { flex: 1, padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right' },
    searchBtn: { padding: '12px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer' },
    invoiceInfo: { backgroundColor: 'white', borderRadius: '12px', padding: '15px', marginBottom: '10px' },
    cartItem: { backgroundColor: 'white', borderRadius: '12px', padding: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
    itemName: { fontWeight: '600', fontSize: '14px' },
    qtyRow: { display: 'flex', alignItems: 'center', gap: '6px' },
    qtyBtn: { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    returnQtyText: { fontWeight: 'bold', fontSize: '18px', minWidth: '30px', textAlign: 'center', color: '#ef4444' },
    saveBtn: { width: '100%', padding: '15px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' },
  };

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← رجوع</button>
        <span style={styles.title}>مرتجع بيع</span>
        <div style={{ width: '40px' }}></div>
      </div>
      <div style={styles.content}>
        <LocationDisplay location={currentLocation} onGetLocation={getLocation} loading={loadingLocation} label="المرتجع" />

        <div style={styles.searchRow}>
          <input style={styles.searchInput} placeholder="🔍 رقم الفاتورة..." value={searchInvoice}
            onChange={(e) => setSearchInvoice(e.target.value)} />
          <button style={styles.searchBtn} onClick={searchForInvoice}>بحث</button>
        </div>

        {foundInvoice && (
          <div>
            <div style={styles.invoiceInfo}>
              <p>📋 فاتورة: {foundInvoice.number}</p>
              <p>💰 الإجمالي: {formatNumber(foundInvoice.finalTotal)} د.ع</p>
            </div>
            {returnItems.map((item, index) => (
              <div key={index} style={styles.cartItem}>
                <div style={{ flex: 1 }}>
                  <p style={styles.itemName}>{item.name}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>الأصل: {item.qty}</p>
                </div>
                <div style={styles.qtyRow}>
                  <button style={styles.qtyBtn} onClick={() => updateReturnQty(item.productId, item.returnQty - 1)}>-</button>
                  <span style={styles.returnQtyText}>{item.returnQty}</span>
                  <button style={styles.qtyBtn} onClick={() => updateReturnQty(item.productId, item.returnQty + 1)}>+</button>
                </div>
              </div>
            ))}
            <button style={styles.saveBtn} onClick={handleReturn}>↩️ تأكيد المرتجع</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Return;
