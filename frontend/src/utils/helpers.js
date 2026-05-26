// ============================================
// دوال مساعدة - نظام سيد حيدر
// ============================================

export const formatNumber = (num) => {
  if (!num && num !== 0) return '';
  return Number(num).toLocaleString('en');
};

export const parseNumber = (str) => {
  if (!str) return '';
  return str.replace(/[^0-9]/g, '');
};

export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => { reject(error); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      reject(new Error('Geolocation not supported'));
    }
  });
};

export const generateInvoiceNumber = (count) => {
  return `INV-${String(count + 1).padStart(6, '0')}`;
};

export const filterItems = (items, searchTerm, fields = ['name']) => {
  if (!searchTerm) return items;
  const term = searchTerm.toLowerCase();
  return items.filter(item =>
    fields.some(field =>
      String(item[field] || '').toLowerCase().includes(term)
    )
  );
};
