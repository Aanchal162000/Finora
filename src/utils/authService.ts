// Authentication service functions
import type { IUserMe } from "@/app/interfaces";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
};

export const removeToken = async (): Promise<void> => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
};

export const getNonce = async (
  address: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<{ data: { message: string } }> => {
  // Mock implementation - replace with actual API call
  return {
    data: {
      message: `Please sign this message to authenticate: ${Date.now()}`,
    },
  };
};

export const login = async (
  address: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  message: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  signature: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<{ data: { token: { token: string } } }> => {
  // Mock implementation - replace with actual API call
  return {
    data: {
      token: {
        token: `mock_token_${Date.now()}`,
      },
    },
  };
};

export const getMe = async (
  token: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<IUserMe> => {
  // Mock implementation - replace with actual API call
  return {
    address: "0x1234567890123456789012345678901234567890",
    isWhitelisted: true,
    twitterAccount: undefined,
    morphoVault: null,
    isIntitialDeposit: false,
  };
};
