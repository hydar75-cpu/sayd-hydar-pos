import React from 'react';

function LocationDisplay({ location, onGetLocation, loading, label }) {
  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '12px', padding: '12px',
      marginBottom: '12px', border: '1px solid #dbeafe'
    }}>
      <button
        onClick={onGetLocation}
        disabled={loading}
        style={{
          backgroundColor: '#eff6ff', padding: '12px', borderRadius: '10px',
          border: '1px solid #bfdbfe', width: '100%', cursor: 'pointer',
          fontSize: '14px', fontWeight: '600', color: '#2563eb'
        }}
      >
        {loading ? '⏳ جاري التحديد...' : location ? '📍 تم تحديد الموقع' : '📍 اضغط لتحديد الموقع'}
      </button>
      {location && (
        <div style={{ marginTop: '8px', padding: '0 4px' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>
            خط العرض: {location.latitude?.toFixed(6)}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>
            خط الطول: {location.longitude?.toFixed(6)}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>
            الوقت: {location.timestamp ? new Date(location.timestamp).toLocaleTimeString('ar-IQ') : '---'}
          </p>
        </div>
      )}
    </div>
  );
}

export default LocationDisplay;
