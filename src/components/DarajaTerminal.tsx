import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldAlert, Cpu, Terminal as TermIcon, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Meter } from '../types';

interface DarajaTerminalProps {
  activeCheckoutRequestId: string | null;
  activeAmount: number | null;
  activeMeter: Meter | null;
  onCallback: (checkoutRequestId: string, resultCode: number, receiptNumber?: string) => void;
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function DarajaTerminal({
  activeCheckoutRequestId,
  activeAmount,
  activeMeter,
  onCallback,
  logs,
  setLogs
}: DarajaTerminalProps) {
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Add system logs when state shifts
  useEffect(() => {
    if (activeCheckoutRequestId && activeAmount && activeMeter) {
      appendLog(`[DARAJA-API] Received STK Push trigger request`, 'system');
      appendLog(`[DARAJA-API] Outbound request status: 200 OK`, 'success');
      appendLog(`[DARAJA-API] Created CheckoutRequestID: ${activeCheckoutRequestId}`, 'success');
      appendLog(`[SIMULATOR] Incoming M-Pesa push detected on phone +254 7XX XXX XXX`, 'warning');
    }
  }, [activeCheckoutRequestId]);

  const appendLog = (message: string, type: 'system' | 'success' | 'error' | 'warning' = 'system') => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${message}`;
    setLogs(prev => [formatted, ...prev]);
  };

  const handleApprove = async () => {
    if (!pin || pin.length < 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    setSubmitting(true);
    setError('');
    appendLog(`[M-PESA] Authorizing payment of KES ${activeAmount} using PIN ****`, 'warning');

    setTimeout(async () => {
      const receipt = 'MP' + Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8) + 'KE';
      appendLog(`[M-PESA] Auth Success. Receipt: ${receipt}`, 'success');
      appendLog(`[DARAJA-API] Initiating HTTP POST Webhook callback to UmemePay Backend...`, 'system');
      
      try {
        const response = await fetch('/api/purchase/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutRequestId: activeCheckoutRequestId,
            resultCode: 0,
            mpesaReceiptNumber: receipt
          })
        });
        
        if (response.ok) {
          appendLog(`[DARAJA-API] Callback received successfully (Status: 200 OK)`, 'success');
          appendLog(`[KPLC-API] Token successfully generated & delivered to customer`, 'success');
          onCallback(activeCheckoutRequestId!, 0, receipt);
        } else {
          appendLog(`[DARAJA-API] Webhook delivery failed! Code: ${response.status}`, 'error');
        }
      } catch (err) {
        appendLog(`[DARAJA-API] Webhook error: ${err}`, 'error');
      } finally {
        setSubmitting(false);
        setPin('');
      }
    }, 1500);
  };

  const handleDecline = async () => {
    setSubmitting(true);
    setError('');
    appendLog(`[M-PESA] STK Push cancelled by user`, 'error');
    appendLog(`[DARAJA-API] Initiating HTTP POST Webhook callback (ResultCode: 1032)`, 'system');

    setTimeout(async () => {
      try {
        const response = await fetch('/api/purchase/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutRequestId: activeCheckoutRequestId,
            resultCode: 1032
          })
        });

        if (response.ok) {
          appendLog(`[DARAJA-API] Callback received successfully (Status: 200 OK)`, 'warning');
          onCallback(activeCheckoutRequestId!, 1032);
        }
      } catch (err) {
        appendLog(`[DARAJA-API] Callback error: ${err}`, 'error');
      } finally {
        setSubmitting(false);
        setPin('');
      }
    }, 1000);
  };

  return (
    <div id="daraja-terminal" class="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-full shadow-2xl overflow-hidden min-h-[500px]">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Cpu class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-display font-bold text-lg text-slate-100">Daraja Integration Sandbox</h2>
            <p class="text-xs text-slate-400">Safaricom & KPLC Developer Console</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-xs font-mono font-medium text-slate-400">DARAJA_v2_ONLINE</span>
        </div>
      </div>

      {/* Grid containing M-Pesa Simulator Screen and Live Terminal logs */}
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 overflow-hidden min-h-[350px]">
        
        {/* Virtual phone representing client M-Pesa prompt */}
        <div class="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden h-full min-h-[300px]">
          <div class="absolute inset-0 bg-radial from-emerald-950/20 to-transparent pointer-events-none"></div>
          
          <div class="flex items-center gap-2 mb-4 text-slate-400 font-mono text-[10px] uppercase tracking-wider pb-2 border-b border-slate-800/60">
            <Smartphone class="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulated +254 722 *** 111</span>
          </div>

          <div class="flex-1 flex flex-col justify-between relative z-10">
            {!activeCheckoutRequestId ? (
              <div class="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div class="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 mb-3 animate-pulse">
                  <Smartphone class="w-6 h-6 text-slate-500" />
                </div>
                <h4 class="font-bold text-slate-200 text-sm">Waiting for STK Push Trigger</h4>
                <p class="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Initiate a payment inside the mobile app simulator to trigger an instant M-Pesa Daraja prompt here.
                </p>
              </div>
            ) : (
              <div class="flex flex-col h-full justify-between">
                {/* Simulated STK Dialog */}
                <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xl mt-2 animate-bounce">
                  <div class="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs">
                    <img src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=100" class="w-5 h-5 rounded object-cover hidden" alt="M-Pesa" />
                    <span class="bg-emerald-500 text-white font-sans text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">M-PESA</span>
                    <span class="text-[11px] font-medium text-slate-300">SIM TOOLKIT</span>
                  </div>
                  
                  <div class="text-slate-200 text-xs space-y-2 mt-2 font-sans font-normal leading-relaxed">
                    <p>Do you want to pay <span class="font-bold text-emerald-400">KES {activeAmount?.toLocaleString()}</span> to <span class="font-bold">KPLC PREPAID</span> for meter <span class="font-mono text-white">{activeMeter?.meterNumber}</span>?</p>
                    <p class="text-[10px] text-zinc-400">Enter your 4-digit M-PESA PIN to authorize transaction:</p>
                    
                    <div class="relative mt-3">
                      <input
                        id="mpesa-pin-input"
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        disabled={submitting}
                        class="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-center text-xl tracking-widest text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    {error && <p class="text-rose-400 text-[10px] font-medium">{error}</p>}
                    <p class="text-[10px] text-slate-500 italic mt-1">Hint: Type <span class="font-bold font-mono">1234</span> to simulate successful authorization.</p>
                  </div>
                </div>

                {/* Actions */}
                <div class="grid grid-cols-2 gap-3 mt-4">
                  <button
                    id="mpesa-cancel-btn"
                    onClick={handleDecline}
                    disabled={submitting}
                    class="bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/20 text-rose-300 rounded-xl py-2.5 text-xs font-semibold transition focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    id="mpesa-approve-btn"
                    onClick={handleApprove}
                    disabled={submitting}
                    class="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 text-xs font-semibold transition shadow-md shadow-emerald-900/10 flex items-center justify-center gap-1.5 focus:outline-none"
                  >
                    {submitting ? (
                      <span class="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>Pay Kes {activeAmount}</span>
                        <ArrowRight class="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Logs Console */}
        <div class="flex flex-col bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden h-full min-h-[300px]">
          <div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/60">
            <div class="flex items-center gap-2 text-slate-300 font-mono text-xs">
              <TermIcon class="w-4 h-4 text-emerald-400" />
              <span>Real-time webhook logger</span>
            </div>
            <button
              id="clear-logs-btn"
              onClick={() => setLogs([])}
              class="text-[10px] text-slate-500 hover:text-slate-300 font-mono uppercase tracking-wider"
            >
              Clear
            </button>
          </div>

          {/* Log Stream container */}
          <div class="flex-1 overflow-y-auto no-scrollbar font-mono text-[10px] space-y-2 pr-1 select-text">
            {logs.length === 0 ? (
              <div class="text-slate-600 italic">No logs yet. Transactions will generate real-time events.</div>
            ) : (
              logs.map((log, i) => {
                let colorClass = 'text-slate-400';
                if (log.includes('Success') || log.includes('success') || log.includes('200 OK')) {
                  colorClass = 'text-emerald-400';
                } else if (log.includes('failed') || log.includes('error') || log.includes('Cancel') || log.includes('ResultCode: 1032')) {
                  colorClass = 'text-rose-400';
                } else if (log.includes('pending') || log.includes('warning') || log.includes('PIN')) {
                  colorClass = 'text-amber-400';
                } else if (log.includes('[DARAJA-API]') || log.includes('[KPLC-API]')) {
                  colorClass = 'text-sky-400';
                }

                return (
                  <div key={i} class={`leading-relaxed border-b border-slate-900/40 pb-1 ${colorClass}`}>
                    {log}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
