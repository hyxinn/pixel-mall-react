const PIXEL_TOAST_EVENT = 'pixel-mall:toast';

export const showPixelToast = (message, options = {}) => {
  if (!message || typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(PIXEL_TOAST_EVENT, {
    detail: {
      message,
      duration: options.duration || 2000,
      tone: options.tone || 'warning',
    },
  }));
};

export { PIXEL_TOAST_EVENT };
