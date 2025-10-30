// Helper utility functions
export const sleepTimer = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (
  balance: string,
  decimals: number = 18
): string => {
  try {
    const num = parseFloat(balance) / Math.pow(10, decimals);
    return num.toFixed(4);
  } catch {
    return "0";
  }
};

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const getTransactionErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: string }).message;
    if (message.includes("user rejected")) {
      return "Transaction was rejected by user";
    }
    if (message.includes("insufficient funds")) {
      return "Insufficient funds for transaction";
    }
    if (message.includes("gas")) {
      return "Gas estimation failed";
    }
  }
  return "Transaction failed";
};
