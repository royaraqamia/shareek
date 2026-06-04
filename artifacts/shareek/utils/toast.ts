import { toast as sonnerToast, ExternalToast } from 'sonner';
import { triggerHaptic } from './haptics';

export const toast = Object.assign(sonnerToast, {
  success: (message: string | React.ReactNode, data?: ExternalToast) => {
    triggerHaptic('success');
    return sonnerToast.success(message, data);
  },
  error: (message: string | React.ReactNode, data?: ExternalToast) => {
    triggerHaptic('error');
    return sonnerToast.error(message, data);
  },
  warning: (message: string | React.ReactNode, data?: ExternalToast) => {
    triggerHaptic('warning');
    return sonnerToast.warning(message, data);
  },
  info: (message: string | React.ReactNode, data?: ExternalToast) => {
    triggerHaptic('light');
    return sonnerToast.info(message, data);
  }
});
