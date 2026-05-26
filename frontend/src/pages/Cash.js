import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationDisplay from '../components/LocationDisplay';
import { formatNumber, parseNumber, getCurrentPosition } from '../utils/helpers';

function Cash({ user, cashBoxes, setCashBoxes, activeCashBoxId, pendingCash, setPendingCash }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('قبض');
  const [notes, setNotes] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showTransferFrom, setShowTransferFrom] = useState(false);
  const [showTransferTo, setShowTransferTo] = useState(false);
  const [transferFromBox, setTransferFromBox] = useState(null);
  const [transferToBox, setTransferToBox] = useState(null);

  const activeCashBox = cashBoxes.find(cb => cb.id === activeCashBoxId) || cashBoxes[0];
  const availableCashBoxes = user.isManager ? cashBoxes : cashBoxes.filter(cb => cb.userId === user.userId);

  const transactionTypes = user.isManager
    ? ['قبض', 'مناقلة', 'دفع']
    : ['قبض', 'دفع'];

  // استقبال بيانات من خط السير
  useEffect(() => {
    if (pendingCash) {
      setTransactionType(pendingCash.type || 'قبض');
      if (pendingCash.customer) {
        setNotes(`عميل: ${pendingCash.customer.name}`);
      }
      setPendingCash(null);
    }
  }, [pendingCash, setPendingCash]);

  const getLocation = async () => {
    setLoadingLocation(true);
    try { const pos = await getCurrentPosition(); setCurrentLocation(pos); } catch (err) {}
    setLoadingLocation(false);
  };

  const handleAmountChange = (e) => {
    const raw = parseNumber(e.target.value);
    if (raw === '') { setAmount(''); return; }
    setAmount(formatNumber(raw));
  };

  const handleSave = () => {
    const numAmount = parseInt(parseNumber(amount));

    if (transactionType === 'مناقلة') {
      if (!user.isManager) { alert('غير مصرح لك بالمناقلة'); return; }
      if (!transferFromBox || !transferToBox) { alert('الرجاء تحديد الصندوق المرسل والمستلم'); return; }
      if (transferFromBox.id === transferToBox.id) { alert('لا يمكن المناقلة إلى نفس الصندوق'); return; }
      if (!numAmount || numAmount <= 0) { alert('الرجاء إدخال مبلغ صحيح'); return; }
      if (numAmount > transferFromBox.balance) { alert('رصيد الصندوق المرسل غير كافٍ'); return; }

      setCashBoxes(cashBoxes.map(cb => {
        if (cb.id === transferFromBox.id) return { ...cb, balance: cb.balance - numAmount };
        if (cb.id === transferToBox.id) return { ...cb, balance: cb.balance + numAmount };
        return cb;
      }));
      setTransactions([{ id: Date.now(), type: 'مناقلة', amount: numAmount, date: new Date().toISOString().split('T')[0], notes: notes || `من ${transferFromBox.name} إلى ${transferToBox.name}`, fromBox: transferFromBox.name, toBox: transferToBox.name }, ...transactions]);
      alert(`تمت المناقلة بنجاح\nالمبلغ: ${formatNumber(numAmount)} د.ع`);
      setAmount(''); setNotes(''); setTransferFromBox(null); setTransferToBox(null);
      return;
    }

    if (!numAmount || numAmount <= 0) { alert('الرجاء إدخال مبلغ صحيح'); return; }
    if (transactionType === 'دفع' && numAmount > activeCashBox.balance) { alert('رصيد الصندوق غير كافٍ'); return; }

    setTransactions([{ id: Date.now(), type: transactionType, amount: numAmount, date: new Date().toISOString().split('T')[0], notes, fromBox: '', toBox: '' }, ...transactions]);
    setCashBoxes(cashBoxes.map(cb => cb.id === activeCashBox.id ? { ...cb, balance: transactionType === 'قبض' ? cb.balance + numAmount : cb.balance - numAmount } : cb));
    alert(`تم تسجيل ${transactionType}\nالمبلغ: ${formatNumber(numAmount)} د.ع`);
    setAmount(''); setNotes('');
  };

  const styles = {
    screen: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
    header: { background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    content: { padding: '15px' },
    balanceCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '15px', border: '2px solid #10b981' },
    balanceLabel: { fontSize: '16px', color: '#6b7280', fontWeight: '600' },
    balanceAmount: { fontSize: '30px', fontWeight: 'bold', color: '#059669', marginTop: '8px' },
    label: { fontWeight: '600', color: '#374151', marginBottom: '8px', marginTop: '8px', fontSize: '14px' },
    typeRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
    typeBtn: (active, color) => ({ flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #e5e7eb', textAlign: 'center', cursor: 'pointer', backgroundColor: active ? (color === 'green' ? '#d1fae5' : color === 'red' ? '#fef2f2' : '#dbeafe') : 'white', borderColor: active ? (color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : '#3b82f6') : '#e5e7eb' }),
    input: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', textAlign: 'right', marginBottom: '10px' },
    selectBtn: { width: '100%', padding: '15px', backgroundColor: 'white', borderRadius: '12px', border: '2px solid #e5e7eb', cursor: 'pointer', fontSize: '16px', textAlign: 'right', marginBottom: '10px' },
    saveBtn: (color) => ({ width: '100%', padding: '15px', backgroundColor: color, color: 'white', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }),
    transactionItem: { backgroundColor: 'white', borderRadius: '12px', padding: '15px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
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
        <span style={styles.title}>الصندوق</span>
        <div style={{ width: '40px' }}></div>
      </div>
      <div style={styles.content}>
        <LocationDisplay location={currentLocation} onGetLocation={getLocation} loading={loadingLocation} label="حركة الصندوق" />

        <div style={styles.balanceCard}>
          <p style={styles.balanceLabel}>رصيد الصندوق</p>
          <p style={styles.balanceAmount}>{formatNumber(activeCashBox.balance)} د.ع</p>
        </div>

        <p style={styles.label}>نوع الحركة</p>
        <div style={styles.typeRow}>
          {transactionTypes.map(t => (
            <button key={t} style={styles.typeBtn(transactionType === t, t === 'قبض' ? 'green' : t === 'دفع' ? 'red' : 'blue')} onClick={() => setTransactionType(t)}>
              {t === 'قبض' ? '💰 قبض' : t === 'دفع' ? '💸 دفع' : '🔄 مناقلة'}
            </button>
          ))}
        </div>

        {transactionType === 'مناقلة' ? (
          <>
            <p style={styles.label}>من صندوق</p>
            <button style={styles.selectBtn} onClick={() => setShowTransferFrom(true)}>
              {transferFromBox ? transferFromBox.name : 'اختر الصندوق المرسل'}
            </button>
            <p style={styles.label}>إلى صندوق</p>
            <button style={styles.selectBtn} onClick={() => setShowTransferTo(true)}>
              {transferToBox ? transferToBox.name : 'اختر الصندوق المستلم'}
            </button>
            <input style={styles.input} placeholder="المبلغ" value={amount || (transferFromBox ? formatNumber(transferFromBox.balance) : '')} onChange={handleAmountChange} />
          </>
        ) : (
          <input style={styles.input} placeholder="المبلغ (د.ع)" value={amount} onChange={handleAmountChange} />
        )}

        <input style={styles.input} placeholder="ملاحظات (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <button style={styles.saveBtn(transactionType === 'قبض' ? '#10b981' : transactionType === 'دفع' ? '#ef4444' : '#3b82f6')} onClick={handleSave}>
          {transactionType === 'قبض' ? '💰 تسجيل قبض' : transactionType === 'دفع' ? '💸 تسجيل دفع' : '🔄 تنفيذ المناقلة'}
        </button>

        <p style={{ fontWeight: 'bold', margin: '15px 0 10px' }}>آخر الحركات</p>
        {transactions.map(t => (
          <div key={t.id} style={styles.transactionItem}>
            <div>
              <p style={{ fontWeight: '600' }}>
                {t.type === 'قبض' ? '💰 قبض' : t.type === 'دفع' ? '💸 دفع' : `🔄 مناقلة (${t.fromBox} → ${t.toBox})`}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>{t.date} - {t.notes || '-'}</p>
            </div>
            <span style={{ fontWeight: 'bold', color: t.type === 'قبض' ? '#10b981' : t.type === 'دفع' ? '#ef4444' : '#3b82f6' }}>
              {t.type === 'قبض' ? '+' : t.type === 'دفع' ? '-' : '↔'}{formatNumber(t.amount)} د.ع
            </span>
          </div>
        ))}
      </div>

      {showTransferFrom && (
        <div style={styles.modalOverlay} onClick={() => setShowTransferFrom(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p style={styles.modalTitle}>اختر الصندوق المرسل</p>
            {availableCashBoxes.map(cb => (
              <div key={cb.id} style={styles.modalItem} onClick={() => { setTransferFromBox(cb); setShowTransferFrom(false); setAmount(formatNumber(cb.balance)); }}>
                {cb.name} ({formatNumber(cb.balance)})
              </div>
            ))}
            <div style={styles.closeBtn} onClick={() => setShowTransferFrom(false)}>إغلاق</div>
          </div>
        </div>
      )}

      {showTransferTo && (
        <div style={styles.modalOverlay} onClick={() => setShowTransferTo(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <p style={styles.modalTitle}>اختر الصندوق المستلم</p>
            {availableCashBoxes.map(cb => (
              <div key={cb.id} style={styles.modalItem} onClick={() => { setTransferToBox(cb); setShowTransferTo(false); }}>
                {cb.name}
              </div>
            ))}
            <div style={styles.closeBtn} onClick={() => setShowTransferTo(false)}>إغلاق</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cash;
