# Account Activation Hooks

This directory contains hooks and components for managing user account activation in the CDP Trading App.

## Hooks

### `useAccountActivation`

A comprehensive hook that handles both checking account status and activating accounts.

**Features:**
- Checks if user account is activated
- Provides account activation functionality
- Auto-activates accounts when needed
- Handles gas transfer for new users
- Manages loading and error states

**Usage:**
```tsx
import { useAccountActivation } from "@/hooks/use-account-activation";

function MyComponent() {
  const {
    isActivated,
    isChecking,
    activateAccount,
    isActivating,
    needsActivation,
    isReady,
  } = useAccountActivation();

  if (needsActivation) {
    return <button onClick={activateAccount}>Activate Account</button>;
  }

  if (isReady) {
    return <div>Account is ready!</div>;
  }

  return <div>Loading...</div>;
}
```

**Return Values:**
- `isActivated`: Boolean indicating if account is activated
- `isChecking`: Boolean indicating if checking account status
- `checkError`: Error from account status check
- `activateAccount`: Function to manually activate account
- `isActivating`: Boolean indicating if activation is in progress
- `activationError`: Error from activation attempt
- `needsActivation`: Boolean indicating if account needs activation
- `isReady`: Boolean indicating if account is ready to use

### `useAccountStatus`

A simpler hook that only checks account status without activation functionality.

**Usage:**
```tsx
import { useAccountStatus } from "@/hooks/use-account-status";

function MyComponent() {
  const { isActivated, isLoading, error } = useAccountStatus();

  if (isLoading) return <div>Checking account...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return isActivated ? <div>Activated</div> : <div>Not activated</div>;
}
```

## Components

### `AccountActivationGuard`

A wrapper component that automatically handles account activation for its children.

**Features:**
- Automatically checks account status
- Shows activation UI when needed
- Auto-activates accounts
- Provides loading and error states
- Seamless user experience

**Usage:**
```tsx
import { AccountActivationGuard } from "@/components/account-activation-guard";

function App() {
  return (
    <AccountActivationGuard>
      <Dashboard />
    </AccountActivationGuard>
  );
}
```

**Props:**
- `children`: React nodes to render when account is ready
- `showActivationUI`: Boolean to control whether to show activation UI (default: true)

## Integration

The `AccountActivationGuard` is automatically integrated into the app via `app-client.tsx`. This ensures that all signed-in users have their accounts activated before accessing the app features.

## Gas Transfer

When a new user activates their account for the first time, they automatically receive:
- `0.00010794752 ETH` (approximately $0.25 worth of gas)
- This helps them get started with transactions immediately

## Error Handling

Both hooks provide comprehensive error handling:
- Network errors during status checks
- Activation failures
- Insufficient server wallet balance
- Authentication errors

Errors are logged to the console and can be handled by the consuming components. 