# Wallet Connection Context

This project includes a comprehensive wallet connection context that manages wallet connections, user authentication, and blockchain interactions.

## Features

- **Multi-wallet Support**: MetaMask, Trust Wallet, WalletConnect, and Coinbase Wallet
- **Chain Management**: Automatic network switching and chain detection
- **User Authentication**: Backend integration with signature-based authentication
- **Token Balance Fetching**: Support for both native and ERC20 tokens
- **User Profile Management**: Centralized user state management
- **Reusable Components**: Modular design for easy integration

## File Structure

```
src/
├── app/
│   ├── contexts/
│   │   └── WalletContext.tsx          # Main wallet context provider
│   ├── components/
│   │   ├── WalletSignup.tsx          # Wallet selection component
│   │   └── WalletInfo.tsx            # Wallet information display
│   ├── interfaces.ts                 # TypeScript interfaces
│   └── layout.tsx                    # App layout with WalletProvider
├── hooks/
│   └── useWallet.ts                  # Custom hook for wallet functionality
├── utils/
│   ├── toast.ts                      # Toast notification utilities
│   ├── helper.ts                     # General helper functions
│   └── authService.ts               # Authentication service
└── consts/
    └── config.ts                     # Configuration constants
```

## Usage

### 1. Using the Wallet Hook

```tsx
import { useWallet } from "@/hooks/useWallet";

function MyComponent() {
  const { address, chainId, isConnected, connectWallet, disconnect } =
    useWallet();

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <p>Chain ID: {chainId}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => connectWallet("MetaMask")}>
          Connect MetaMask
        </button>
      )}
    </div>
  );
}
```

### 2. Wallet Connection

```tsx
const { connectWallet, loading } = useWallet();

// Connect different wallets
await connectWallet("MetaMask");
await connectWallet("Trust Wallet");
await connectWallet("WalletConnect");
await connectWallet("Coinbase Wallet");
```

### 3. Network Switching

```tsx
const { switchNetwork } = useWallet();

// Switch to Base network (chainId: 8453)
await switchNetwork(8453);
```

### 4. Token Balance Fetching

```tsx
const { fetchTokenBalance } = useWallet();

// Fetch native token balance
const nativeBalance = await fetchTokenBalance(
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  8453
);

// Fetch ERC20 token balance
const tokenBalance = await fetchTokenBalance("0xTokenContractAddress", 8453);
```

### 5. User Profile Management

```tsx
const { userProfile, isOnboarded, isWhitelisted } = useWallet();

console.log("User Profile:", userProfile);
console.log("Is Onboarded:", isOnboarded);
console.log("Is Whitelisted:", isWhitelisted);
```

## Configuration

### Supported Networks

The context supports multiple networks. Configure them in `src/consts/config.ts`:

```typescript
export const chainNetworkParams: Record<number, any> = {
  8453: {
    chainId: "0x20ED",
    chainName: "Base",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
  // Add more networks as needed
};
```

### RPC URLs

Configure RPC URLs for different networks:

```typescript
export const alchemyProviderURL: Record<number, string> = {
  1: "https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY",
  8453: "https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
};
```

## Authentication Flow

1. **Wallet Connection**: User connects their wallet
2. **Message Signing**: User signs a message for authentication
3. **Backend Authentication**: Signature is sent to backend for verification
4. **Token Storage**: Authentication token is stored locally
5. **User Data Fetching**: User profile and permissions are fetched

## Error Handling

The context includes comprehensive error handling for:

- Wallet not installed
- User rejection
- Network switching failures
- Authentication errors
- Transaction failures

## Best Practices

1. **Always check connection state** before making wallet calls
2. **Handle loading states** for better UX
3. **Provide fallback UI** for disconnected state
4. **Use the custom hook** instead of accessing context directly
5. **Handle errors gracefully** with user-friendly messages

## Dependencies

The wallet context requires these packages:

```json
{
  "wagmi": "^2.x",
  "viem": "^2.x",
  "@web3-react/core": "^8.x",
  "@trustwallet/web3-react-trust-wallet": "^1.x",
  "ethers": "^5.x",
  "axios": "^1.x"
}
```

## Integration

To integrate the wallet context in your app:

1. Wrap your app with `WalletProvider` in `layout.tsx`
2. Use the `useWallet` hook in your components
3. Configure your RPC URLs and network parameters
4. Set up your backend authentication endpoints

## Example Components

- `WalletSignup.tsx`: Wallet selection interface
- `WalletInfo.tsx`: Connected wallet information display
- Both components are fully functional and can be customized as needed

