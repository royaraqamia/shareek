export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

export const triggerHaptic = (type: HapticType = 'light') => {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(30);
        break;
      case 'success':
        navigator.vibrate([10, 50, 20]);
        break;
      case 'error':
        navigator.vibrate([20, 50, 20, 50, 20]);
        break;
      case 'warning':
        navigator.vibrate([20, 50, 10]);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch (err) {
    // Ignore errors for devices that don't support vibration properly or have permissions issues.
  }
};
