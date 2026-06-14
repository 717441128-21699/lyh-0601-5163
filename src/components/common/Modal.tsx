import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface ModalProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  confirmVariant?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary';
  children: React.ReactNode;
  className?: string;
  width?: string | number;
  showFooter?: boolean;
  maskClosable?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  title,
  onClose,
  onConfirm,
  confirmText = '确认',
  cancelText = '取消',
  confirmLoading = false,
  confirmVariant = 'primary',
  children,
  className,
  width = 520,
  showFooter = true,
  maskClosable = true,
}) => {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  const handleMaskClick = () => {
    if (maskClosable) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm animate-fadeIn"
        onClick={handleMaskClick}
      />
      <div
        className={cn(
          'relative bg-dark-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-slideUp max-h-[90vh] flex flex-col',
          className
        )}
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {showFooter && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
            <Button variant="ghost" onClick={onClose}>
              {cancelText}
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm} loading={confirmLoading}>
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface DrawerProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  width?: string | number;
  height?: string | number;
  className?: string;
  maskClosable?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  visible,
  title,
  onClose,
  children,
  placement = 'right',
  width = 400,
  height = '100%',
  className,
  maskClosable = true,
}) => {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  const handleMaskClick = () => {
    if (maskClosable) {
      onClose();
    }
  };

  const placementStyles = {
    right: {
      top: 0,
      right: 0,
      height,
      width: typeof width === 'number' ? `${width}px` : width,
      animation: 'slideInRight',
    },
    left: {
      top: 0,
      left: 0,
      height,
      width: typeof width === 'number' ? `${width}px` : width,
      animation: 'slideInLeft',
    },
    top: {
      top: 0,
      left: 0,
      width: '100%',
      height: typeof height === 'number' ? `${height}px` : height,
      animation: 'slideInDown',
    },
    bottom: {
      bottom: 0,
      left: 0,
      width: '100%',
      height: typeof height === 'number' ? `${height}px` : height,
      animation: 'slideInUp',
    },
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm animate-fadeIn"
        onClick={handleMaskClick}
      />
      <div
        className={cn(
          'absolute bg-dark-800/95 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col',
          placement === 'left' || placement === 'right' ? 'border-l-0' : 'border-t-0',
          className
        )}
        style={placementStyles[placement]}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
