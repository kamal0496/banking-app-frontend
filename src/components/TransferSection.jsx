import { useState } from "react";
import { useAccounts } from "../context/AccountsContext";
import TransactionHistory from "./TransactionHistory";

const TransferSection = () => {
  const { users, selectedAccount, fetchAccounts, pollAccountBalanceChange,fetchTransactionHistory } =
    useAccounts();
  const userId = selectedAccount?.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferResponse, setTransferResponse] = useState(undefined);

  function handleTransfer(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);  
    setTransferResponse(undefined);

    const fromAccount = event.target.fromAccount.value;
    const toAccount = event.target.toAccount.value;
    const amount = event.target.amount.value;
    const description = event.target.description.value;

    // snapshot the receiver's balance now, before it's overwritten by any
    // refetch, so we know what value we're waiting to see change
    const receiverPreviousBalance = users?.find(
      (u) => u.accountNumber === toAccount,
    )?.balance;

    console.log(
      `Transferring ${amount} from account ${fromAccount} to account ${toAccount}`,
    );
    fetch("http://localhost:9090/api/v1/transactions/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderAccountNumber: fromAccount,
        receiverAccountNumber: toAccount,
        amount: amount,
        description: description,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Transfer successful:", data);
        
        event.target.reset(); // Reset the form after successful transfer
        fetchAccounts(); // picks up the sender's debit, which is synchronous
        pollAccountBalanceChange(toAccount, receiverPreviousBalance); // waits for the async receiver credit
        setTransferResponse(data);
      })
      .catch((error) => {
        console.error("Error occurred:", error)
        setTransferResponse({ error: true, message: 'Transfer failed. Please try again.' });
      })
      .finally(() => setIsSubmitting(false));
  }
  
  function handleViewTransaction(accountNumber) {
    fetchTransactionHistory(accountNumber);
    showFormAndHistory()
  }

  return (
    <section id="transfer-section">
      <h3>Transfer Funds</h3>
      <form onSubmit={handleTransfer}>
        <label htmlFor="fromAccount">From Account:</label>
        <select id="fromAccount" name="fromAccount">
          {users &&
            users
              .filter((user) => user.id == userId)
              .map((user) => (
                <option key={user.id} value={user.accountNumber}>
                  {user.accountHolderName} - {user.accountNumber}
                </option>
              ))}
        </select>
        <label htmlFor="toAccount">To Account:</label>
        <select id="toAccount" name="toAccount">
          {users &&
            users
              .filter((user) => user.id !== userId)
              .map((user) => (
                <option key={user.id} value={user.accountNumber}>
                  {user.accountHolderName} - {user.accountNumber}
                </option>
              ))}
        </select>
        <label htmlFor="amount">Amount:</label>
        <input type="number" id="amount" name="amount" />

        <label htmlFor="description"> Description:</label>
        <input type="text" id="description" name="description" />
        <button type="submit">Transfer</button>
      </form>
      {transferResponse && (
                <div className={`transfer-response ${transferResponse.error ? 'transfer-response-error' : ''}`}>
                    {transferResponse.error ? (
                        <p>{transferResponse.message}</p>
                    ) : (
                        <>
                            <p><span className="transfer-response-label">Reference Number: </span>{transferResponse.referenceNumber}</p>
                            <p><span className="transfer-response-label">Amount: </span>{transferResponse.amount}</p>
                            <p><span className="transfer-response-label">Description: </span>{transferResponse.description}</p>
                            <p><span className="transfer-response-label">Sender Account: </span>{transferResponse.senderAccountNumber}</p>
                            <p><span className="transfer-response-label">Receiver Account: </span>{transferResponse.receiverAccountNumber}</p>
                            <p><span className="transfer-response-label">Status: </span>{transferResponse.transactionStatus}</p>
                            <p><span className="transfer-response-label">View transactions history to know completion status</span></p>
                        </>
                    )}
                </div>
            )}
    </section>
  );
};

export default TransferSection;
