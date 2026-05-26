import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationDisplay from '../components/LocationDisplay';
import { formatNumber, parseNumber, getCurrentPosition } from '../utils/helpers';

function Purchase({ user, products, persons, inventory, setInventory, warehouses, cashBoxes, setCashBoxes, activeCashBoxId }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [purchaseType, setPurchaseType] = useState('نقدي');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProducts, setShowProducts] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [costInput, setCostInput] = useState('');

  const suppliers = persons.filter(p => p.type === 'مورد');
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

  const openCostModal = (product) => {
    setPendingProduct(product);
    setCostInput('');
    setShowCostModal(true);
  };

  const confirmAddToCart = () => {
    const cost = parseInt(parseNumber(costInput));
    if (!cost || cost <= 0) { alert('الرجاء إدخال سعر شراء صحيح'); return; }
    setCart([{
      cartId: Date.now(), productId: pendingProduct.id, name: pendingProduct.name,
      cost, qty: 1, total: cost, warehouseId: userWarehouses[0]?.id || warehouses[0].id
    }, ...cart]);
    setShowCostModal(false); setPendingProduct(null); setCostInput('');
    setShowProducts(false); setSearchTerm('');
  };

  const updateQty = (cartId, delta) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(0, item.qty + delta);
        if (newQty === 0) return null;
        return { ...item, qty: newQty, total: newQty * item.cost };
      }
      return item;
    }).filter(Boolean));
  };

  const total = cart.reduce((sum, item) => sum + item.total, 0);

  const handleSave = async () => {
    if (cart.length === 0) { alert('السلة فارغة'); return; }
    if (!selectedSupplier) { alert('الرجاء اختيار المورد'); return; }
    if (purchaseType === 'نقدي' && total > activeCashBox.balance) { alert('رصيد الصندوق غير كافٍ'); return; }

    let location = currentLocation;
    if (!location) { try { const pos = await getCurrentPosition(); location = pos; } catch (err) {} }

    const newInventory = [...inventory];
    cart.forEach(item => {
      const invIdx = newInventory.findIndex(i => i.productId === item.productId && i.warehouseId === item.warehouseId);
      if (invIdx >= 0) newInventory[invIdx] = { ...newInventory[invIdx], quantity: newInventory[invIdx].quantity + item.qty };
      else newInventory.push({ productId: item.productId, warehouseId: item.warehouseId, quantity: item.qty });
    });
    setInventory(newInventory);

    if (purchaseType === 'نقدي') {
      setCashBoxes(cashBoxes.map(cb => cb.id === activeCashBox.id ? { ...cb, balance: cb.balance - total } : cb));
    }

    alert(`تم حفظ المشتريات\nالمورد: ${selectedSupplier.name}\nالإجمالي: ${formatNumber(total)} د.ع`);
    setCart([]); setSelectedSupplier(null); setPurchaseType('نقدي');
  };

  const styles = {
    screen: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: { background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    content: { padding: '15px' },
    label: { fontWeight: '600', color: '#374151', marginBottom: '8px', marginTop: '8px', fontSize: '14px' },
    typeRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
    typeBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', textAlign: 'center', cursor: 'pointer', backgroundColor: active ? '#dbeafe' : 'white', borderColor: active ? '#2563eb' : '#e5e7eb' }),
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
    totalRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
    saveBtn: { width: '100%', padding: '15px', backgroundColor: '#06b6d4', color: 'white', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
    modalContent: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '400px' },
    modalTitle: { fontWeight: 'bold', fontSize: '18px', textAlign: 'center', marginBottom: '15px' },
    input: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right', marginBottom: '10px' },
    actions: { display: 'flex', gap: '10px' },
    actionBtn: (color) => ({ flex: 1, padding: '12px', backgroundColor: color, color: 'white', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' }),
    cancelBtn: { flex: 1, padding: '12px', backgroundColor: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' },
    bottomModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 },
    bottomContent: { backgroundColor: 'white', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px', maxHeight: '60%', overflowY: 'auto', width: '100%', maxWidth: '480px', margin: '0 auto' },
    modalItem: { padding: '15px', borderBottom: '1px solid #f0f4f8', cursor: 'pointer', fontSize: '16px' },
    closeBtn: { marginTop: '15px', padding: '12px', backgroundColor: '#f0f4f8', borderRadius: '12px', textAlign: 'center', cursor: 'pointer' },
  };

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← رجوع</button>
        <span style={styles.title}>مشتريات</span>
        <div style={{ width: '40px' }}></div>
      </div>
      <div style={styles.content}>
        <LocationDisplay location={currentLocation} onGetLocation={getLocation} loading={loadingLocation} label="المشتريات" />
        
        <p style={styles.label}>نوع العملية</p>
        <div style={styles.typeRow}>
          {['نقدي', 'آجل'].map(t => (
            <button key={t} style={styles.typeBtn(purchaseType === t)} onClick={() => setPurchaseType(t)}>{t}</button>
          ))}
        </div>

        <button style={styles.selectBtn} onClick={() => setShowSuppliers(true)}>
          {selectedSupplier ? `🏭 ${selectedSupplier.name}` : '🏭 اختر المورد'}
        </button>

        <input style={styles.searchInput} placeholder="🔍 بحث عن مادة..." value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setShowProducts(true); }} />

        {showProducts && searchTerm.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '10px', marginBottom: '15px' }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ padding: '12px', borderBottom: '1px solid #f0f4f8', cursor: 'pointer' }}
                onClick={() => openCostModal(p)}>
                <p style={{ fontWeight: '600' }}>{p.name}</p>
              </div>
            ))}
            <button style={{ width: '100%', padding: '10px', backgroundColor: '#f0f4f8', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '5px' }}
              onClick={() => { setShowProducts(false); setSearchTerm(''); }}>إغلاق</button>
          </div>
        )}

        {cart.length > 0 && (
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>📥 المشتريات</p>
            {cart.map(item => (
              <div key={item.cartId} style={styles.cartItem}>
                <div style={{ flex: 1 }}>
                  <p style={styles.itemName}>{item.name}</p>
                  <p style={styles.itemPrice}>سعر الوحدة: {formatNumber(item.cost)} د.ع</p>
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
              <div style={styles.totalRow}><strong>الإجمالي</strong><strong style={{ fontSize: '18px' }}>{formatNumber(total)} د.ع</strong></div>
            </div>
            <button style={styles.saveBtn} onClick={handleSave}>💾 حفظ المشتريات</button>
          </div>
        )}
      </div>

      {/* Modal سعر الشراء */}
      {showCostModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCostModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p style={styles.modalTitle}>سعر الشراء</p>
            <p style={{ textAlign: 'center', marginBottom: '10px' }}>{pendingProduct?.name}</p>
            <input style={styles.input} placeholder="سعر الشراء" value={costInput}
              onChange={(e) => setCostInput(e.target.value)} />
            <div style={styles.actions}>
              <button style={styles.actionBtn('#10b981')} onClick={confirmAddToCart}>إضافة</button>
              <button style={styles.cancelBtn} onClick={() => setShowCostModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal الموردين */}
      {showSuppliers && (
        <div style={styles.bottomModal} onClick={() => setShowSuppliers(false)}>
          <div style={styles.bottomContent} onClick={(e) => e.stopPropagation()}>
            <p style={styles.modalTitle}>اختر المورد</p>
            {suppliers.map(s => (
              <div key={s.id} style={styles.modalItem} onClick={() => { setSelectedSupplier(s); setShowSuppliers(false); }}>
                {s.name}
              </div>
            ))}
            <div style={styles.closeBtn} onClick={() => setShowSuppliers(false)}>إغلاق</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Purchase;
