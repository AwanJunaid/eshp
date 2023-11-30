// CashOnDeliveryForm.jsx
import React from "react";

const CashOnDeliveryForm = ({ onSubmit }) => {
  // Implement your Cash on Delivery form here

  return (
    <form onSubmit={onSubmit}>
      {/* Your form fields for Cash on Delivery */}
      <button type="submit">Place Order (Cash on Delivery)</button>
    </form>
  );
};

export default CashOnDeliveryForm;
