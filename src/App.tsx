import React, { useState, useEffect } from 'react';
import { 
  Zap, Plus, Trash2, History, Settings, ShieldCheck, AlertTriangle, 
  CheckCircle, Home, Layers, Building2, Users, Bell, CreditCard, 
  Lock, Unlock, WifiOff, Copy, Check, Smartphone, User, HelpCircle, 
  TrendingUp, RefreshCw, SmartphoneIcon, UserCheck, ArrowRight, Share2
} from 'lucide-react';

import { Meter, Transaction, FamilyMember, RentalProperty, UserProfile } from './types';
import MobileSimulator from './components/MobileSimulator';
import DarajaTerminal from './components/DarajaTerminal';
import ReceiptModal from './components/ReceiptModal';
import Slider from './components/Slider';
import BiometricPrompt from './components/BiometricPrompt';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'meters' | 'history' | 'rental' | 'settings'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  
  // Auth Form State
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [tempOtp, setTempOtp] = useState('');
  const [authError, setAuthError] = useState('');

  // App Global State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [selectedMeterId, setSelectedMeterId] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [rentalProperties, setRentalProperties] = useState<RentalProperty[]>([]);
  
  // Custom Controls State
  const [isOffline, setIsOffline] = useState(false);
  const [activeAmount, setActiveAmount] = useState<number | null>(null);
  const [showBiometricOverlay, setShowBiometricOverlay] = useState(false);
  const [biometricAction, setBiometricAction] = useState<'login' | 'pay'>('login');
  const [showAddMeterModal, setShowAddMeterModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  
  // Add Meter Form State
  const [newMeterNum, setNewMeterNum] = useState('');
  const [newMeterNickname, setNewMeterNickname] = useState('');
  const [newMeterAddress, setNewMeterAddress] = useState('');
  const [newMeterIsRental, setNewMeterIsRental] = useState(false);
  const [newMeterTenantName, setNewMeterTenantName] = useState('');
  const [newMeterTenantPhone, setNewMeterTenantPhone] = useState('');
  const [addMeterError, setAddMeterError] = useState('');

  // Add Family Form State
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');
  const [newFamilyPhone, setNewFamilyPhone] = useState('');
  const [newFamilyLimit, setNewFamilyLimit] = useState('2000');
  const [newFamilyMeters, setNewFamilyMeters] = useState<string[]>([]);
  const [showAddFamily, setShowAddFamily] = useState(false);

  // Daraja Payment Core Sync State
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [checkoutAmount, setCheckoutAmount] = useState<number | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  
  // UI States
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Time Simulator
  const [currentTime, setCurrentTime] = useState('18:58');

  // Trigger Toast notifications
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch initial profile & data
  useEffect(() => {
    fetchProfile();
    fetchMeters();
    fetchTransactions();
    fetchFamilyMembers();
    fetchRentalProperties();

    // Set time clock simulator
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, '0');
      let minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 30000);
    return () => clearInterval(clockInterval);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data.biometricEnabled) {
          // Trigger automatic biometric login simulation
          setBiometricAction('login');
          setShowBiometricOverlay(true);
        } else {
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchMeters = async () => {
    try {
      const res = await fetch('/api/meters');
      if (res.ok) {
        const data = await res.json();
        setMeters(data);
        if (data.length > 0) {
          setSelectedMeterId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const res = await fetch('/api/family/members');
      if (res.ok) {
        const data = await res.json();
        setFamilyMembers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRentalProperties = async () => {
    try {
      const res = await fetch('/api/rental/properties');
      if (res.ok) {
        const data = await res.json();
        setRentalProperties(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auth Functions
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!phoneInput || phoneInput.length < 9) {
      setAuthError('Please enter a valid Kenyan phone number.');
      return;
    }

    // Standardize to Kenyan code
    let cleanPhone = phoneInput.replace(/\s+/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '+254' + cleanPhone.slice(1);
    else if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;

    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (res.ok) {
        setTempOtp(data.otp);
        setAuthStep('otp');
        addToast(`SMS verification code sent successfully to ${cleanPhone}`, 'info');
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError('Connection failed. Please verify your server is running.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    let cleanPhone = phoneInput.replace(/\s+/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '+254' + cleanPhone.slice(1);
    else if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;

    try {
      const res = await fetch('/api/auth/confirm-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: otpInput })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.profile);
        setIsAuthenticated(true);
        addToast('Authentication successful!', 'success');
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError('Verification failed. Try again.');
    }
  };

  // Payment Initiation Flow
  const handleSlideToPay = async () => {
    if (isOffline) {
      addToast("You are currently in Offline Mode. Switch to USSD Fallback in settings or enable connectivity.", "error");
      return;
    }

    if (!selectedMeterId || !activeAmount) {
      addToast("Please select a meter and amount first.", "error");
      return;
    }

    if (user?.biometricEnabled) {
      setBiometricAction('pay');
      setShowBiometricOverlay(true);
    } else {
      executeStkPush();
    }
  };

  const executeStkPush = async () => {
    const selectedMeter = meters.find(m => m.id === selectedMeterId);
    if (!selectedMeter || !activeAmount) return;

    setCheckoutStatus('pending');
    setCheckoutAmount(activeAmount);

    try {
      const res = await fetch('/api/purchase/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone,
          amount: activeAmount,
          meterId: selectedMeterId
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCheckoutRequestId(data.checkoutRequestId);
        addToast(`M-Pesa STK push request triggered! Check Sandbox Console`, 'success');
        
        // Start polling the server for transaction resolution
        startStatusPolling(data.checkoutRequestId);
      } else {
        addToast(data.error, 'error');
        setCheckoutStatus('failed');
      }
    } catch (err) {
      addToast('M-Pesa STK connection failed.', 'error');
      setCheckoutStatus('failed');
    }
  };

  // Poll for checkout resolution
  const startStatusPolling = (reqId: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 30) { // Limit polling to 1 minute
        clearInterval(interval);
        setCheckoutStatus('failed');
        addToast("Daraja STK push timed out.", "error");
        return;
      }

      try {
        const res = await fetch(`/api/purchase/status/${reqId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'completed') {
            clearInterval(interval);
            setCheckoutStatus('success');
            addToast(`Token purchased successfully!`, 'success');
            
            // Refresh meters & history from backend
            fetchMeters();
            fetchTransactions();
            fetchRentalProperties();
            
            // Auto open the newly created receipt!
            setTimeout(() => {
              // Find latest transaction
              fetchTransactions().then(() => {
                // Find matching tx
                fetch('/api/transactions')
                  .then(r => r.json())
                  .then(txs => {
                    const latest = txs.find((t: Transaction) => t.checkoutRequestId === reqId);
                    if (latest) setActiveReceipt(latest);
                  });
              });
            }, 500);

            // Clean up state
            setCheckoutRequestId(null);
            setCheckoutAmount(null);
            setActiveAmount(null);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            setCheckoutStatus('failed');
            addToast(`M-Pesa transaction was declined.`, 'error');
            
            // Refresh transaction history
            fetchTransactions();
            
            setCheckoutRequestId(null);
            setCheckoutAmount(null);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 1500);
  };

  // Developer terminal triggers callback event
  const handleSandboxCallback = (reqId: string, resultCode: number, receipt?: string) => {
    // If successful, the polling will catch it automatically!
    if (resultCode !== 0) {
      setCheckoutStatus('failed');
      setCheckoutRequestId(null);
    }
  };

  // Add Meter Form handler
  const handleAddMeter = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMeterError('');

    if (!newMeterNickname || !newMeterNum) {
      setAddMeterError('Meter number and nickname are required.');
      return;
    }

    try {
      const res = await fetch('/api/meters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meterNumber: newMeterNum,
          nickname: newMeterNickname,
          address: newMeterAddress,
          isRental: newMeterIsRental,
          tenantName: newMeterIsRental ? newMeterTenantName : undefined,
          tenantPhone: newMeterIsRental ? newMeterTenantPhone : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(`Meter "${newMeterNickname}" added successfully!`, 'success');
        fetchMeters();
        fetchRentalProperties();
        
        // Reset Form
        setNewMeterNickname('');
        setNewMeterNum('');
        setNewMeterAddress('');
        setNewMeterIsRental(false);
        setNewMeterTenantName('');
        setNewMeterTenantPhone('');
        setShowAddMeterModal(false);
      } else {
        setAddMeterError(data.error);
      }
    } catch (err) {
      setAddMeterError('Could not connect to server.');
    }
  };

  // Delete Meter Handler
  const handleDeleteMeter = async (id: string) => {
    if (confirm("Are you sure you want to remove this meter account?")) {
      try {
        const res = await fetch(`/api/meters/${id}`, { method: 'DELETE' });
        if (res.ok) {
          addToast("Meter removed successfully", "success");
          fetchMeters();
          fetchRentalProperties();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Add Family Member Handler
  const handleAddFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName || !newFamilyPhone) {
      addToast("Name and phone are required for family accounts", "error");
      return;
    }

    try {
      const res = await fetch('/api/family/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFamilyName,
          relation: newFamilyRelation,
          phone: newFamilyPhone,
          spendingLimit: newFamilyLimit,
          allowedMeters: newFamilyMeters
        })
      });
      if (res.ok) {
        addToast(`Added ${newFamilyName} to your Family account!`, 'success');
        fetchFamilyMembers();
        
        // Reset
        setNewFamilyName('');
        setNewFamilyPhone('');
        setNewFamilyLimit('2000');
        setNewFamilyMeters([]);
        setShowAddFamily(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Remove Family Member
  const handleRemoveFamilyMember = async (id: string) => {
    try {
      const res = await fetch(`/api/family/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast("Family member access revoked.", "info");
        fetchFamilyMembers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Send Landlord Tenant Low-Token Notification
  const handleNotifyTenant = async (propertyId: string, tenantName: string) => {
    try {
      const res = await fetch('/api/rental/notify-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      });
      if (res.ok) {
        addToast(`Low Token warning text sent to ${tenantName}!`, 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle user config
  const handleToggleSetting = async (key: keyof UserProfile, val: any) => {
    if (!user) return;
    const updated = { ...user, [key]: val };
    setUser(updated);
    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: val })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const selectedMeter = meters.find(m => m.id === selectedMeterId) || meters[0] || null;

  return (
    <div class="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col items-center justify-center p-4 xl:p-8 overflow-x-hidden font-sans relative">
      
      {/* Decorative ambient background grid */}
      <div class="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none"></div>
      
      {/* Global Notification Toast Stack */}
      <div class="fixed top-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            class={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 transition-all duration-300 pointer-events-auto animate-slide-left text-xs font-semibold ${
              toast.type === 'success' 
                ? 'bg-white border-green-500/20 text-green-700 shadow-md' 
                : toast.type === 'error'
                ? 'bg-white border-rose-500/20 text-rose-700 shadow-md'
                : 'bg-white border-blue-500/20 text-blue-700 shadow-md'
            }`}
          >
            {toast.type === 'success' && <CheckCircle class="w-4 h-4 text-green-500 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle class="w-4 h-4 text-rose-500 shrink-0" />}
            {toast.type === 'info' && <Bell class="w-4 h-4 text-blue-500 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <div class="w-full max-w-6xl z-10 flex flex-col gap-6">
        
        {/* CTO Landing header */}
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-neutral-200 pb-6 mb-2">
          <div class="flex items-center gap-3">
            <div class="bg-neutral-900 p-2.5 rounded-2xl text-white shadow-md">
              <Zap class="w-7 h-7 text-white fill-white/10" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-display font-black tracking-tight text-neutral-900">Volt / UmemePay</h1>
                <span class="bg-neutral-900 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest">
                  Series A Beta
                </span>
              </div>
              <p class="text-xs text-neutral-500 mt-1 max-w-xl font-sans">
                The future of automated, zero-friction prepaid utility payments in Kenya. Engineered with active Safaricom Daraja STK loops & KPLC Cost-Tax breakbacks.
              </p>
            </div>
          </div>
          <div class="mt-4 md:mt-0 flex items-center gap-3">
            <button
              id="global-network-toggle"
              onClick={() => {
                setIsOffline(!isOffline);
                addToast(isOffline ? "Online engine enabled!" : "Offline fallback enabled. App will simulate USSD offline guides.", isOffline ? "success" : "info");
              }}
              class={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition duration-200 ${
                isOffline
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                  : 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff class="w-3.5 h-3.5 text-rose-600" />
                  <span>Offline Mode (USSD Mode)</span>
                </>
              ) : (
                <>
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                  <span>System Live & Connected</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Core Layout split: Left smartphone, Right sandbox console */}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: iPhone Simulator wrapper */}
          <div class="lg:col-span-5 xl:col-span-5 flex justify-center">
            <MobileSimulator currentTime={currentTime}>
              
              {/* Conditional viewport views based on Auth state */}
              {!isAuthenticated ? (
                <div class="flex-1 flex flex-col justify-between p-6 bg-white h-full relative">
                  
                  <div class="flex-1 flex flex-col items-center justify-center text-center mt-8">
                    <div class="w-16 h-16 rounded-[22px] bg-neutral-950 text-white flex items-center justify-center shadow-md mb-5">
                      <Zap class="w-8 h-8 fill-white/10" />
                    </div>
                    <h2 class="text-2xl font-display font-extrabold text-neutral-900 tracking-tight">Volt / UmemePay</h2>
                    <p class="text-xs text-neutral-500 mt-2 max-w-[240px]">
                      Frictionless prepaid electricity purchasing and delivery for KPLC meters in Kenya.
                    </p>

                    {authStep === 'phone' ? (
                      <form onSubmit={handleRequestOtp} class="w-full mt-8 space-y-4">
                        <div class="text-left">
                          <label class="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">Enter M-Pesa Phone Number</label>
                          <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 flex items-center gap-1">
                              <span class="text-[14px]">🇰🇪</span> +254
                            </span>
                            <input
                              id="auth-phone-input"
                              type="tel"
                              placeholder="722 000 111"
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                              class="w-full bg-white border border-neutral-200 rounded-xl py-3 pl-16 pr-4 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                            />
                          </div>
                        </div>
                        {authError && <p class="text-rose-600 text-[10px] text-left font-medium">{authError}</p>}
                        <button
                          id="send-otp-btn"
                          type="submit"
                          class="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md focus:outline-none"
                        >
                          <span>Request Verification Code</span>
                          <ArrowRight class="w-3.5 h-3.5" />
                        </button>
                        <p class="text-[10px] text-neutral-400 italic">No credentials needed. Any valid Kenyan number works.</p>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} class="w-full mt-8 space-y-4">
                        <div class="text-left">
                          <label class="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">Enter SMS Verification Code</label>
                          <input
                             id="auth-otp-input"
                             type="text"
                             maxLength={4}
                             placeholder="••••"
                             value={otpInput}
                             onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                             class="w-full bg-white border border-neutral-200 rounded-xl py-3 px-4 text-center text-xl tracking-widest text-neutral-900 font-mono focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                          />
                        </div>
                        {authError && <p class="text-rose-600 text-[10px] text-left font-medium">{authError}</p>}
                        
                        <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-left">
                          <span class="text-[10px] font-bold text-neutral-500 uppercase block">Simulator SMS Log</span>
                          <p class="text-[11px] text-neutral-900 font-mono mt-1">StimaPay OTP: <span class="underline font-bold font-sans">{tempOtp}</span></p>
                          <span class="text-[9px] text-neutral-400 block mt-1">Using master bypass 1234 also succeeds.</span>
                        </div>

                        <button
                          id="verify-otp-btn"
                          type="submit"
                          class="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 focus:outline-none"
                        >
                          <span>Confirm and Login</span>
                        </button>

                        <button
                          id="back-to-phone-btn"
                          type="button"
                          onClick={() => setAuthStep('phone')}
                          class="w-full text-neutral-500 hover:text-neutral-800 text-[11px] font-semibold transition py-1 focus:outline-none"
                        >
                          Change Phone Number
                        </button>
                      </form>
                    )}
                  </div>

                  <div class="text-[10px] text-center text-neutral-400 font-mono">
                    REGULATED BY EPRA & CAK
                  </div>
                </div>
              ) : (
                <div class="flex-1 flex flex-col justify-between h-full bg-white text-neutral-900">
                  
                  {/* Outer view rendering based on Selected tab */}
                  <div class="flex-1 flex flex-col overflow-y-auto no-scrollbar p-5 pb-24">
                    
                    {/* View Header */}
                    <div class="flex items-center justify-between mb-5">
                      <div>
                        {activeTab === 'dashboard' && (
                          <>
                            <p class="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Sasa, Jomo!</p>
                            <h2 class="text-lg font-display font-extrabold text-neutral-900">Prepaid Electricity</h2>
                          </>
                        )}
                        {activeTab === 'meters' && (
                          <>
                            <p class="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Configure Accounts</p>
                            <h2 class="text-lg font-display font-extrabold text-neutral-900">KPLC Meters</h2>
                          </>
                        )}
                        {activeTab === 'history' && (
                          <>
                            <p class="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Purchase History</p>
                            <h2 class="text-lg font-display font-extrabold text-neutral-900">Transmissions</h2>
                          </>
                        )}
                        {activeTab === 'rental' && (
                          <>
                            <p class="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Landlord Hub</p>
                            <h2 class="text-lg font-display font-extrabold text-neutral-900">Rental Properties</h2>
                          </>
                        )}
                        {activeTab === 'settings' && (
                          <>
                            <p class="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">App Preferences</p>
                            <h2 class="text-lg font-display font-extrabold text-neutral-900">My Settings</h2>
                          </>
                        )}
                      </div>
                      
                      {/* Interactive Avatar */}
                      <div class="flex items-center gap-2">
                        {isOffline && (
                          <div class="bg-rose-50 border border-rose-200 text-rose-600 p-1 rounded-lg">
                            <WifiOff class="w-3.5 h-3.5" />
                          </div>
                        )}
                        <img
                          src={user?.avatarUrl}
                          class="w-8 h-8 rounded-full border border-neutral-200 object-cover"
                          alt="Avatar"
                        />
                      </div>
                    </div>

                    {/* View rendering blocks */}
                    
                    {/* 1. DASHBOARD VIEW */}
                    {activeTab === 'dashboard' && (
                      <div class="space-y-5 animate-fade-in">
                        
                        {/* Selector of Meters */}
                        {meters.length > 0 && (
                          <div class="relative">
                            <select
                              id="dashboard-meter-select"
                              value={selectedMeterId}
                              onChange={(e) => {
                                setSelectedMeterId(e.target.value);
                                setActiveAmount(null);
                              }}
                              class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-neutral-900 cursor-pointer appearance-none"
                            >
                              {meters.map(m => (
                                <option key={m.id} value={m.id}>
                                  {m.nickname} ({m.meterNumber})
                                </option>
                              ))}
                            </select>
                            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-[10px]">
                              ▼
                            </div>
                          </div>
                        )}

                        {/* Power Gauge card */}
                        {selectedMeter ? (
                          <div class={`border rounded-[28px] p-5 relative overflow-hidden transition-all duration-300 ${
                            selectedMeter.status === 'low'
                              ? 'bg-rose-50 border-rose-200 shadow-sm'
                              : selectedMeter.status === 'warning'
                              ? 'bg-amber-50 border-amber-200 shadow-sm'
                              : 'bg-neutral-50 border-neutral-200 shadow-sm'
                          }`}>
                            <div class="absolute top-0 right-0 w-36 h-36 rounded-full bg-radial from-neutral-500/5 to-transparent pointer-events-none"></div>

                            <div class="flex items-start justify-between">
                              <div>
                                <span class="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Remaining Balance</span>
                                <div class="flex items-baseline gap-1 mt-1">
                                  <span class="text-3xl font-display font-extrabold text-neutral-900">{selectedMeter.balanceKwh}</span>
                                  <span class="text-xs font-semibold text-neutral-400">kWh</span>
                                </div>
                              </div>
                              <div class="text-right">
                                <span class="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Estimated Run</span>
                                <div class="flex items-center justify-end gap-1 mt-1">
                                  <span class={`text-sm font-bold ${
                                    selectedMeter.status === 'low' ? 'text-rose-600' : selectedMeter.status === 'warning' ? 'text-amber-600' : 'text-green-600'
                                  }`}>
                                    {Math.round(selectedMeter.balanceKwh / selectedMeter.averageDailyKwh)} days
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Circular/Line battery scale */}
                            <div class="w-full h-1.5 bg-neutral-200 rounded-full mt-4 overflow-hidden">
                              <div
                                class={`h-full rounded-full transition-all duration-1000 ${
                                  selectedMeter.status === 'low' ? 'bg-rose-500' : selectedMeter.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                                  }`}
                                style={{ width: `${Math.min(100, (selectedMeter.balanceKwh / 100) * 100)}%` }}
                              ></div>
                            </div>

                            {/* Threshold Warning notifications */}
                            {selectedMeter.status === 'low' && (
                              <div class="flex items-center gap-2 mt-4 bg-rose-100/50 border border-rose-200 rounded-xl p-2.5 text-rose-800 text-[10px] font-medium leading-relaxed">
                                <AlertTriangle class="w-4 h-4 shrink-0 text-rose-600" />
                                <span>CRITICAL: Token balance below threshold ({user?.lowTokenThreshold} kWh). Meter may trip shortly. Auto-topup queue active.</span>
                              </div>
                            )}

                            {selectedMeter.status === 'warning' && (
                              <div class="flex items-center gap-2 mt-4 bg-amber-100/50 border border-amber-200 rounded-xl p-2.5 text-amber-800 text-[10px] font-medium leading-relaxed">
                                <AlertTriangle class="w-4 h-4 shrink-0 text-amber-600" />
                                <span>WARNING: Balance represents approx {Math.round(selectedMeter.balanceKwh / selectedMeter.averageDailyKwh)} days of typical usage. Consider recharging.</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div class="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-center">
                            <Layers class="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                            <h4 class="font-bold text-neutral-800 text-sm">No Saved Meters</h4>
                            <p class="text-xs text-neutral-500 mt-1">Please add a KPLC meter in the Meters tab to start purchasing.</p>
                          </div>
                        )}

                        {/* Topup Amount selection panel */}
                        {selectedMeter && (
                          <div class="space-y-4">
                            <div class="flex items-center justify-between">
                              <span class="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Select Topup Amount</span>
                              <span class="text-[10px] text-neutral-400 font-medium">KES</span>
                            </div>

                            <div class="grid grid-cols-4 gap-2">
                              {[250, 500, 1000, 2000].map(amt => (
                                <button
                                  id={`quick-amount-btn-${amt}`}
                                  key={amt}
                                  onClick={() => {
                                    if (checkoutStatus === 'pending') return;
                                    setActiveAmount(amt);
                                  }}
                                  class={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition duration-200 border ${
                                    activeAmount === amt
                                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                                  }`}
                                >
                                  {amt}
                                </button>
                              ))}
                            </div>

                            {/* Custom Amount Field */}
                            <div class="relative">
                              <input
                                id="custom-amount-input"
                                type="number"
                                placeholder="Enter other amount (Min KES 100)"
                                value={activeAmount || ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? null : Number(e.target.value);
                                  setActiveAmount(val);
                                }}
                                class="w-full bg-white border border-neutral-200 rounded-xl py-2.5 px-4 text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-900 transition"
                              />
                            </div>

                            {/* Estimated kWh return indicator */}
                            {activeAmount && activeAmount >= 100 && (
                              <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex justify-between items-center animate-fade-in text-xs font-medium">
                                <span class="text-neutral-500">Estimated Units:</span>
                                <span class="font-mono text-neutral-900 font-bold">~ {Math.round(activeAmount * 0.58 / 18.5)} kWh</span>
                              </div>
                            )}

                            {/* Pay Action button slider */}
                            {activeAmount && activeAmount >= 100 && (
                              <div class="pt-2 animate-scale-up">
                                <Slider
                                  onConfirm={handleSlideToPay}
                                  disabled={checkoutStatus === 'pending'}
                                  label={`Swipe to Pay Kes ${activeAmount.toLocaleString()}`}
                                />
                              </div>
                            )}

                            {/* Dynamic status screen overlay */}
                            {checkoutStatus === 'pending' && (
                              <div class="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center animate-pulse gap-2">
                                <div class="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
                                <h5 class="text-xs font-bold text-neutral-900">Processing Safaricom STK Push</h5>
                                <p class="text-[10px] text-neutral-500 max-w-xs">Waiting for PIN authorization inside the Sandbox Console on the right...</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Recent Transactions List widget */}
                        <div class="space-y-3 pt-2">
                          <div class="flex items-center justify-between pb-1">
                            <span class="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Recent Tokens</span>
                            <button
                              id="see-all-history-btn"
                              onClick={() => setActiveTab('history')}
                              class="text-[10px] font-bold text-neutral-950 hover:text-neutral-700"
                            >
                              See All
                            </button>
                          </div>

                          <div class="space-y-2">
                            {transactions.slice(0, 2).map((tx) => (
                              <div
                                key={tx.id}
                                onClick={() => setActiveReceipt(tx)}
                                class="bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 hover:border-neutral-200 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition"
                              >
                                <div class="flex items-center gap-3">
                                  <div class={`p-2 rounded-xl border ${
                                    tx.status === 'completed' 
                                      ? 'bg-green-50 border-green-200 text-green-600' 
                                      : 'bg-rose-50 border-rose-200 text-rose-600'
                                  }`}>
                                    <Zap class="w-4 h-4" />
                                  </div>
                                  <div class="text-left">
                                    <p class="text-xs font-bold text-neutral-900 leading-none">{tx.meterNickname}</p>
                                    <span class="text-[9px] text-neutral-500 block mt-1">
                                      {new Date(tx.timestamp).toLocaleDateString('en-KE')} • {tx.kwh} kWh
                                    </span>
                                  </div>
                                </div>
                                <div class="text-right">
                                  <p class="text-xs font-bold font-mono text-neutral-900">KES {tx.amount}</p>
                                  <span class="text-[9px] text-neutral-400 underline block mt-1 font-mono">View Receipt</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* 2. METERS VIEW */}
                    {activeTab === 'meters' && (
                      <div class="space-y-4 animate-fade-in">
                        
                        <button
                          id="show-add-meter-btn"
                          onClick={() => setShowAddMeterModal(true)}
                          class="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-950 rounded-2xl py-3 text-xs font-bold text-white flex items-center justify-center gap-2 transition focus:outline-none"
                        >
                          <Plus class="w-4 h-4 text-white" />
                          <span>Link New KPLC Meter</span>
                        </button>

                        <div class="space-y-3">
                          {meters.map(m => (
                            <div key={m.id} class="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-col relative overflow-hidden">
                              <div class="flex items-start justify-between">
                                <div class="text-left">
                                  <h4 class="font-bold text-neutral-900 text-sm leading-snug">{m.nickname}</h4>
                                  <span class="text-[10px] font-mono text-neutral-500 mt-1 block">Account No: {m.meterNumber}</span>
                                </div>
                                <button
                                  id={`delete-meter-btn-${m.id}`}
                                  onClick={() => handleDeleteMeter(m.id)}
                                  class="text-neutral-400 hover:text-rose-600 p-1 rounded-lg hover:bg-neutral-100 transition"
                                >
                                  <Trash2 class="w-4 h-4" />
                                </button>
                              </div>

                              <div class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-neutral-200 text-left">
                                <div>
                                  <span class="text-[9px] text-neutral-500 uppercase block">Power Level</span>
                                  <span class={`text-xs font-bold font-mono block mt-0.5 ${
                                    m.status === 'low' ? 'text-rose-600' : m.status === 'warning' ? 'text-amber-600' : 'text-green-600'
                                  }`}>
                                    {m.balanceKwh} kWh
                                  </span>
                                </div>
                                <div>
                                  <span class="text-[9px] text-neutral-500 uppercase block">Account Type</span>
                                  <span class="text-xs font-bold text-neutral-800 block mt-0.5">
                                    {m.isRental ? '🏠 Rental Property' : '👤 Private Residence'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}

                    {/* 3. HISTORY VIEW */}
                    {activeTab === 'history' && (
                      <div class="space-y-3 animate-fade-in">
                        
                        {transactions.length === 0 ? (
                          <div class="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 text-center text-neutral-500">
                            <History class="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                            <span>No transactions processed yet.</span>
                          </div>
                        ) : (
                          transactions.map(tx => (
                            <div
                              key={tx.id}
                              onClick={() => setActiveReceipt(tx)}
                              class="bg-neutral-50 hover:bg-neutral-100/50 border border-neutral-100 hover:border-neutral-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition select-none text-left"
                            >
                              <div class="flex items-center gap-3">
                                <div class={`p-2.5 rounded-xl border ${
                                  tx.status === 'completed' 
                                    ? 'bg-green-50 border-green-200 text-green-600' 
                                    : 'bg-rose-50 border-rose-200 text-rose-600'
                                }`}>
                                  <Zap class="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 class="font-bold text-neutral-900 text-xs">{tx.meterNickname}</h4>
                                  <p class="text-[9px] text-neutral-500 mt-0.5 font-mono">
                                    {new Date(tx.timestamp).toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' })}
                                  </p>
                                </div>
                              </div>
                              <div class="text-right">
                                <p class="text-xs font-bold font-mono text-neutral-900">KES {tx.amount}</p>
                                <span class={`text-[9px] font-bold block mt-1 uppercase tracking-wider ${
                                  tx.status === 'completed' ? 'text-green-600' : 'text-rose-600'
                                }`}>
                                  {tx.status === 'completed' ? `${tx.kwh} kWh` : 'Failed'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}

                      </div>
                    )}

                    {/* 4. RENTAL / LANDLORD VIEW */}
                    {activeTab === 'rental' && (
                      <div class="space-y-4 animate-fade-in text-left">
                        
                        <div class="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-neutral-850 text-xs leading-relaxed">
                          <Building2 class="w-5 h-5 mb-1.5 text-neutral-900" />
                          <h4 class="font-bold text-neutral-950">Tenant Billing Automation</h4>
                          <p class="text-[10px] mt-0.5 text-neutral-500">Monitor consumption across your rental assets. Send automated low-token SMS notifications directly to tenants whenever their balances drop below thresholds.</p>
                        </div>

                        <div class="space-y-3">
                          {rentalProperties.map(prop => (
                            <div key={prop.id} class="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-4">
                              <div class="flex justify-between items-start">
                                <div>
                                  <h4 class="font-bold text-neutral-900 text-sm">{prop.propertyName}</h4>
                                  <span class="text-[10px] text-neutral-500">{prop.unitNumber} • Meter {prop.meterNumber}</span>
                                </div>
                                <span class={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                                  prop.currentKwh < prop.warningThreshold 
                                    ? 'bg-rose-50 border border-rose-200 text-rose-600' 
                                    : 'bg-green-50 border border-green-200 text-green-600'
                                }`}>
                                  {prop.currentKwh} kWh left
                                </span>
                              </div>

                              <div class="bg-white border border-neutral-200 rounded-xl p-3 text-xs space-y-2">
                                <div class="flex justify-between text-[11px]">
                                  <span class="text-neutral-500">Tenant Name:</span>
                                  <span class="font-medium text-neutral-800">{prop.tenantName}</span>
                                </div>
                                <div class="flex justify-between text-[11px]">
                                  <span class="text-neutral-500">Tenant Phone:</span>
                                  <span class="font-mono text-neutral-800">{prop.tenantPhone}</span>
                                </div>
                              </div>

                              <div class="flex items-center gap-2">
                                <button
                                  id={`notify-tenant-btn-${prop.id}`}
                                  onClick={() => handleNotifyTenant(prop.id, prop.tenantName)}
                                  class="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-2 rounded-xl text-xs font-semibold text-center transition focus:outline-none"
                                >
                                  Trigger Warning SMS
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}

                    {/* 5. SETTINGS & PROFILE VIEW */}
                    {activeTab === 'settings' && (
                      <div class="space-y-4 animate-fade-in text-left">
                        
                        {/* Profile header */}
                        <div class="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-center gap-3">
                          <img
                            src={user?.avatarUrl}
                            class="w-12 h-12 rounded-full border border-neutral-200 object-cover"
                            alt="avatar"
                          />
                          <div>
                            <h4 class="font-bold text-neutral-900 text-sm">{user?.name}</h4>
                            <p class="text-xs text-neutral-500 font-mono mt-0.5">{user?.phone}</p>
                          </div>
                        </div>

                        {/* System Settings list */}
                        <div class="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-4 text-xs font-semibold">
                          <h5 class="text-[10px] font-mono text-neutral-500 uppercase tracking-wider border-b border-neutral-200 pb-2">Device Configurations</h5>
                          
                          <div class="flex justify-between items-center">
                            <span class="text-neutral-800">Biometric Payment Auth</span>
                            <button
                              id="toggle-biometrics-btn"
                              onClick={() => handleToggleSetting('biometricEnabled', !user?.biometricEnabled)}
                              class={`w-10 h-6 rounded-full relative transition duration-200 focus:outline-none ${
                                user?.biometricEnabled ? 'bg-neutral-900' : 'bg-neutral-200'
                              }`}
                            >
                              <span class={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${
                                user?.biometricEnabled ? 'right-1' : 'left-1'
                              }`}></span>
                            </button>
                          </div>

                          <div class="flex justify-between items-center">
                            <span class="text-neutral-800">Low Token Alerts (SMS)</span>
                            <button
                              id="toggle-low-token-alert-btn"
                              onClick={() => handleToggleSetting('lowTokenAlert', !user?.lowTokenAlert)}
                              class={`w-10 h-6 rounded-full relative transition duration-200 focus:outline-none ${
                                user?.lowTokenAlert ? 'bg-neutral-900' : 'bg-neutral-200'
                              }`}
                            >
                              <span class={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${
                                user?.lowTokenAlert ? 'right-1' : 'left-1'
                              }`}></span>
                            </button>
                          </div>

                          <div class="flex items-center justify-between border-t border-neutral-200 pt-3">
                            <span class="text-neutral-800">Low Alert Threshold (kWh)</span>
                            <input
                              id="threshold-input"
                              type="number"
                              value={user?.lowTokenThreshold || ''}
                              onChange={(e) => handleToggleSetting('lowTokenThreshold', Number(e.target.value))}
                              class="w-14 bg-white border border-neutral-200 rounded-lg py-1 px-2 font-mono text-center text-neutral-800 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Family Accounts Panel */}
                        <div class="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-4">
                          <div class="flex items-center justify-between border-b border-neutral-200 pb-2">
                            <h5 class="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Shared Family Accounts</h5>
                            <button
                              id="show-add-family-btn"
                              onClick={() => setShowAddFamily(!showAddFamily)}
                              class="text-[10px] font-bold text-neutral-900 hover:text-neutral-600"
                            >
                              {showAddFamily ? 'Cancel' : '+ Add'}
                            </button>
                          </div>

                          {showAddFamily ? (
                            <form onSubmit={handleAddFamilyMember} class="space-y-3 bg-white p-3 rounded-xl border border-neutral-200 animate-scale-up text-xs font-semibold">
                              <div>
                                <label class="text-[9px] text-neutral-500 block mb-1">Full Name</label>
                                <input
                                  id="family-name-input"
                                  type="text"
                                  placeholder="e.g. Faith Omondi"
                                  value={newFamilyName}
                                  onChange={(e) => setNewFamilyName(e.target.value)}
                                  class="w-full bg-white border border-neutral-200 rounded-lg p-2 focus:outline-none focus:border-neutral-900"
                                />
                              </div>
                              <div class="grid grid-cols-2 gap-2">
                                <div>
                                  <label class="text-[9px] text-neutral-500 block mb-1">Relation</label>
                                  <select
                                    id="family-relation-select"
                                    value={newFamilyRelation}
                                    onChange={(e) => setNewFamilyRelation(e.target.value)}
                                    class="w-full bg-white border border-neutral-200 rounded-lg p-2 focus:outline-none"
                                  >
                                    <option>Spouse</option>
                                    <option>Son</option>
                                    <option>Daughter</option>
                                    <option>Parent</option>
                                    <option>Tenant</option>
                                  </select>
                                </div>
                                <div>
                                  <label class="text-[9px] text-neutral-500 block mb-1">Phone</label>
                                  <input
                                    id="family-phone-input"
                                    type="text"
                                    placeholder="+254 7XX"
                                    value={newFamilyPhone}
                                    onChange={(e) => setNewFamilyPhone(e.target.value)}
                                    class="w-full bg-white border border-neutral-200 rounded-lg p-2 focus:outline-none"
                                  />
                                </div>
                              </div>
                              <button
                                id="save-family-member-btn"
                                type="submit"
                                class="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg py-2 font-bold transition text-[11px]"
                              >
                                Save Member & Share Meters
                              </button>
                            </form>
                          ) : (
                            <div class="space-y-2">
                              {familyMembers.map(member => (
                                <div key={member.id} class="bg-white border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
                                  <div class="flex items-center gap-2.5">
                                    <img src={member.avatarUrl} class="w-8 h-8 rounded-full border border-neutral-200 object-cover" alt="avatar" />
                                    <div>
                                      <p class="text-xs font-bold text-neutral-900">{member.name}</p>
                                      <span class="text-[9px] text-neutral-500">{member.relation} • Limit KES {member.spendingLimit}/mo</span>
                                    </div>
                                  </div>
                                  <button
                                    id={`remove-family-btn-${member.id}`}
                                    onClick={() => handleRemoveFamilyMember(member.id)}
                                    class="text-neutral-400 hover:text-rose-600 p-1 rounded-lg"
                                  >
                                    Revoke
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Offline USSD manual cheat sheet */}
                        <div class="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-3">
                          <h5 class="text-[10px] font-mono text-neutral-500 uppercase tracking-wider border-b border-neutral-200 pb-2">Kenya Offline USSD Resiliency Codes</h5>
                          
                          <div class="space-y-2 font-mono text-[10px]">
                            <div class="flex justify-between text-neutral-600">
                              <span>KPLC Token Check Code:</span>
                              <span class="text-neutral-900 font-bold">*977# (Call)</span>
                            </div>
                            <div class="flex justify-between text-neutral-600">
                              <span>M-Pesa Utility Paybill:</span>
                              <span class="text-neutral-900 font-bold">888 880 (KPLC)</span>
                            </div>
                            <div class="flex justify-between text-neutral-600">
                              <span>Check Token Status SMS:</span>
                              <span class="text-neutral-900">SMS Meter to 95551</span>
                            </div>
                          </div>
                        </div>

                        {/* Revoke Auth button */}
                        <button
                          id="logout-btn"
                          onClick={() => {
                            setIsAuthenticated(false);
                            setAuthStep('phone');
                            setPhoneInput('');
                            setOtpInput('');
                            addToast("Logged out successfully.", "info");
                          }}
                          class="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-2xl py-3 text-xs text-center transition focus:outline-none"
                        >
                          Logout from Device
                        </button>

                      </div>
                    )}

                  </div>

                  {/* Bottom Navigation tab bar */}
                  <div class="absolute bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-md border-t border-neutral-200 flex items-center justify-around px-2 z-40">
                    <button
                      id="tab-dashboard"
                      onClick={() => setActiveTab('dashboard')}
                      class={`flex flex-col items-center justify-center gap-1 transition ${
                        activeTab === 'dashboard' ? 'text-neutral-900 font-bold' : 'text-neutral-400 hover:text-neutral-600'
                      }`}
                    >
                      <Home class="w-5 h-5" />
                      <span class="text-[9px] font-semibold">Dashboard</span>
                    </button>

                    <button
                      id="tab-meters"
                      onClick={() => setActiveTab('meters')}
                      class={`flex flex-col items-center justify-center gap-1 transition ${
                        activeTab === 'meters' ? 'text-neutral-900 font-bold' : 'text-neutral-400 hover:text-neutral-600'
                      }`}
                    >
                      <Layers class="w-5 h-5" />
                      <span class="text-[9px] font-semibold">Meters</span>
                    </button>

                    <button
                      id="tab-history"
                      onClick={() => setActiveTab('history')}
                      class={`flex flex-col items-center justify-center gap-1 transition ${
                        activeTab === 'history' ? 'text-neutral-900 font-bold' : 'text-neutral-400 hover:text-neutral-600'
                      }`}
                    >
                      <History class="w-5 h-5" />
                      <span class="text-[9px] font-semibold">Tokens</span>
                    </button>

                    <button
                      id="tab-rental"
                      onClick={() => setActiveTab('rental')}
                      class={`flex flex-col items-center justify-center gap-1 transition ${
                        activeTab === 'rental' ? 'text-neutral-900 font-bold' : 'text-neutral-400 hover:text-neutral-600'
                      }`}
                    >
                      <Building2 class="w-5 h-5" />
                      <span class="text-[9px] font-semibold">Landlord</span>
                    </button>

                    <button
                      id="tab-settings"
                      onClick={() => setActiveTab('settings')}
                      class={`flex flex-col items-center justify-center gap-1 transition ${
                        activeTab === 'settings' ? 'text-neutral-900 font-bold' : 'text-neutral-400 hover:text-neutral-600'
                      }`}
                    >
                      <Settings class="w-5 h-5" />
                      <span class="text-[9px] font-semibold">Settings</span>
                    </button>
                  </div>
                  </div>
               )}

            </MobileSimulator>
          </div>

          {/* Right Column: Sandbox developer control panel & logs */}
          <div class="lg:col-span-7 xl:col-span-7 flex flex-col h-[840px] justify-between">
            <DarajaTerminal
              activeCheckoutRequestId={checkoutRequestId}
              activeAmount={checkoutAmount}
              activeMeter={selectedMeter}
              onCallback={handleSandboxCallback}
              logs={sandboxLogs}
              setLogs={setSandboxLogs}
            />
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* GLOBAL VIEW MODALS */}
      {/* ======================================================== */}

      {/* 1. KPLC RECEIPT DRAWER MODAL */}
      {activeReceipt && (
        <ReceiptModal
          transaction={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* 2. ADD METER DIALOG OVERLAY */}
      {showAddMeterModal && (
        <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 select-none">
          <form
            onSubmit={handleAddMeter}
            class="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-[340px] p-6 space-y-4 shadow-2xl animate-scale-up"
          >
            <div class="flex justify-between items-center pb-2 border-b border-zinc-900">
              <h3 class="font-display font-bold text-sm text-slate-200">Link KPLC Meter</h3>
              <button
                id="close-add-meter-btn"
                type="button"
                onClick={() => setShowAddMeterModal(false)}
                class="text-slate-500 hover:text-slate-200 focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div class="space-y-3.5 text-xs font-semibold text-left">
              <div>
                <label class="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">KPLC Meter Number</label>
                <input
                  id="new-meter-num-input"
                  type="text"
                  placeholder="e.g. 3712-8495-021"
                  value={newMeterNum}
                  onChange={(e) => setNewMeterNum(e.target.value)}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label class="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Meter Nickname</label>
                <input
                  id="new-meter-nickname-input"
                  type="text"
                  placeholder="e.g. Home, Shamba, Unit A2"
                  value={newMeterNickname}
                  onChange={(e) => setNewMeterNickname(e.target.value)}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label class="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Installation Address</label>
                <input
                  id="new-meter-address-input"
                  type="text"
                  placeholder="e.g. Wood Avenue, Kilimani"
                  value={newMeterAddress}
                  onChange={(e) => setNewMeterAddress(e.target.value)}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div class="flex items-center gap-2 pt-1">
                <input
                  id="new-meter-rental-toggle"
                  type="checkbox"
                  checked={newMeterIsRental}
                  onChange={(e) => setNewMeterIsRental(e.target.checked)}
                  class="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0 w-4 h-4"
                />
                <span class="text-slate-300 font-medium">Link as a Tenant-Occupied Rental</span>
              </div>

              {newMeterIsRental && (
                <div class="space-y-3 border-t border-zinc-900 pt-3 animate-scale-up">
                  <div>
                    <label class="text-[9px] text-zinc-500 block mb-1">Tenant Full Name</label>
                    <input
                      id="new-meter-tenant-name"
                      type="text"
                      placeholder="e.g. Brian Kiprop"
                      value={newMeterTenantName}
                      onChange={(e) => setNewMeterTenantName(e.target.value)}
                      class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="text-[9px] text-zinc-500 block mb-1">Tenant Phone Number</label>
                    <input
                      id="new-meter-tenant-phone"
                      type="text"
                      placeholder="e.g. +254 712 345 678"
                      value={newMeterTenantPhone}
                      onChange={(e) => setNewMeterTenantPhone(e.target.value)}
                      class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {addMeterError && <p class="text-rose-400 text-[10px] text-left font-medium">{addMeterError}</p>}

            <button
              id="save-meter-btn"
              type="submit"
              class="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 text-xs font-bold transition focus:outline-none"
            >
              Save Meter Account
            </button>
          </form>
        </div>
      )}

      {/* 3. BIOMETRIC FACEID SIMULATION OVERLAY */}
      {showBiometricOverlay && (
        <BiometricPrompt
          actionText={biometricAction === 'login' ? 'Unlocking StimaPay' : `Authorizing M-Pesa push of KES ${activeAmount}`}
          onSuccess={() => {
            setShowBiometricOverlay(false);
            if (biometricAction === 'login') {
              setIsAuthenticated(true);
              addToast("Welcome back, Jomo!", "success");
            } else if (biometricAction === 'pay') {
              executeStkPush();
            }
          }}
          onCancel={() => {
            setShowBiometricOverlay(false);
            if (biometricAction === 'login') {
              // Fallback to manual passcode / login
              setIsAuthenticated(true);
              addToast("Login successful via secondary authentication.", "info");
            } else if (biometricAction === 'pay') {
              addToast("Biometric verification cancelled.", "error");
            }
          }}
        />
      )}

    </div>
  );
}
