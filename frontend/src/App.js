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
import {
  INITIAL_PRODUCTS, INITIAL_WAREHOUSES, INITIAL_CASHBOXES,
  INITIAL_INVENTORY, INITIAL_PERSONS, INITIAL_INVOICES
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
            <Sale user={user} products={products} persons={persons}
              invoices={invoices} setInvoices={setInvoices}
              inventory={inventory} setInventory={setInventory}
              warehouses={warehouses} cashBoxes={cashBoxes}
              setCashBoxes={setCashBoxes} activeCashBoxId={activeCashBoxId} />
          } />
          <Route path="/purchase" element={
            <Purchase user={user} products={products} persons={persons}
              inventory={inventory} setInventory={setInventory}
              warehouses={warehouses} cashBoxes={cashBoxes}
              setCashBoxes={setCashBoxes} activeCashBoxId={activeCashBoxId} />
          } />
          <Route path="/return" element={
            <Return invoices={invoices} inventory={inventory} setInventory={setInventory} />
          } />
          <Route path="/cash" element={
            <Cash user={user} cashBoxes={cashBoxes} setCashBoxes={setCashBoxes}
              activeCashBoxId={activeCashBoxId} />
          } />
          <Route path="/products" element={
            <Products products={products} setProducts={setProducts} />
          } />
          <Route path="/persons" element={
            <Persons persons={persons} setPersons={setPersons} />
          } />
          <Route path="/settings" element={
            <Settings warehouses={warehouses} setWarehouses={setWarehouses} />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
