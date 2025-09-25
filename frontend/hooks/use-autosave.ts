'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useToast } from './use-toast';
import { createAutoSave, getAutoSavedData, clearAutoSavedData, type AutoSaveOptions } from '@/lib/validation';

interface UseAutoSaveOptions {
  key: string;
  data: any;
  delay?: number;
  enabled?: boolean;
  onSave?: (data: any) => void;
  onRestore?: (data: any) => void;
  showToasts?: boolean;
}

export const useAutoSave = (options: UseAutoSaveOptions) => {
  const { toast } = useToast();
  const {
    key,
    data,
    delay = 5000, // 5 seconds
    enabled = true,
    onSave,
    onRestore,
    showToasts = true,
  } = options;

  const autoSaveRef = useRef<((data: any) => void) | null>(null);
  const lastSaveRef = useRef<string>('');

  // Initialize auto-save function
  useEffect(() => {
    if (!enabled) return;

    autoSaveRef.current = createAutoSave({
      key,
      delay,
      onSave: (savedData) => {
        if (showToasts) {
          toast({
            title: 'Draft saved',
            description: 'Your changes have been saved automatically.',
            duration: 2000,
          });
        }
        onSave?.(savedData);
      },
      onError: (error) => {
        console.error('Auto-save failed:', error);
        if (showToasts) {
          toast({
            title: 'Auto-save failed',
            description: 'Could not save your draft. Please save manually.',
            variant: 'destructive',
            duration: 4000,
          });
        }
      },
    });
  }, [key, delay, enabled, showToasts, onSave, toast]);

  // Auto-save when data changes
  useEffect(() => {
    if (!enabled || !autoSaveRef.current) return;

    const currentDataString = JSON.stringify(data);
    
    // Only save if data has actually changed
    if (currentDataString !== lastSaveRef.current && Object.keys(data).length > 0) {
      // Check if the data has meaningful content (not just empty strings)
      const hasContent = Object.values(data).some(value => 
        value !== null && value !== undefined && String(value).trim() !== ''
      );
      
      if (hasContent) {
        autoSaveRef.current(data);
        lastSaveRef.current = currentDataString;
      }
    }
  }, [data, enabled]);

  // Restore saved data
  const restoreSavedData = useCallback((maxAge?: number): any | null => {
    try {
      const savedData = getAutoSavedData(key, maxAge);
      if (savedData) {
        onRestore?.(savedData);
        if (showToasts) {
          toast({
            title: 'Draft restored',
            description: 'Your previous draft has been restored.',
            duration: 3000,
          });
        }
      }
      return savedData;
    } catch (error) {
      console.error('Failed to restore auto-saved data:', error);
      if (showToasts) {
        toast({
          title: 'Restore failed',
          description: 'Could not restore your previous draft.',
          variant: 'destructive',
          duration: 4000,
        });
      }
      return null;
    }
  }, [key, onRestore, showToasts, toast]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      clearAutoSavedData(key);
      lastSaveRef.current = '';
      if (showToasts) {
        toast({
          title: 'Draft cleared',
          description: 'Auto-saved draft has been cleared.',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Failed to clear auto-saved data:', error);
    }
  }, [key, showToasts, toast]);

  // Check if there is saved data
  const hasSavedData = useCallback((maxAge?: number): boolean => {
    try {
      const savedData = getAutoSavedData(key, maxAge);
      return savedData !== null;
    } catch {
      return false;
    }
  }, [key]);

  return {
    restoreSavedData,
    clearSavedData,
    hasSavedData,
  };
}; 