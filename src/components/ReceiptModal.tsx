import React, { useState } from 'react';
import { X, Copy, Share2, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function ReceiptModal({ transaction, onClose }: ReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const { id, amount, kwh, tokenCode, timestamp, meterNumber, meterNickname, status, breakdown, receiptNumber } = transaction;

  const handleCopy = () => {
    if (tokenCode) {
      navigator.clipboard.writeText(tokenCode.replace(/-/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date(timestamp).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-end justify-center z-50 p-4 animate-fade-in select-none">
      <div class="bg-white border border-neutral-200 rounded-t-[32px] w-full max-w-[390px] max-h-[90%] overflow-y-auto no-scrollbar shadow-2xl relative flex flex-col p-6 animate-slide-up">
        
        {/* Header */}
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div class="flex items-center gap-1">
            <Sparkles class="w-4 h-4 text-neutral-950" />
            <h3 class="font-display font-bold text-sm text-neutral-800">Official KPLC Token Receipt</h3>
          </div>
          <button
            id="close-receipt-btn"
            onClick={onClose}
            class="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 p-1.5 rounded-full border border-neutral-200 transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        {/* Hero badge */}
        <div class="text-center py-6 flex flex-col items-center">
          <div class={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
            status === 'completed' 
              ? 'bg-green-50 border border-green-200 text-green-600' 
              : 'bg-rose-50 border border-rose-200 text-rose-600'
          }`}>
            {status === 'completed' ? <CheckCircle class="w-6 h-6" /> : <AlertCircle class="w-6 h-6" />}
          </div>
          <span class="text-xs font-mono text-neutral-400 tracking-wider">PREPAID REVENUE TOKEN</span>
          <h2 class="text-3xl font-display font-extrabold text-neutral-900 mt-1">KES {amount.toLocaleString()}</h2>
          <span class="bg-green-50 border border-green-200 text-green-700 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold mt-2 tracking-wider">
            {status === 'completed' ? 'DELIVERED OVER SMS' : 'PAYMENT FAILED'}
          </span>
        </div>

        {/* Token code display */}
        {status === 'completed' && tokenCode && (
          <div class="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-center mb-5 relative overflow-hidden group">
            <div class="absolute inset-0 bg-linear-to-r from-neutral-900/5 to-transparent pointer-events-none"></div>
            <p class="text-[10px] font-mono text-neutral-400 tracking-wider">YOUR 20-DIGIT REVENUE CODE</p>
            
            <div class="text-xl font-mono font-bold tracking-widest text-neutral-900 my-2 select-all select-text">
              {tokenCode}
            </div>

            <div class="flex items-center justify-center gap-3 mt-3 border-t border-neutral-200 pt-3">
              <button
                id="copy-token-btn"
                onClick={handleCopy}
                class="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition focus:outline-none"
              >
                <Copy class="w-3.5 h-3.5" />
                <span>{copied ? 'Copied Token!' : 'Copy Code'}</span>
              </button>
              <span class="text-neutral-200">|</span>
              <button
                id="share-token-btn"
                onClick={() => alert(`Sharing Token: ${tokenCode} for Meter ${meterNumber}`)}
                class="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition focus:outline-none"
              >
                <Share2 class="w-3.5 h-3.5" />
                <span>Share Token</span>
              </button>
            </div>
          </div>
        )}

        {/* Transaction details & Tax invoice table */}
        <div class="space-y-4 mb-4 select-text">
          <div class="flex justify-between items-center text-xs">
            <span class="text-neutral-400">M-Pesa Receipt No</span>
            <span class="font-mono text-neutral-800 uppercase">{receiptNumber}</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-neutral-400">KPLC Meter Number</span>
            <span class="font-mono text-neutral-800">{meterNumber}</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-neutral-400">Meter Account</span>
            <span class="text-neutral-800 font-medium">{meterNickname}</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-neutral-400">Timestamp</span>
            <span class="text-neutral-800">{formattedDate}</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-neutral-400 font-semibold">Total Energy Units</span>
            <span class="font-mono text-neutral-900 font-bold text-sm">{kwh} kWh</span>
          </div>
        </div>

        {/* Itemized Regulatory Tariffs Breakdown (KPLC Cost Breakdown) */}
        <div class="border-t border-neutral-100 pt-4 mb-6">
          <h4 class="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-3">Itemized Tariff Breakdown</h4>
          <div class="space-y-2.5 text-[11px] font-mono select-text">
            
            <div class="flex justify-between text-neutral-500">
              <span>EPRA Fixed Energy Charge:</span>
              <span class="text-neutral-800">KES {breakdown.tokenValue.toFixed(2)}</span>
            </div>
            
            <div class="flex justify-between text-neutral-500">
              <span>Fuel Energy Charge (FCC):</span>
              <span class="text-neutral-800">KES {breakdown.fuelCost.toFixed(2)}</span>
            </div>

            <div class="flex justify-between text-neutral-500">
              <span>Forex Adjustment Levy:</span>
              <span class="text-neutral-800">KES {breakdown.forex.toFixed(2)}</span>
            </div>

            <div class="flex justify-between text-neutral-500">
              <span>Inflation Adjustment:</span>
              <span class="text-neutral-800">KES {breakdown.inflation.toFixed(2)}</span>
            </div>

            <div class="flex justify-between text-neutral-500">
              <span>EPRA Levy Charge:</span>
              <span class="text-neutral-800">KES {breakdown.epra.toFixed(2)}</span>
            </div>

            <div class="flex justify-between text-neutral-500">
              <span>Rural Electrification Levy (RERA):</span>
              <span class="text-neutral-800">KES {breakdown.rera.toFixed(2)}</span>
            </div>

            <div class="flex justify-between text-neutral-500">
              <span>REP Levy:</span>
              <span class="text-neutral-800">KES {breakdown.rep.toFixed(2)}</span>
            </div>

            <div class="flex justify-between text-neutral-500 border-b border-neutral-100 pb-2 mb-2">
              <span>Value Added Tax (VAT 16%):</span>
              <span class="text-neutral-800">KES {breakdown.vat.toFixed(2)}</span>
            </div>

            <div class="flex justify-between text-xs font-bold text-neutral-900">
              <span class="font-sans">Total Paid (Gross):</span>
              <span>KES {amount.toLocaleString()}.00</span>
            </div>

          </div>
        </div>

        {/* Footer info statement */}
        <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-[10px] text-neutral-500 leading-relaxed text-center font-sans">
          Your token has been transmitted to KPLC prepaid databases. If your meter does not update automatically via powerline, manually type the 20-digit code into your CIU keyboard. For utility support, dial *977# or contact KPLC at 97771.
        </div>

      </div>
    </div>
  );
}
