import React, { useState } from "react";
import { checkDelivery } from "../Services/shiprocketService.js";

export default function DeliveryChecker() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!pincode) return alert("Please enter a pincode");
    setLoading(true);
    const data = await checkDelivery(pincode);
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>🚚 Check Delivery Availability</h2>
      <input
        type="text"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
        placeholder="Enter Pincode"
        style={{ padding: "8px", marginRight: "10px" }}
      />
      <button onClick={handleCheck} disabled={loading}>
        {loading ? "Checking..." : "Check"}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          {result.success ? (
            <>
              <p>
                ✅ Delivery available! Estimated Delivery:{" "}
                <strong>{result.estimatedDelivery}</strong>
              </p>
              <ul style={{ textAlign: "left", display: "inline-block" }}>
                {result.courierOptions?.map((c, i) => (
                  <li key={i}>
                    {c.name} — {c.deliveryDays} days — ₹{c.rate}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>❌ Not Deliverable</p>
          )}
        </div>
      )}
    </div>
  );
}
