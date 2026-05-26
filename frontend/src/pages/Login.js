import React, { useState } from 'react';

function Login({ onLogin, persons }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [error, setError] = useState('');

  const salespersons = persons.filter(p => p.type === 'مندوب');

  const handleLogin = () => {
    if (!selectedPerson) {
      setError('الرجاء اختيار المندوب');
      return;
    }
    if (!username || !password) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    onLogin({
      full_name: selectedPerson.name,
      role: 'مندوب',
      salespersonId: selectedPerson.id,
      userId: selectedPerson.id,
      isManager: selectedPerson.id === 5
    });
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
          نظام سيد حيدر
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>لإدارة الشركات</p>
      </div>

      <div style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '20px',
        width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#1e3a5f', fontSize: '22px' }}>
          تسجيل الدخول
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px',
            borderRadius: '10px', marginBottom: '15px', textAlign: 'center', fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
            اختر المندوب
          </label>
          <div style={{ maxHeight: '150px', overflowY: 'auto', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
            {salespersons.map(sp => (
              <div
                key={sp.id}
                onClick={() => setSelectedPerson(sp)}
                style={{
                  padding: '12px', cursor: 'pointer', borderBottom: '1px solid #f0f4f8',
                  backgroundColor: selectedPerson?.id === sp.id ? '#dbeafe' : 'white',
                  fontSize: '14px'
                }}
              >
                {sp.name} {sp.id === 5 ? '(مدير النظام)' : ''}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
            اسم المستخدم
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم"
            style={{
              width: '100%', padding: '12px', border: '2px solid #e5e7eb',
              borderRadius: '12px', fontSize: '16px', textAlign: 'right'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
            كلمة المرور
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
            style={{
              width: '100%', padding: '12px', border: '2px solid #e5e7eb',
              borderRadius: '12px', fontSize: '16px', textAlign: 'right'
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          style={{
            backgroundColor: '#2563eb', color: 'white', padding: '15px',
            borderRadius: '12px', width: '100%', border: 'none',
            fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          دخول
        </button>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '30px', fontSize: '12px' }}>
        نسخة تجريبية
      </p>
    </div>
  );
}

export default Login;
