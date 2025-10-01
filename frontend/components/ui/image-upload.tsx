'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string; // Current base64 or URL
  onChange: (base64: string | null) => void;
  maxSize?: number; // Max file size in MB
  cropSize?: number; // Square crop size (default: 200)
  noCrop?: boolean; // If true, resize maintaining aspect ratio instead of cropping
  maxWidth?: number; // Max width when noCrop is true (default: 800)
  maxHeight?: number; // Max height when noCrop is true (default: 600)
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  maxSize = 5,
  cropSize = 200,
  noCrop = false,
  maxWidth = 800,
  maxHeight = 600,
  className,
  disabled = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value prop changes
  React.useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsProcessing(true);

    try {
      // Create image element
      const img = new Image();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load image
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      if (noCrop) {
        // Resize maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        // Calculate scale to fit within maxWidth and maxHeight
        const scaleX = maxWidth / width;
        const scaleY = maxHeight / height;
        const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
        
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        
        // Set canvas size to actual image size
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
      } else {
        // Original crop behavior
        // Set canvas size
        canvas.width = cropSize;
        canvas.height = cropSize;

        // Calculate crop dimensions (center crop to square)
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        // Draw cropped and resized image
        ctx.drawImage(
          img,
          startX, startY, size, size, // Source rectangle (square crop)
          0, 0, cropSize, cropSize     // Destination rectangle
        );
      }

      // Convert to base64
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      
      setPreviewUrl(base64);
      onChange(base64);

      // Cleanup
      URL.revokeObjectURL(img.src);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [cropSize, maxSize, onChange, noCrop, maxWidth, maxHeight]);

  const handleFileSelect = useCallback((file: File) => {
    processImage(file);
  }, [processImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {previewUrl ? (
        /* Preview with remove option */
        <Card>
          <CardContent className="p-4">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Crop className="h-3 w-3" />
                {cropSize}×{cropSize}px
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Upload area */
        <Card
          className={cn(
            'border-2 border-dashed transition-colors cursor-pointer',
            isDragging && 'border-primary bg-primary/5',
            disabled && 'cursor-not-allowed opacity-50',
            !disabled && 'hover:border-primary/50'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Upload className={cn(
              'h-10 w-10 text-muted-foreground mb-4',
              isProcessing && 'animate-pulse'
            )} />
            
            {isProcessing ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Processing image...</p>
                <p className="text-xs text-muted-foreground">
                  Cropping to {cropSize}×{cropSize}px
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drop an image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Will be cropped to {cropSize}×{cropSize}px • Max {maxSize}MB
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: JPG, PNG, WebP
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ImageUpload; 