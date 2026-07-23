import React, { useEffect, useState } from 'react';
import { ScanFace, Check, AlertCircle } from 'lucide-react';

interface BiometricPromptProps {
  onSuccess: () => void;
  onCancel: () => void;
  actionText?: string;
}

export default function BiometricPrompt({ onSuccess, onCancel, actionText = "Confirming Identity" }: BiometricPromptProps) {
  const [scanState, setScanState] = useState<'scanning' | 'success' | 'failed'>('scanning');

  useEffect(() => {
    // Simulate a high-tech iOS scan sequence
    const scanTimer = setTimeout(() => {
      setScanState('success');
      
      // Call success callback after a short delay to display the success visual state
      const successTimer = setTimeout(() => {
        onSuccess();
      }, 1000);

      return () => clearTimeout(successTimer);
    }, 1800);

    return () => clearTimeout(scanTimer);
  }, []);

  return (
    <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-fade-in select-none">
      <div class="bg-white border border-neutral-200 rounded-3xl w-full max-w-[310px] p-6 text-center shadow-2xl flex flex-col items-center animate-scale-up">
        
        {/* iOS FaceID Container */}
        <div class="relative w-28 h-28 flex items-center justify-center mt-4">
          {scanState === 'scanning' && (
            <>
              {/* Outer scanning border */}
              <div class="absolute inset-0 border-2 border-neutral-100 rounded-2xl animate-pulse"></div>
              {/* Rotating corners */}
              <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neutral-900 rounded-tl-xl"></div>
              <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neutral-900 rounded-tr-xl"></div>
              <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neutral-900 rounded-bl-xl"></div>
              <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neutral-900 rounded-br-xl"></div>
              
              {/* Laser line effect */}
              <div class="absolute left-2 right-2 h-0.5 bg-neutral-900 animate-scan"></div>
              
              <ScanFace class="w-14 h-14 text-neutral-800" />
            </>
          )}

          {scanState === 'success' && (
            <div class="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center animate-scale">
              <Check class="w-10 h-10 text-green-600" />
            </div>
          )}
        </div>

        {/* Labels */}
        <h3 class="font-display font-bold text-neutral-900 text-lg mt-6">
          {scanState === 'scanning' ? 'Face ID' : 'Verified'}
        </h3>
        
        <p class="text-xs text-neutral-500 mt-1 max-w-[200px]">
          {scanState === 'scanning' ? actionText : 'Authorization Granted'}
        </p>

        {/* Cancel Action */}
        {scanState === 'scanning' && (
          <button
            id="cancel-biometric-btn"
            onClick={onCancel}
            class="text-xs font-semibold text-neutral-400 hover:text-neutral-600 mt-8 transition focus:outline-none"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
