// Toast utility functions
export const toastError = (
  message: string,
  _options?: Record<string, unknown> // Underscore disables eslint unused warning, intentional for future toast lib support
) => {
  console.error("Error:", message);
  // You can integrate with your preferred toast library here
  // For now, we'll just log to console
};

export const toastInfo = (
  message: string,
  _options?: Record<string, unknown> // Same as above: underscore disables unused warning; param kept for future compatibility
) => {
  console.info("Info:", message);
  // You can integrate with your preferred toast library here
  // For now, we'll just log to console
};

export const toastSuccess = (
  message: string,
  _options?: Record<string, unknown> // Same as above
) => {
  console.log("Success:", message);
  // You can integrate with your preferred toast library here
  // For now, we'll just log to console
};
