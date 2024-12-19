// src/Paginas/PortalPago.js
import React, { useEffect, useState } from "react";
import { useCarrito } from "../context/CarritoContext";
import "./PortalPago.css";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { db, storage, auth } from "../firebase";
import {
  setDoc,
  doc,
  deleteDoc,
  collection,
  getDocs,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";

const PortalPago = () => {
  const { carrito, vaciarCarrito } = useCarrito();
  const [total, setTotal] = useState(0);
  const [totalUSD, setTotalUSD] = useState(0); // Estado para el total en USD
  const [user] = useAuthState(auth);
  const [contador, setContador] = useState(null);
  const navigate = useNavigate();
  const conversionRate = 0.0013; // Tasa de conversión fija de CLP a USD (por ejemplo)

  useEffect(() => {
    const calcularTotal = () => {
      const totalCalculado = carrito.reduce(
        (sum, producto) => sum + producto.precio * producto.cantidad,
        0,
      );
      setTotal(totalCalculado);
      setTotalUSD((totalCalculado * conversionRate).toFixed(2)); // Convertir CLP a USD
    };
    calcularTotal();
  }, [carrito]);

  useEffect(() => {
    if (contador !== null) {
      const timer = setInterval(() => {
        if (contador > 0) {
          setContador((prevContador) => prevContador - 1);
        } else {
          clearInterval(timer);
          navigate("/tienda");
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [contador, navigate]);

  const handleApprove = async (data, actions) => {
    return actions.order.capture().then(async (details) => {
      // Mostrar el mensaje de confirmación
      alert(`Pago completado por ${details.payer.name.given_name}`);

      if (user) {
        try {
          // Guardar la venta en la base de datos
          const ventaRef = doc(db, "usuarios", user.uid, "ventas", details.id);
          await setDoc(ventaRef, {
            productos: carrito,
            total: total,
            fecha: new Date(),
          });
          console.log("Venta registrada con éxito en la base de datos.");

          // Actualizar la cantidad de productos en Firestore
          for (const producto of carrito) {
            const productoRef = doc(db, "productos", producto.id);
            const productoSnapshot = await getDoc(productoRef);
            if (productoSnapshot.exists()) {
              const cantidadActual = productoSnapshot.data().cantidad;
              const nuevaCantidad = cantidadActual - producto.cantidad;

              // Asegurarse de que la cantidad no sea menor a 0
              if (nuevaCantidad >= 0) {
                await updateDoc(productoRef, { cantidad: nuevaCantidad });
                console.log(
                  `Cantidad actualizada para el producto: ${producto.nombre}`,
                );
              } else {
                console.error(
                  `No hay suficiente cantidad para el producto: ${producto.nombre}`,
                );
              }
            } else {
              console.error(`El producto con ID ${producto.id} no existe.`);
            }
          }

          // Generar y subir el PDF de la boleta a Firebase Storage
          const pdfElement = document.getElementById("boleta-pdf");
          const opt = {
            margin: 1,
            filename: `boleta_${details.id}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { orientation: "portrait" },
          };

          // Generar el PDF
          const pdfBlob = await html2pdf()
            .from(pdfElement)
            .set(opt)
            .outputPdf("blob");

          // Subir el PDF a Firebase Storage
          const storageRef = ref(storage, `boletas/${opt.filename}`);
          await uploadBytes(storageRef, pdfBlob);
          console.log("Boleta subida con éxito a Firebase Storage.");

          // Vaciar el carrito en Firestore
          const carritoRef = collection(db, "usuarios", user.uid, "carrito");
          const carritoSnapshot = await getDocs(carritoRef);
          for (const productoDoc of carritoSnapshot.docs) {
            await deleteDoc(productoDoc.ref);
          }
          console.log("Carrito vaciado con éxito en Firestore.");

          // Vaciar el carrito en el estado local
          vaciarCarrito();
          console.log("Carrito vaciado con éxito en el estado local.");

          // Iniciar el contador de 10 segundos antes de redirigir al usuario al menú principal
          setContador(10);
        } catch (error) {
          console.error(
            "Error al guardar la venta, actualizar la cantidad de productos o generar la boleta:",
            error,
          );
        }
      }
    });
  };

  return (
    <div className="portal-pago-container">
      <h2>Portal de Pago</h2>
      <p>Aquí puedes completar tu compra y realizar el pago.</p>
      <div className="productos-lista">
        {carrito.length > 0 ? (
          carrito.map((producto, index) => (
            <div key={index} className="producto-item">
              <h3>{producto.nombre}</h3>
              <p>Precio: ${producto.precio}</p>
              <p>Cantidad: {producto.cantidad}</p>
            </div>
          ))
        ) : (
          <p>No hay productos en el carrito.</p>
        )}
      </div>
      <h3>
        Total: ${total} CLP (~${totalUSD} USD)
      </h3>
      {carrito.length > 0 && (
        <PayPalScriptProvider
          options={{
            "client-id":
              "AYFWNJ7Hyl8bJRygox7jOy-GIIFdeI2n4DE0HpJHoTzUYOuptXwryPgjnd2RLiPaGAM_Xr52N1jNJ1aK",
          }}
        >
          <PayPalButtons
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: totalUSD.toString(), // Usar el total en USD para la transacción
                    },
                  },
                ],
              });
            }}
            onApprove={handleApprove}
            onError={(err) => {
              console.error("Error al procesar el pago: ", err);
            }}
          />
        </PayPalScriptProvider>
      )}
      {contador !== null && (
        <div className="redireccion-mensaje">
          <p>
            Compra realizada con éxito. Serás redirigido al inicio en {contador}{" "}
            segundos...
          </p>
        </div>
      )}

      {/* HTML para la boleta que será convertida a PDF */}
      <div id="boleta-pdf" style={{ display: "none" }}>
        <h2>Detalles de la Boleta</h2>
        <p>
          <strong>Cliente:</strong> {user ? user.displayName : "Cargando..."}
        </p>
        <p>
          <strong>Fecha:</strong> {new Date().toLocaleString()}
        </p>
        <p>
          <strong>Total:</strong> ${total} CLP (~${totalUSD} USD)
        </p>
        <h3>Productos:</h3>
        <ul>
          {carrito.map((producto, index) => (
            <li key={index}>
              <p>
                <strong>Nombre:</strong> {producto.nombre}
              </p>
              <p>
                <strong>Código/UID:</strong> {producto.id}
              </p>
              <p>
                <strong>Precio:</strong> ${producto.precio}
              </p>
              <p>
                <strong>Cantidad:</strong> {producto.cantidad}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PortalPago;
