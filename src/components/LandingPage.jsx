import { useState, useEffect } from "react";
import Account from "./Account.jsx";
import AccountDetails from "./AccountDetails.jsx";
import TransferSection from "./TransferSection.jsx";
import TransactionHistory from "./TransactionHistory.jsx";
import { useAccounts } from "../context/AccountsContext.jsx";

function LandingPage() {
  const {
    users,
    selectedAccount,
    transferFormVisible,
    transactionHistory,
    fetchAccounts,
  } = useAccounts();

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return (
    <>
      {console.log("LandingPage ComponentR Rendered")}
      <h2>Hello, from LandingPage component</h2>
      <main className="accounts-container">
        <section id="accounts-list">
          {users && users.map((user) => <Account key={user.id} user={user} />)}
          {!users && <p>Unable to fetch accounts..</p>}
        </section>
        <section id="accounts-details">
          {selectedAccount && <AccountDetails />}
          {!selectedAccount && (
            <p>
              please click on the "Show Details" link to view account details.
            </p>
          )}
        </section>
      </main>

      {transferFormVisible && <TransferSection />}
      {transactionHistory && <TransactionHistory />}
    </>
  );
}

export default LandingPage;
