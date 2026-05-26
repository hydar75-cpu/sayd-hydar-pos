import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationDisplay from '../components/LocationDisplay';
import { formatNumber, parseNumber, getCurrentPosition, generateInvoiceNumber } from '../utils/helpers';

function Sale({ user, products, persons, invoices, setInvoices, inventory, setInventory, warehouses, cashBoxes, setCashBoxes, activeCashBoxId }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProducts, setShowProducts] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomers, setShowCustomers] = useState(false);
  const [discount, setDiscount] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saleType, setSaleType] = useState('نقدي');

  const customers = persons.filter(p => p.type === 'عميل');
  const activeCashBox = cashBoxes.find(cb => cb.id === activeCashBoxId) || cashBoxes[0];
  const userWarehouses = user.isManager ? warehouses : warehouses.filter(w => w.userId === user.userId);

  const filteredProducts = products.filter(p =>
    p.name.includes(searchTerm) || p.code.includes(searchTerm) || p.barcode.includes(searchTerm)
  );

  const getLocation = async () => {
    setLoadingLocation(true);
    try { const pos = await getCurrentPosition(); setCurrentLocation(pos); } catch (err) {}
    setLoadingLocation(false);
  };

  const getStockForProduct = (productId, warehouseId) => {
    const inv = inventory.filter(i => i.productId === productId && i.warehouseId === warehouseId);
    return inv.reduce((sum, i) => sum + i.quantity, 0);
  };

  const addToCart = (product) => {
    setCart([{
      cartId: Date.now(), productId: product.id, name: product.name,
      price: product.price, qty: 1, total: product.price,
      warehouseId: userWarehouses[0]?.id || warehouses[0].id
    }, ...cart]);
    setShowProducts(false);
    setSearchTerm('');
  };

  const updateQty = (cartId, delta) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(0, item.qty + delta);
        if (newQty === 0) return null;
        return { ...item, qty: newQty, total: newQty * item.price };
      }
      return item;
    }).filter(Boolean));
  };

  const updateCartWarehouse = (cartId, warehouseId) => {
    setCart(cart.map(item => item.cartId === cartId ? { ...item, warehouseId } : item));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountNum = parseInt(parseNumber(discount)) || 0;
  const finalTotal = subtotal - discountNum;

  const handleSave = async () => {
    if (cart.length === 0) { alert('السلة فارغة'); return; }
    if (!selectedCustomer) { alert('الرجاء اختيار العميل'); return; }
    for (const item of cart) {
      const stock = getStockForProduct(item.productId, item.warehouseId);
      if (item.qty > stock) { alert(`المخزون غير كافٍ لمادة "${item.name}"`); return; }
    }
    if (saleType === 'نقدي' && finalTotal > activeCashBox.balance) {
      alert('رصيد الصندوق غير كافٍ'); return;
    }

    let location = currentLocation;
    if (!location) {
      try { const pos = await getCurrentPosition(); location = pos; } catch (err) {}
    }

    const newInventory = [...inventory];
    cart.forEach(item => {
      const invIdx = newInventory.findIndex(i => i.productId === item.productId && i.warehouseId === item.warehouseId);
      if (invIdx >= 0) newInventory[invIdx] = { ...newInventory[invIdx], quantity: newInventory[invIdx].quantity - item.qty };
    });
    setInventory(newInventory);

    if (saleType === 'نقدي') {
      setCashBoxes(cashBoxes.map(cb => cb.id === activeCashBox.id ? { ...cb, balance: cb.balance + finalTotal } : cb));
    }

    const newInvoice = {
      id: Date.now(), number: generateInvoiceNumber(invoices.length),
      customerId: selectedCustomer.id, salespersonId: user?.salespersonId,
      date: new Date().toISOString().split('T')[0],
      items: cart.map(i => ({ productId: i.productId, name: i.name, qty: i.qty, price: i.price, total: i.total, warehouseId: i.warehouseId })),
      total: subtotal, discount: discountNum, finalTotal, saleType, location,
    };
    setInvoices([...invoices, newInvoice]);
    alert(`تم حفظ الفاتورة ${newInvoice.number}\nالإجمالي: ${formatNumber(finalTotal)} د.ع`);
    setCart([]); setSelectedCustomer(null); setDiscount(''); setSaleType('نقدي');
  };

  const styles = {
    screen: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    content: { padding: '15px' },
    label: { fontWeight: '600', color: '#374151', marginBottom: '8px', marginTop: '8px', fontSize: '14px' },
    typeRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
    typeBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', textAlign: 'center', cursor: 'pointer', backgroundColor: active ? '#dbeafe' : 'white', borderColor: active ? '#2563eb' : '#e5e7eb', fontWeight: active ? 'bold' : 'normal' }),
    selectBtn: { width: '100%', padding: '15px', backgroundColor: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', cursor: 'pointer', fontSize: '16px', textAlign: 'right', marginBottom: '10px' },
    searchInput: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right', marginBottom: '15px' },
    cartItem: { backgroundColor: 'white', borderRadius: '12px', padding: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
    itemName: { fontWeight: '600', fontSize: '14px' },
    itemPrice: { fontSize: '12px', color: '#6b7280' },
    qtyRow: { display: 'flex', alignItems: 'center', gap: '6px' },
    qtyBtn: { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    qtyText: { fontWeight: 'bold', minWidth: '22px', textAlign: 'center' },
    itemTotal: { fontWeight: 'bold', color: '#2563eb', fontSize: '14px' },
    totalsBox: { backgroundColor: 'white', borderRadius: '12px', padding: '15px', marginTop: '10px' },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    discountInput: { width: '100px', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center', fontSize: '16px' },
    saveBtn: { width: '100%', padding: '15px', backgroundColor: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' },
    emptyCart: { textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px', color: '#6b7280' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px', maxHeight: '60%', overflowY: 'auto', width: '100%', maxWidth: '480px', margin: '0 auto' },
    modalTitle: { fontWeight: 'bold', fontSize: '18px', textAlign: 'center', marginBottom: '15px' },
    modalItem: { padding: '15px', borderBottom: '1px solid #f0f4f8', cursor: 'pointer', fontSize: '16px' },
    closeBtn: { marginTop: '15px', padding: '12px', backgroundColor: '#f0f4f8', borderRadius: '12px', textAlign: 'center', cursor: 'pointer' },
  };

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← رجوع</button>
        <span style={styles.title}>المبيعات</span>
        <div style={{ width: '40px' }}></div>
      </div>
      <div style={styles.content}>
        <LocationDisplay location={currentLocation} onGetLocation={getLocation} loading={loadingLocation} label="الفاتورة" />
        
        <p style={styles.label}>نوع العملية</p>
        <div style={styles.typeRow}>
          {['نقدي', 'آجل'].map(t => (
            <button key={t} style={styles.typeBtn(saleType === t)} onClick={() => setSaleType(t)}>{t}</button>
          ))}
        </div>

        <button style={styles.selectBtn} onClick={() => setShowCustomers(true)}>
          {selectedCustomer ? `👤 ${selectedCustomer.name}` : '👤 اختر العميل'}
        </button>

        <input style={styles.searchInput} placeholder="🔍 بحث باسم، رمز، أو باركود..." value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setShowProducts(true); }} />

        {showProducts && searchTerm.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '10px', marginBottom: '15px' }}>
            {filteredProducts.map(product => (
              <div key={product.id} style={{ padding: '12px', borderBottom: '1px solid #f0f4f8', cursor: 'pointer' }}
                onClick={() => addToCart(product)}>
                <p style={{ fontWeight: '600' }}>{product.name}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>💰 {formatNumber(product.price)} د.ع</p>
              </div>
            ))}
            <button style={{ width: '100%', padding: '10px', backgroundColor: '#f0f4f8', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '5px' }}
              onClick={() => { setShowProducts(false); setSearchTerm(''); }}>إغلاق</button>
          </div>
        )}

        {cart.length > 0 && (
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>🛒 المبيعات</p>
            {cart.map(item => (
              <div key={item.cartId} style={styles.cartItem}>
                <div style={{ flex: 1 }}>
                  <p style={styles.itemName}>{item.name}</p>
                  <p style={styles.itemPrice}>{formatNumber(item.price)} د.ع</p>
                </div>
                <div style={styles.qtyRow}>
                  <button style={styles.qtyBtn} onClick={() => updateQty(item.cartId, -1)}>-</button>
                  <span style={styles.qtyText}>{item.qty}</span>
                  <button style={styles.qtyBtn} onClick={() => updateQty(item.cartId, 1)}>+</button>
                </div>
                <span style={styles.itemTotal}>{formatNumber(item.total)} د.ع</span>
              </div>
            ))}
            <div style={styles.totalsBox}>
              <div style={styles.totalRow}><span>المجموع</span><span>{formatNumber(subtotal)} د.ع</span></div>
              <div style={styles.totalRow}><span>الخصم</span>
                <input style={styles.discountInput} value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
              </div>
              <div style={{ ...styles.totalRow, borderTop: '2px solid #2563eb', paddingTop: '10px' }}>
                <strong>الإجمالي النهائي</strong>
                <strong style={{ color: '#2563eb', fontSize: '18px' }}>{formatNumber(finalTotal)} د.ع</strong>
              </div>
            </div>
            <button style={styles.saveBtn} onClick={handleSave}>💾 حفظ الفاتورة</button>
          </div>
        )}

        {cart.length === 0 && <div style={styles.emptyCart}><p>🔍 ابحث عن المنتج لإضافته إلى السلة</p></div>}
      </div>

      {showCustomers && (
        <div style={styles.modalOverlay} onClick={() => setShowCustomers(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p style={styles.modalTitle}>اختر العميل</p>
            {customers.map(c => (
              <div key={c.id} style={styles.modalItem} onClick={() => { setSelectedCustomer(c); setShowCustomers(false); }}>
                {c.name} {c.balance > 0 ? `(ذمة: ${formatNumber(c.balance)})` : ''}
              </div>
            ))}
            <div style={styles.closeBtn} onClick={() => setShowCustomers(false)}>إغلاق</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sale;
