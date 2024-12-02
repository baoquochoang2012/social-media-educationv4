import React, { useEffect } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

export const ButtonWrapper = ({ currency, showSpinner, amount, handleJoin }) => {
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

  useEffect(() => {
    dispatch({
      type: "resetOptions",
      value: {
        ...options,
        currency: currency,
      },
    });
  }, [currency, showSpinner]);

  // Define the style if not passed as a prop
  const style = { layout: "vertical" };

  return (
    <>
      {showSpinner && isPending && <div className="spinner">Loading...</div>}
      <PayPalButtons
        style={style}
        disabled={false}
        forceReRender={[amount, currency, style]}
        createOrder={(data, actions) => {
          return actions.order
            .create({
              purchase_units: [
                {
                  amount: {
                    currency_code: currency,
                    value: amount,
                  },
                },
              ],
              intent: "CAPTURE",
            })
            .then((orderId) => {
              return orderId;
            });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then(() => {
            // After successful payment capture
            setTimeout(() => {
              handleJoin(); // Call the handleJoin function
            }, 500);
          });
        }}
      />
    </>
  );
};
