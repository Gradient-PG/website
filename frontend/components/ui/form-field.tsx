'use client';

import { useState, useEffect, forwardRef } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';

export interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'url' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  success?: string;
  hint?: string;
  loading?: boolean;
  debounceMs?: number;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  validator?: (value: string) => Promise<string | null> | string | null;
  className?: string;
}

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  ({
    label,
    name,
    value,
    onChange,
    onBlur,
    type = 'text',
    placeholder,
    required = false,
    disabled = false,
    error,
    success,
    hint,
    loading = false,
    debounceMs = 300,
    minLength,
    maxLength,
    rows = 3,
    validator,
    className,
    ...props
  }, ref) => {
    const [internalError, setInternalError] = useState<string | null>(null);
    const [internalSuccess, setInternalSuccess] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [touched, setTouched] = useState(false);

    const displayError = error || internalError;
    const displaySuccess = success || internalSuccess;
    const showValidation = (touched || error) && !loading && !isValidating;

    useEffect(() => {
      if (!validator || !touched) return;

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(async () => {
        if (String(value).trim() === '' && !required) {
          setInternalError(null);
          setInternalSuccess(null);
          return;
        }

        setIsValidating(true);
        setInternalError(null);
        setInternalSuccess(null);

        try {
          const result = await validator(String(value));
          if (result) {
            setInternalError(result);
            setInternalSuccess(null);
          } else {
            setInternalError(null);
            setInternalSuccess('Valid');
          }
        } catch (err) {
          setInternalError('Validation failed');
          setInternalSuccess(null);
        } finally {
          setIsValidating(false);
        }
      }, debounceMs);

      setDebounceTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [value, validator, debounceMs, required, touched]);

    const handleChange = (newValue: string) => {
      onChange(newValue);
      if (!touched) setTouched(true);
    };

    const handleBlur = () => {
      setTouched(true);
      onBlur?.();
    };

    const getFieldStatus = () => {
      if (loading || isValidating) return 'loading';
      if (showValidation && displayError) return 'error';
      if (showValidation && displaySuccess) return 'success';
      return 'default';
    };

    const status = getFieldStatus();

    const fieldClassName = cn(
      'transition-all duration-200',
      {
        'border-red-500 focus:border-red-500 focus:ring-red-500/20': status === 'error',
        'border-green-500 focus:border-green-500 focus:ring-green-500/20': status === 'success',
        'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20': status === 'default',
      },
      className
    );

    const StatusIcon = () => {
      if (status === 'loading') {
        return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
      }
      if (status === 'error') {
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      }
      if (status === 'success') {
        return <Check className="h-4 w-4 text-green-500" />;
      }
      return null;
    };

    const characterCount = String(value).length;
    const showCharacterCount = maxLength && (characterCount > maxLength * 0.8 || characterCount > maxLength);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={name} className={cn('text-sm font-medium', {
            'text-red-700': status === 'error',
            'text-green-700': status === 'success',
          })}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {showCharacterCount && (
            <span className={cn('text-xs', {
              'text-red-600': characterCount > maxLength!,
              'text-amber-600': characterCount > maxLength! * 0.9,
              'text-gray-500': characterCount <= maxLength! * 0.9,
            })}>
              {characterCount}/{maxLength}
            </span>
          )}
        </div>

        <div className="relative">
          {type === 'textarea' ? (
            <Textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={name}
              name={name}
              value={String(value)}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled || loading}
              rows={rows}
              minLength={minLength}
              maxLength={maxLength}
              className={cn(fieldClassName, 'pr-10')}
              {...props}
            />
          ) : (
            <Input
              ref={ref as React.Ref<HTMLInputElement>}
              id={name}
              name={name}
              type={type}
              value={String(value)}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled || loading}
              min={type === 'number' ? 0 : undefined}
              minLength={minLength}
              maxLength={maxLength}
              className={cn(fieldClassName, 'pr-10')}
              {...props}
            />
          )}

          {/* Status Icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <StatusIcon />
          </div>
        </div>

        {/* Messages */}
        <div className="min-h-[1.25rem]">
          {showValidation && displayError && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {displayError}
            </p>
          )}
          {showValidation && displaySuccess && !displayError && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              {displaySuccess}
            </p>
          )}
          {hint && !showValidation && (
            <p className="text-sm text-gray-600">{hint}</p>
          )}
        </div>
      </div>
    );
  }
);

FormField.displayName = 'FormField'; 