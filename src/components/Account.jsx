import { useState } from "react";
import { useAccounts } from "../context/AccountsContext";

const Account = ({ user }) => {
  const { selectedAccount, selectAccount } = useAccounts();
  const active = selectedAccount?.id === user.id;

  function handleShowDetails(event) {
    event.preventDefault();
    selectAccount(user.id);
  }

  return (
    <>
      <div className={`account-card ${active ? "active" : ""}`}>
        <p>{user.accountHolderName}</p>
        <p>{user.accountNumber}</p>
        <a href="#" onClick={handleShowDetails}>
          Show Details
        </a>
      </div>
    </>
  );
};

export default Account;
