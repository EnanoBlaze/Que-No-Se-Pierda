// src/components/PaypalButtonComponent.js
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PaypalButtonComponent = ({ totalAmount }) => {
  return (
    <PayPalScriptProvider options={{ "client-id": "AdlMnxh6-lbERFTjnrzAh6lLQMTFcfebgRL5Qp07SO-BjmX2J7S3MWhdkJo0uluMe1Z8QTWYpvE6LCVu" }}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: totalAmount, // Monto total de la compra
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            alert("Transacción completada por " + details.payer.name.given_name);
            // Aquí puedes manejar lo que suceda después del pago
          });
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PaypalButtonComponent;
