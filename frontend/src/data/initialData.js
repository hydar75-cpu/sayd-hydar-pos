export const INITIAL_PRODUCTS = [
  { id: 1, name: 'حليب كامل الدسم ١ لتر', code: 'P001', barcode: '6281001234567', price: 1500, boxQty: 12, hasTransactions: true },
  { id: 2, name: 'زيت طبخ ١ لتر', code: 'P002', barcode: '6281001234568', price: 2500, boxQty: 12, hasTransactions: true },
  { id: 3, name: 'رز بسمتي ١ كغم', code: 'P003', barcode: '6281001234569', price: 3500, boxQty: 20, hasTransactions: false },
  { id: 4, name: 'سكر ١ كغم', code: 'P004', barcode: '6281001234570', price: 1000, boxQty: 24, hasTransactions: true },
  { id: 5, name: 'شاي ١٠٠ كيس', code: 'P005', barcode: '6281001234571', price: 2000, boxQty: 24, hasTransactions: false },
  { id: 6, name: 'معجون طماطم ٥٠٠ غم', code: 'P006', barcode: '6281001234572', price: 750, boxQty: 48, hasTransactions: true },
];

export const INITIAL_WAREHOUSES = [
  { id: 1, name: 'المخزن الرئيسي', hasTransactions: true, userId: 1 },
  { id: 2, name: 'مخزن الفرع الثاني', hasTransactions: false, userId: 2 },
];

export const INITIAL_CASHBOXES = [
  { id: 1, name: 'صندوق المبيعات', balance: 100000, userId: 1 },
  { id: 2, name: 'صندوق مندوب ٢', balance: 50000, userId: 2 },
];

export const INITIAL_INVENTORY = [
  { productId: 1, warehouseId: 1, quantity: 50 },
  { productId: 2, warehouseId: 1, quantity: 30 },
  { productId: 3, warehouseId: 1, quantity: 20 },
  { productId: 4, warehouseId: 1, quantity: 100 },
  { productId: 5, warehouseId: 1, quantity: 15 },
  { productId: 6, warehouseId: 1, quantity: 0 },
  { productId: 1, warehouseId: 2, quantity: 25 },
  { productId: 2, warehouseId: 2, quantity: 10 },
];

export const INITIAL_PERSONS = [
  {
    id: 1,
    type: 'مندوب',
    name: 'مدير النظام',
    username: 'مدير النظام',
    password: '1',
    phone: '07700000000',
    address: 'الإدارة الرئيسية',
    balance: 0,
    hasTransactions: false,
    isManager: true,
  },
  { id: 2, type: 'عميل', name: 'أحمد محمد', phone: '07701234567', address: 'بغداد - المنصور', balance: 0, hasTransactions: true },
  { id: 3, type: 'عميل', name: 'علي حسين', phone: '07702345678', address: 'بغداد - الكرادة', balance: 5000, hasTransactions: true },
  { id: 4, type: 'عميل', name: 'عميل نقدي', phone: '00000000', address: '-', balance: 0, hasTransactions: false },
  { id: 5, type: 'مورد', name: 'شركة المواد الغذائية', phone: '07801112233', address: 'بغداد - باب الشيخ', balance: 0, hasTransactions: false },
];

export const INITIAL_INVOICES = [];

export const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export const INITIAL_ROUTES = [
  {
    id: 1,
    salespersonId: 1,
    day: 'السبت',
    customers: [
      { customerId: 2, order: 1, status: 'pending' },
      { customerId: 3, order: 2, status: 'pending' },
    ]
  },
  {
    id: 2,
    salespersonId: 1,
    day: 'الأحد',
    customers: [
      { customerId: 2, order: 1, status: 'pending' },
      { customerId: 4, order: 2, status: 'pending' },
    ]
  },
];
