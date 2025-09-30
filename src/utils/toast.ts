import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message, {
    style: {
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      color: '#166534',
    },
    className: 'success-toast',
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    style: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
    },
    className: 'error-toast',
  });
};

export const showWarning = (message: string) => {
  toast.warning(message, {
    style: {
      background: '#fffbeb',
      border: '1px solid #fed7aa',
      color: '#d97706',
    },
    className: 'warning-toast',
  });
};

export const showInfo = (message: string) => {
  toast.info(message, {
    style: {
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      color: '#2563eb',
    },
    className: 'info-toast',
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message, {
    style: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      color: '#475569',
    },
    className: 'loading-toast',
  });
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// Enhanced toast with custom styling
export const showCustomToast = (
  message: string, 
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
  options?: {
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }
) => {
  const styles = {
    success: {
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      color: '#166534',
    },
    error: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
    },
    warning: {
      background: '#fffbeb',
      border: '1px solid #fed7aa',
      color: '#d97706',
    },
    info: {
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      color: '#2563eb',
    },
  };

  return toast[type](message, {
    style: styles[type],
    duration: options?.duration || 4000,
    action: options?.action,
    className: `${type}-toast`,
  });
};