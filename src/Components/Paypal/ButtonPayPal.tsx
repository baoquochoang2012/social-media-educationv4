import React, { useEffect } from "react";
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from "@paypal/react-paypal-js";



const PayPalModal = ({ openModal, setOpenModal, infClassRoom, loading, handleJoin, currency, amount }) => {
  if (!openModal) return null;
  const style = { layout: "vertical" };
  const ButtonWrapper = ({ currency, showSpinner, amount }) => {
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

    return (
      <>
        {showSpinner && isPending && <div className="spinner" />}
        <PayPalButtons
          style={style}
          disabled={false}
          forceReRender={[amount, currency, style]}
          fundingSource={undefined}
          createOrder={(datas, actions) => {
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
                intent: "CAPTURE"
              })
              .then((orderId) => {
                return orderId;
              });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then(() => {
              // Your code here after capture
              setTimeout(() => {
                handleJoin();
              }, 500);
            });
          }}
        />
      </>
    );
  };
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" key="paypalModal">
      <div className="relative max-h-screen w-full max-w-sm overflow-y-auto p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <button
          className="absolute top-2 right-2 text-white text-2xl bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
          onClick={() => setOpenModal(false)}
        >
          &times;
        </button>
        <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <h5 className="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400">{infClassRoom.nameRoom}</h5>
          <div className="flex items-baseline text-gray-900 dark:text-white">
            <span className="text-5xl font-extrabold tracking-tight">{infClassRoom.feeAmount || 'Free'}</span>
          </div>
          <div className="space-y-5 my-7">
            {infClassRoom.description || 'Chưa cập nhật'}
          </div>
          {!infClassRoom.feeAmount ? (
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-200 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex justify-center w-full text-center"
              onClick={handleJoin}
              disabled={loading}
            >
              Tham gia {loading && '...'}
            </button>
          ) : (
            <PayPalScriptProvider
              options={{
                "client-id": "test",
                components: "buttons",
                currency: "USD",
              }}
              deferLoading
            >
              <ButtonWrapper currency={currency} showSpinner={false} amount={amount} />
            </PayPalScriptProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayPalModal;
