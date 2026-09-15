import { useAccounts } from "../context/AccountsContext";

const AccountDetails = () => {
  const {
    selectedAccount: account,
    showTransferForm,
    fetchTransactionHistory,
    fetchAccounts,
  } = useAccounts();

  function handleTransferFund(event) {
    showTransferForm();
  }

  function handleViewTransaction() {
    fetchTransactionHistory(account.accountNumber);
  }

  function handleUnblockAccount() {
    fetch(
      `/api/v1/accounts/${account.accountNumber}/unblock`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        console.log(data);
        fetchAccounts();
      })
      .catch((error) => console.error("Error occurred:", error));
  }

  return (
    <>
      <div className="account-details-card">
        <p>
          <span className="account-detail-label">Account Holder Name: </span>
          {account.accountHolderName}
        </p>
        <p>
          <span className="account-detail-label">Account Number: </span>
          {account.accountNumber}
        </p>
        <p>
          <span className="account-detail-label">Account Type: </span>
          {account.accountType}
        </p>
        <p>
          <span className="account-detail-label">Account Status: </span>
          {account.accountStatus}
        </p>
        <p>
          <span className="account-detail-label">Balance: </span>
          {new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR', // Change to 'USD' or others if you just want the comma style without the ₹ symbol
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(account.balance)}
        </p>
        <p>
          <span className="account-detail-label">
            Daily Transaction Limit:{" "}
          </span>
          {account.dailyTransactionLimit}
        </p>
        <p>
          <span className="account-detail-label">Created At: </span>
          {account.createdAt}
        </p>
        <button onClick={handleTransferFund}>Transfer Funds</button>
        <button onClick={handleViewTransaction}>View Transactions</button>
        {account.accountStatus != "ACTIVE" && (
          <button onClick={handleUnblockAccount}>Unblock Account</button>
        )}
      </div>
    </>
  );
};

export default AccountDetails;
