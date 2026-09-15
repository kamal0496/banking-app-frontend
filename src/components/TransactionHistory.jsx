import { useState } from "react";
import { useAccounts } from "../context/AccountsContext";

const TransactionHistory = () => {
  const {
    transactionHistory: transactions,
    users,
    pollAccountBalanceChange,
    fetchTransactionHistory,
    selectedAccount
  } = useAccounts();
  let accountReceiverName = "";
  let accountSenderName = "";
  const [otpVerificationStatus, setOtpVerificationStatus] = useState(null);

  function verifyOTP(event) {
    event.preventDefault();
    const otpInput = event.target.querySelector(".otp-input");
  otpInput.setAttribute("disabled", true)
    const otpValue = otpInput.value;
    const transactionId = event.target.getAttribute("tx"); // Get the transaction ID from the form's attribute

    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Disable the submit button to prevent multiple submissions

    // snapshot the receiver's balance now, before verification, so we know
    // what value the poll below is waiting to see change
    const transaction = transactions.find((t) => t.id === transactionId);
    const receiverAccountNumber = transaction.receiverAccountNumber;
    const senderAccountNumber = selectedAccount.accountNumber;
    const senderPreviousBalance = selectedAccount.balance;

    const receiverPreviousBalance = users?.find(
      (u) => u.accountNumber === receiverAccountNumber,
    )?.balance;

    fetch(
      `/api/v1/transactions/${transactionId}/verify?otp=${otpValue}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("OTP verification successful:", data);

        if (data && data.transactionStatus === "COMPLETED") {
          console.log("OTP verification successful:", data);

          if (data && data.transactionStatus === "COMPLETED") {
            setOtpVerificationStatus("success");
            // the transaction record is COMPLETED here, but the receiver's
            // credit is applied by Account Service via a Kafka event, so
            // poll the balance itself rather than assuming it's already in
            pollAccountBalanceChange(
              receiverAccountNumber,
              receiverPreviousBalance,
            );
          } else {
            setOtpVerificationStatus("error");
            pollAccountBalanceChange(
              senderAccountNumber,
              senderPreviousBalance,
            );
            // submitButton.disabled = false; // Re-enable the submit button on error
          }
        } else {
          setOtpVerificationStatus("error");
          // submitButton.disabled = false; // Re-enable the submit button on error
          pollAccountBalanceChange(
              senderAccountNumber,
              senderPreviousBalance,
            );
        }
      })
      .catch((error) => {
        console.error("Error occurred during OTP verification:", error);
        setOtpVerificationStatus("error");
        // submitButton.disabled = false; // Re-enable the submit button on error
      })
      .finally(()=>{
        window.setTimeout(()=>{
                fetchTransactionHistory(senderAccountNumber)
            }, 2000)
      });
  }

  return (
    <section id="transaction-history">
      <h3>Transaction History</h3>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (

        transactions.filter(tx=>{
          if(!(tx.transactionStatus != "COMPLETED" && tx.receiverAccountNumber == selectedAccount.accountNumber)){
            return tx;
          }
        })
        .map((tx) => {
          accountReceiverName =
            users?.find(
              (user) => user.accountNumber === tx.receiverAccountNumber,
            )?.accountHolderName || "";
          
          accountSenderName =
            users?.find(
              (user) => user.accountNumber === tx.senderAccountNumber,
            )?.accountHolderName || "";

          return (
            <div key={tx.referenceNumber} className="transaction-card">
              <p>
                <span className="transaction-detail-label">
                  Reference Number:{" "}
                </span>
                {tx.referenceNumber}
              </p>
              <p>
                <span className="transaction-detail-label">Amount: </span>
                {selectedAccount.accountNumber == tx.senderAccountNumber && (`- ` + tx.amount)}
                {selectedAccount.accountNumber != tx.senderAccountNumber && (`+ ` + tx.amount)}
              </p>
              <p>
                <span className="transaction-detail-label">Description: </span>
                {tx.description}
              </p>
              <p>
                {selectedAccount.accountNumber == tx.senderAccountNumber && (
                  <>
                    <span className="transaction-detail-label">Receiver Account Number:{" "}</span>
                    {tx.receiverAccountNumber}
                  </>
                )}

                {selectedAccount.accountNumber != tx.senderAccountNumber && (
                  <>
                    <span className="transaction-detail-label">Sender Account Number:{" "}</span>
                    {tx.senderAccountNumber}
                  </>
                )} 
              </p>
              <p>
                {selectedAccount.accountNumber == tx.senderAccountNumber && (
                  <>
                      <span className="transaction-detail-label">
                      Receiver Account Name:{" "}
                      </span>
                      {accountReceiverName}
                  </>
                )}

                {selectedAccount.accountNumber != tx.senderAccountNumber && (
                  <>
                    <span className="transaction-detail-label">Sender Account Name:{" "}</span>
                    {accountSenderName}
                  </>
                )}
              </p>
              <p>
                <span className="transaction-detail-label">
                  Transaction Date:{" "}
                </span>
                {tx.createdAt}
              </p>
              <p>
                <span className="transaction-detail-label">
                  Transaction Status:{" "}
                </span>
                {tx.transactionStatus}
              </p>
              {tx.transactionStatus != "COMPLETED" && (
                <p>
                  <span className="transaction-detail-label">
                    Failure Message:{" "}
                  </span>
                  {tx.failureMessage}
                </p>
              )}

              {tx.transactionStatus === "PENDING_VERIFICATION" && (
                <form onSubmit={verifyOTP} className="otp-form" tx={tx.id}>
                  <input
                    name="otp"
                    type="text"
                    placeholder="Enter OTP"
                    className="otp-input"
                  />
                  <button type="submit">Submit OTP</button>
                  {otpVerificationStatus === "success" && (
                    <p className="otp-success">OTP verification successful!</p>
                  )}
                  {otpVerificationStatus === "error" && (
                    <p className="otp-error">OTP verification failed</p>
                  )}
                </form>
              )}
            </div>
          );
        })
      )}
    </section>
  );
};

export default TransactionHistory;
