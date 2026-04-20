import React, { useContext, useState, useRef } from 'react';
import { FinanceContext } from '../context/FinanceContext';
import { useBudget } from '../hooks/useBudget';
import { useCurrency } from '../hooks/useCurrency';
import { MdCameraAlt, MdDelete, MdSave } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const Account = () => {
   const { userProfile, updateProfile, resetAllData } = useContext(FinanceContext);
   const { monthlyBudget, updateBudget } = useBudget();
   const { currency, setCurrency } = useCurrency();
   const navigate = useNavigate();
   const fileInputRef = useRef(null);

   const [name, setName] = useState(userProfile.name || '');
   const [email, setEmail] = useState(userProfile.email || '');
   const [avatarPreview, setAvatarPreview] = useState(userProfile.avatar || 'https://i.pravatar.cc/100?img=33');

   const [budgetLimit, setBudgetLimit] = useState(monthlyBudget || 5000);
   const [selectedCurrency, setSelectedCurrency] = useState(currency || 'USD');

   const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            setAvatarPreview(reader.result);
         };
         reader.readAsDataURL(file);
      }
   };

   const handleSaveProfile = () => {
      updateProfile({ name, email, avatar: avatarPreview });
      toast.success('Profile updated successfully!');
   };

   const handleSaveSettings = () => {
      updateBudget(parseFloat(budgetLimit));
      setCurrency(selectedCurrency);
      toast.success('App settings updated successfully!');
   };

   const handleResetData = () => {
      if (window.confirm("ARE YOU SURE? Once you delete your data, there is no going back. This will wipe all transactions and reset the dashboard.")) {
         resetAllData();
         toast.success('All data has been reset to defaults.');
         navigate('/dashboard');
      }
   };

   return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '100%' }}>
         <h1 className="title" style={{ margin: 0, color: 'white', marginBottom: '5px' }}>My Account</h1>

         <div className="card" style={{ padding: '15px 20px' }}>
            
            {/* Profile Settings */}
            <div className="settings-group">
               <h3 style={{ marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', fontSize: '15px' }}>Profile Settings</h3>
               <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                     <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <img 
                           src={avatarPreview} 
                           alt="Profile" 
                           style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #18181c', boxShadow: '0 0 0 2px var(--primary)' }} 
                        />
                        <div 
                           onClick={() => fileInputRef.current?.click()}
                           style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', border: '2px solid #18181c' }}
                        >
                           <MdCameraAlt size={16} />
                        </div>
                        <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                     </div>
                     <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to edit</span>
                  </div>
                  
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Full Name</label>
                        <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
                     </div>
                     <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Email (Optional)</label>
                        <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />
                     </div>
                     <button className="compact-btn" style={{ width: 'fit-content', marginTop: '10px', padding: '0 25px' }} onClick={handleSaveProfile}>
                        Save Changes
                     </button>
                  </div>
               </div>
            </div>

            {/* App Settings */}
            <div className="settings-group" style={{ marginTop: '15px' }}>
               <h3 style={{ marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', fontSize: '15px' }}>App Settings</h3>
               
               <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label>Currency Symbol</label>
                  <select 
                     className="form-input" 
                     value={selectedCurrency} 
                     onChange={(e) => setSelectedCurrency(e.target.value)}
                     style={{ appearance: 'none', background: '#15151a' }}
                  >
                     <option value="USD">USD ($)</option>
                     <option value="EUR">EUR (€)</option>
                     <option value="GBP">GBP (£)</option>
                     <option value="INR">INR (₹)</option>
                  </select>
               </div>

               <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label>Monthly Budget Limit</label>
                  <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                     <span style={{ position: 'absolute', left: '15px', color: 'var(--text-muted)' }}>$</span>
                     <input type="number" className="form-input" value={budgetLimit} onChange={(e) => setBudgetLimit(e.target.value)} placeholder="5000" style={{ paddingLeft: '35px', width: '100%' }} />
                  </div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '5px' }}>This affects your Survival Status bar.</small>
               </div>

               <button className="compact-btn" style={{ display: 'block', marginTop: '20px', padding: '0 25px' }} onClick={handleSaveSettings}>
                  Save Rules
               </button>
            </div>

            {/* Danger Zone */}
            <div className="settings-group" style={{ marginTop: '15px' }}>
               <h3 style={{ color: '#ff754c', marginBottom: '10px', borderBottom: '1px solid rgba(255,117,76,0.2)', paddingBottom: '8px', fontSize: '15px' }}>Danger Zone</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '10px' }}>
                  Once you delete your data, there is no going back. This will wipe all transactions and reset the dashboard.
               </p>
               <button 
                  onClick={handleResetData}
                  style={{ 
                     background: 'rgba(255, 117, 76, 0.15)', 
                     color: '#ff754c', 
                     border: '1px solid rgba(255, 117, 76, 0.3)', 
                     padding: '10px 15px', 
                     borderRadius: '10px', 
                     cursor: 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px',
                     fontWeight: '600',
                     transition: '0.2s',
                     fontSize: '13px'
                  }}
               >
                  <MdDelete size={18} /> Reset All Data
               </button>
            </div>

         </div>
      </div>
   );
};
