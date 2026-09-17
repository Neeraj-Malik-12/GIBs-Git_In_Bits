import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export interface TimeframeOption {
  value: string;
  label: string;
  shortLabel?: string;
}

export const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { value: '1_day', label: 'Yesterday', shortLabel: '1D' },
  { value: '3_days', label: 'Last 3 Days', shortLabel: '3D' },
  { value: '7_days', label: 'Last 7 Days', shortLabel: '7D' },
  { value: '10_days', label: 'Last 10 Days', shortLabel: '10D' },
  { value: '30_days', label: 'Last 30 Days', shortLabel: '30D' },
  { value: 'lifetime', label: 'Lifetime', shortLabel: 'ALL' },
];

interface TimeframeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimeframeDropdown({ value, onChange, className = '' }: TimeframeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = TIMEFRAME_OPTIONS.find((opt) => opt.value === value) || TIMEFRAME_OPTIONS[4];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none
          ${
            isOpen
              ? 'bg-slate-800 text-white border-blue-500/50 ring-2 ring-blue-500/20'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-white/10 hover:border-white/20'
          }
          border shadow-sm backdrop-blur-md`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1.5 w-44 sm:w-48 z-50 rounded-xl p-1 backdrop-blur-xl border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.65)] bg-slate-900/95 animate-in fade-in zoom-in-95 duration-150 origin-top-right focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5 mb-1">
            Select Timeframe
          </div>
          <div className="space-y-0.5">
            {TIMEFRAME_OPTIONS.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors duration-150 cursor-pointer text-left
                    ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-400 font-medium border border-blue-500/20'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  role="menuitem"
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
