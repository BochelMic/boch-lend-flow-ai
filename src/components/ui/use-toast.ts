
import { useToast } from "@/hooks/use-toast";

// Create a singleton toast function
let toastFunction: ReturnType<typeof useToast>['toast'] | null = null;

export const toast = (...args: Parameters<ReturnType<typeof useToast>['toast']>) => {
  if (!toastFunction) {
    console.warn("Toast function not initialized. Make sure useToast hook is called in a component.");
    return { id: "", dismiss: () => {}, update: () => {} };
  }
  return toastFunction(...args);
};

export { useToast };

// Initialize toast function when hook is used
export const initializeToast = (toastFn: ReturnType<typeof useToast>['toast']) => {
  toastFunction = toastFn;
};
