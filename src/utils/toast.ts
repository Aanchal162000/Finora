// Toast utility functions
export const toastError = (message: string, options?: any) => {
  console.error("Error:", message);
  // You can integrate with your preferred toast library here
  // For now, we'll just log to console
};

export const toastInfo = (message: string, options?: any) => {
  console.info("Info:", message);
  // You can integrate with your preferred toast library here
  // For now, we'll just log to console
};

export const toastSuccess = (message: string, options?: any) => {
  console.log("Success:", message);
  // You can integrate with your preferred toast library here
  // For now, we'll just log to console
};

