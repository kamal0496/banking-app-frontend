import React, { useState } from "react";

const API_BASE = "";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function TransferPaymentForm() {
  const [form, setForm] = useState({
    senderAccountNumber: "",
    receiverAccountNumber: "",
    amount: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1) Create Razorpay order from payment-service via gateway
      const orderRes = await fetch(`${API_BASE}/api/v1/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accountNumber: form.senderAccountNumber,
          receiverAccountNumber: form.receiverAccountNumber,
          amount: Number(form.amount),
          description: form.description || "Fund transfer"
        })
      });

      console.log("razorpay order: ", orderRes);
      if (!orderRes.ok) {
        throw new Error("Failed to create payment order");
      }

      const order = await orderRes.json();

      // 2) Load Razorpay checkout script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      // 3) Open Razorpay Checkout
      const options = {
        key: order.razorpayKeyId,
        amount: Number(order.amount) * 100, // amount in paise
        currency: order.currency,
        name: "Banking App",
        description: order.description || "Account transfer",
        order_id: order.razorpayOrderId,
        handler: function (response) {
          // Razorpay success callback
          console.log("Payment success:", response);

          setMessage("Payment successful. Backend webhook is processing the transfer.");
          // In your app, the real transfer is completed by backend services
          // after payment.captured webhook is received.
        },
        prefill: {
          name: "Demo User",
          email: "demo@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: function () {
            setMessage("Payment popup closed. No funds were transferred.");
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Transfer Money</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Sender Account</label><br />
          <input
            name="senderAccountNumber"
            value={form.senderAccountNumber}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Receiver Account</label><br />
          <input
            name="receiverAccountNumber"
            value={form.receiverAccountNumber}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Amount</label><br />
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
            min="1"
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Description</label><br />
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#3399cc",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Processing..." : "Pay & Transfer"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 16, color: message.includes("successful") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}