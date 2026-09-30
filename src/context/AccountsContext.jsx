import { createContext, useContext, useReducer, useCallback } from "react";
import { useAuthFetch } from "../hooks/UseAuthFetch";

const gatewayURI = import.meta.env.VITE_GATEWAY_URI;

const AccountsContext = createContext(null);

const initialState = {
  users: null,
  selectedAccountId: undefined,
  transferFormVisible: false,
  transactionHistory: undefined,
  isLoadingAccounts: false,
  isLoadingTransactionHistory: false
};

function reducer(state, action) {
  switch (action.type) {

    case 'FETCH_ACCOUNTS_START':
            return { ...state, isLoadingAccounts: true };

     case 'FETCH_TRANSACTION_HISTORY_START':
            return { ...state, isLoadingTransactionHistory: true, transferFormVisible: false };

    case "SET_USERS":
      return { ...state, users: action.payload, isLoadingAccounts:false };

    case "SELECT_ACCOUNT":
      return {
        ...state,
        selectedAccountId: action.payload,
        transferFormVisible: false,
        transactionHistory: undefined,
      };

    case "SHOW_TRANSFER_FORM":
      return {
        ...state,
        transferFormVisible: true,
        transactionHistory: undefined,
      };

    case "SET_TRANSACTION_HISTORY":
      return {
        ...state,
        transferFormVisible: false,
        transactionHistory: action.payload,
        isLoadingTransactionHistory: false
      };

    default:
      return state;
  }
}

export function AccountsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // fetch wrapper that attaches the Auth0 access token as a Bearer header
  const authFetch = useAuthFetch();

  const fetchAccounts = useCallback(() => {
    dispatch({ type: 'FETCH_ACCOUNTS_START' });
    authFetch(`${gatewayURI}/api/v1/accounts`)
      .then((response) => {
        // a 401/403 has no JSON body; fail explicitly instead of a confusing parse error
        if (!response.ok) throw new Error(`Failed to fetch accounts: ${response.status}`);
        return response.json();
      })
      .then((data) => dispatch({ type: "SET_USERS", payload: data }))
      .catch((error) => {
        // was "SET_USER" (typo, no such case), which left the spinner running forever
        dispatch({ type: "SET_USERS", payload: null });
        console.log("error", error);
      });
  }, [authFetch]);

  const selectAccount = useCallback((accountId) => {
    dispatch({ type: "SELECT_ACCOUNT", payload: accountId });
  }, []);

  const showTransferForm = useCallback(() => {
    dispatch({ type: "SHOW_TRANSFER_FORM" });
  }, []);

  const fetchTransactionHistory = useCallback((accountNumber) => {
    dispatch({ type: 'FETCH_TRANSACTION_HISTORY_START' });
    authFetch(`${gatewayURI}/api/v1/transactions/history/${accountNumber}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch history: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log("Transaction history:", data);
        dispatch({ type: "SET_TRANSACTION_HISTORY", payload: data });
      })
      .catch((error) => {
        console.error("Error occurred:", error);
        dispatch({ type: 'SET_TRANSACTION_HISTORY', payload: null });
      });
  }, [authFetch]);

  // Polls the account list until a specific account's balance differs from
  // `previousBalance`, then leaves the refreshed data in state.
  // Necessary because receiver credit is applied asynchronously (Fraud
  // Detection consumes transaction.initiated -> transaction.completed is
  // published -> Account Service credits the receiver), so neither the
  // transfer response nor the OTP-verify response guarantee the credit has
  // landed by the time they return - only the balance itself tells us.
  const pollAccountBalanceChange = useCallback(
    (
      accountNumber,
      previousBalance,
      { intervalMs = 1000, maxAttempts = 8 } = {},
    ) => {
      if (!accountNumber) return;
      let attempts = 0;

      const poll = () => {
        attempts += 1;
        authFetch(`${gatewayURI}/api/v1/accounts`, { cache: "no-store" })
          .then((response) => response.json())
          .then((data) => {
            dispatch({ type: "SET_USERS", payload: data });
            const updated = data.find((u) => u.accountNumber === accountNumber);
            const changed =
              updated &&
              previousBalance !== undefined &&
              updated.balance !== previousBalance;
            if (!changed && attempts < maxAttempts) {
              setTimeout(poll, intervalMs);
            }
          })
          .catch((error) =>
            console.error("Error polling account balance:", error),
          );
      };

      poll();
    },
    [authFetch],
  );

  const selectedAccount = state.users?.find(
    (u) => u.id === state.selectedAccountId,
  );


  const value = {
    ...state,
    selectedAccount,
    fetchAccounts,
    selectAccount,
    showTransferForm,
    fetchTransactionHistory,
    pollAccountBalanceChange,
    authFetch
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (context === null) {
    throw new Error("useAccounts must be used within an AccountsProvider");
  }
  return context;
}

export default AccountsContext;