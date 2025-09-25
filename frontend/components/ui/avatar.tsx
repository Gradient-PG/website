'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  base64?: string; // Base64 image takes priority over src
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm', 
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-xl',
};

export function Avatar({ src, base64, name, size = 'md', className, alt }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get initials from name (first letter of first two words)
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Generate a background color based on the name
  const getBackgroundColor = (name: string): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Use base64 if available, otherwise use src
  const imageSource = base64 || src;
  const shouldShowPlaceholder = !imageSource || imageError;

  return (
    <div className={cn(
      'relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0',
      sizeClasses[size],
      shouldShowPlaceholder && getBackgroundColor(name),
      className
    )}>
      {!shouldShowPlaceholder && (
        <img
          src={imageSource}
          alt={alt || `${name} avatar`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageError ? 'none' : 'block' }}
        />
      )}
      
      {shouldShowPlaceholder && (
        <span className="text-white font-semibold select-none">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

export default Avatar; 