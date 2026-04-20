import React, { useState, useContext, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { FinanceContext } from '../context/FinanceContext';
import { Sidebar } from './Sidebar';
import { MdSearch, MdNotifications, MdMenu, MdWallet } from 'react-icons/md';

export const Layout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { userProfile } = useContext(FinanceContext);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
       navigate(`/transactions?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleSidebar = () => {
     setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      
      {/* Top Header */}
      <header className="top-header" style={{
         transition: '0.3s ease',
         ...(isScrolled ? { background: 'rgba(24, 24, 28, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 30px rgba(0,0,0,0.5)' } : {})
      }}>
         <div className="header-left">
            <div className="menu-icon-wrapper" onClick={toggleSidebar}>
               <MdMenu size={24} />
            </div>
            <div className="logo" style={{ fontSize: '26px' }}>
                <div className="logo-icon"><MdWallet size={30} /></div>
                PocketGuard
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '16px', marginLeft: '15px' }}>Track your financial health in real-time</span>
         </div>

         <div className="header-right">
            <div className="search-bar">
               <MdSearch size={20} />
               <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
               />
            </div>
            <div className="notification-icon">
               <MdNotifications size={24} />
               <div className="badge"></div>
            </div>
            <Link to="/account" className="user-profile" style={{ textDecoration: 'none' }}>
               <div className="text-info">
                  <span className="name">{userProfile?.name || 'Alex Johnson'}</span>
                  <span className="role">Premium</span>
               </div>
               <img src={userProfile?.avatar || 'https://i.pravatar.cc/150?img=11'} alt="Profile" />
            </Link>
         </div>
      </header>

      {/* Expanded/Collapsed Sidebar controlled by state */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main Content Area */}
      <main className={`main-content ${!isSidebarOpen ? 'expanded' : ''}`}>
        <Outlet />
      </main>
    </>
  );
};
