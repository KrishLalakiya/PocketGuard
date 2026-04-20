import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdDashboard, MdList, MdAddCircle, MdPieChart, MdAccountBalanceWallet, MdTrendingUp, MdAttachMoney, MdPerson, MdExitToApp } from 'react-icons/md';

export const Sidebar = ({ isOpen }) => {
  return (
    <aside className={isOpen ? 'sidebar' : 'sidebar collapsed'}>
      <ul className="nav-links">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="icon"><MdDashboard /></div>
            <span className="link-text">Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/account" className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="icon"><MdPerson /></div>
            <span className="link-text">Account</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/transactions" end className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="icon"><MdList /></div>
            <span className="link-text">Transaction</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="icon"><MdTrendingUp /></div>
            <span className="link-text">Cash Flow</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/budget" className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="icon"><MdAccountBalanceWallet /></div>
            <span className="link-text">Budget</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/goals" className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="icon"><MdPieChart /></div>
            <span className="link-text">Goals</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/investments" className={({ isActive }) => isActive ? 'active' : ''}>
            <div className="icon"><MdAttachMoney /></div>
            <span className="link-text">Investments</span>
          </NavLink>
        </li>
      </ul>
      <div className="nav-links" style={{ marginTop: 'auto', marginBottom: '20px' }}>
         <li>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
               <div className="icon"><MdExitToApp /></div>
               <span className="link-text">Logout</span>
            </NavLink>
         </li>
      </div>
    </aside>
  );
};
