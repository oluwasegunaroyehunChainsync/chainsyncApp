import React from 'react';
import { cn } from '@/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  icon,
  suffix,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          className={cn(
            'w-full px-4 py-2 border rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            icon ? 'pl-10' : '',
            suffix ? 'pr-10' : '',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-transparent'
              : 'border-gray-300 focus:ring-blue-500 focus:border-transparent hover:border-gray-400',
            className
          )}
          {...props}
        />
        {suffix && <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">{suffix}</div>}
      </div>
      {error && <p className="text-red-500 text-sm mt-1 font-medium">{error}</p>}
      {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
    </div>
  );
}
