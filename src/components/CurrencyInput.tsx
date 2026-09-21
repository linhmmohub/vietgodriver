import React, { useState, useEffect } from 'react';
import { formatNumberWithDots, parseNumberFromDots } from '../utils/formatters';

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  presets?: number[];
  quickButtons?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
  presets,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => formatNumberWithDots(value));

  useEffect(() => {
    setDisplayValue(formatNumberWithDots(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawText = e.target.value;
    const numericValue = parseNumberFromDots(rawText);
    setDisplayValue(formatNumberWithDots(rawText));
    onChange(numericValue);
  };

  return (
    <div className="space-y-1.5">
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pr-8 pl-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-50 tracking-wide font-mono ${className}`}
        />
        <span className="absolute right-2.5 text-xs text-slate-400 font-medium pointer-events-none select-none">
          đ
        </span>
      </div>

      {presets && presets.length > 0 && !disabled && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setDisplayValue(formatNumberWithDots(preset));
                onChange(preset);
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition ${
                value === preset
                  ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {formatNumberWithDots(preset)} đ
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
