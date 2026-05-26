import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sale from './pages/Sale';
import Purchase from './pages/Purchase';
import Return from './pages/Return';
import Cash from './pages/Cash';
import Products from './pages/Products';
import Persons from './pages/Persons';
import Settings from './pages/Settings';
import RoutePage from './pages/Route';
import {
  INITIAL_PRODUCTS, INITIAL_WAREHOUSES, INITIAL_CASHBOXES,
  INITIAL_INVENTORY, INITIAL_PERSONS, INITIAL_INVOICES, INITIAL_ROUTES
} from './data/initialData';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [persons, setPersons] = useState(INITIAL_PERSONS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES);
  const [cashBoxes, setCashBoxes] = useState(INITIAL_CASHBOXES);
  const [activeCashBoxId, setActiveCashBoxId] = useState(INITIAL_CASHBOXES[0].id);
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    const userCashBox = cashBoxes.find(cb => cb.userId === userData.userId);
    if (userCashBox) setActiveCashBoxId(userCashBox.id);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} persons={persons} />;
  }

  const canAccess = (path) => {
    if (user.isManager) return true;
    if (['/settings', '/purchase', '/products', '/persons'].includes(path)) return false;
    return true;
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <Dashboard user={user} onLogout={handleLogout}
              cashBoxes={cashBoxes} activeCashBoxId={activeCashBoxId}
              warehouses={warehouses} inventory={inventory} />
          } />
          <Route path="/sale" element={
            canAccess('/sale') ? <Sale user={user} products={products} persons={persons}
              invoices={invoices} setInvoices={setInvoices}
              inventory={inventory} setInventory={setInventory}
              warehouses={warehouses} cashBoxes={cashBoxes}
              setCashBoxes={setCashBoxes} activeCashBoxId={activeCashBoxId}
              selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} />
            : <Navigate to="/" />
          } />
          <Route path="/purchase" element={
            canAccess('/purchase') ? <Purchase user={user} products={products} persons={persons}
              inventory={inventory} setInventory={setInventory}
              warehouses={warehouses} cashBoxes={cashBoxes}
              setCashBoxes={setCashBoxes} activeCashBoxId={activeCashBoxId} />
            : <Navigate to="/" />
          } />
          <Route path="/return" element={
            canAccess('/return') ? <Return invoices={invoices} inventory={inventory} setInventory={setInventory} />
            : <Navigate to="/" />
          } />
          <Route path="/cash" element={
            canAccess('/cash') ? <Cash user={user} cashBoxes={cashBoxes} setCashBoxes={setCashBoxes}
              activeCashBoxId={activeCashBoxId} />
            : <Navigate to="/" />
          } />
          <Route path="/products" element={
            canAccess('/products') ? <Products products={products} setProducts={setProducts} />
            : <Navigate to="/" />
          } />
          <Route path="/persons" element={
            canAccess('/persons') ? <Persons user={user} persons={persons} setPersons={setPersons} />
            : <Navigate to="/" />
          } />
          <Route path="/route" element={
            <RoutePage user={user} routes={routes} setRoutes={setRoutes}
              persons={persons} setSelectedCustomer={setSelectedCustomer} />
          } />
          <Route path="/settings" element={
            canAccess('/settings') ? <Settings user={user} warehouses={warehouses} setWarehouses={setWarehouses}
              persons={persons} setPersons={setPersons} routes={routes} setRoutes={setRoutes} />
            : <Navigate to="/" />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
