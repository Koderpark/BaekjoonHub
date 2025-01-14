import React from 'react';
import { cn } from '@/utils/cn';

interface ProgressIndicatorProps {
  status: 'uploading' | 'success' | 'error';
  url?: string;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ status, url, className }) => {
  const renderIndicator = () => {
    switch (status) {
      case 'uploading':
        return (
          <div
            className="inline-block w-6 h-6 border-2 border-current border-r-transparent rounded-full animate-spin"
            role="status"
            aria-label="Uploading"
          />
        );

      case 'success':
        return (
          <div
            className={cn(
              'inline-block transform rotate-45 cursor-pointer',
              'w-3 h-6 border-r-2 border-b-2 border-success',
              url && 'hover:border-success/80'
            )}
            role="status"
            aria-label="Upload successful"
            onClick={() => url && window.open(url, '_blank')}
          />
        );

      case 'error':
        return (
          <div
            className="inline-block transform rotate-45 w-3 h-6 border-r-2 border-b-2 border-destructive"
            role="status"
            aria-label="Upload failed"
          />
        );
    }
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>{renderIndicator()}</div>
  );
};
