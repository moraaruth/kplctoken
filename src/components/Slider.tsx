import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';

interface SliderProps {
  onConfirm: () => void;
  label?: string;
  disabled?: boolean;
}

export default function Slider({ onConfirm, label = "Slide to pay via M-Pesa", disabled = false }: SliderProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [maxDrag, setMaxDrag] = useState(150);

  useEffect(() => {
    if (containerRef.current && handleRef.current) {
      const cWidth = containerRef.current.clientWidth;
      const hWidth = handleRef.current.clientWidth;
      setMaxDrag(cWidth - hWidth - 8); // 4px padding on each side
    }
  }, [containerRef.current, handleRef.current]);

  const handleStart = () => {
    if (disabled || isSuccess) return;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || isSuccess) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left - 24; // offset from center of handle
      const clampedX = Math.max(0, Math.min(relativeX, maxDrag));
      setDragX(clampedX);

      // If dragging has crossed 90% of max width, trigger confirmation
      if (clampedX >= maxDrag * 0.95) {
        setIsSuccess(true);
        setIsDragging(false);
        setDragX(maxDrag);
        onConfirm();
      }
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!isSuccess) {
      // Bounce back
      setDragX(0);
    }
  };

  // Add event listeners for global mouse move & mouse up to ensure dragging feels sticky & robust
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };
    const onMouseUp = () => handleEnd();
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, maxDrag]);

  return (
    <div
      ref={containerRef}
      class={`h-14 rounded-2xl relative flex items-center p-1 select-none overflow-hidden transition-all duration-300 ${
        isSuccess
          ? 'bg-green-50 border border-green-200 text-green-700'
          : disabled
          ? 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed'
          : 'bg-neutral-100 border border-neutral-200 text-neutral-600'
      }`}
    >
      {/* Background text sliding indicator */}
      <div
        class="absolute inset-0 flex items-center justify-center text-[13px] font-semibold pointer-events-none transition-opacity duration-200"
        style={{ opacity: Math.max(0.1, 1 - (dragX / maxDrag) * 1.5) }}
      >
        {isSuccess ? "Requesting M-Pesa STK..." : label}
      </div>

      {/* Dynamic slider color overlay */}
      <div
        class="absolute left-1 top-1 bottom-1 bg-neutral-900/10 rounded-xl pointer-events-none transition-all duration-100"
        style={{ width: `${dragX + 24}px`, opacity: dragX > 5 ? 1 : 0 }}
      ></div>

      {/* Sliding handle */}
      <div
        ref={handleRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{ transform: `translateX(${dragX}px)` }}
        class={`w-12 h-12 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow duration-150 ${
          isSuccess
            ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
            : disabled
            ? 'bg-neutral-300 text-neutral-500'
            : isDragging
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10'
            : 'bg-neutral-900 text-white'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 class="w-5 h-5 animate-scale" />
        ) : (
          <ArrowRight class="w-5 h-5" />
        )}
      </div>
    </div>
  );
}
