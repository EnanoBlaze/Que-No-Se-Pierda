// src/components/CarritoButton.js
import React, { useState, useEffect } from 'react';
import { useCarrito } from '../context/CarritoContext';
import './CarritoButton.css';

const CarritoButton = () => {
  const [isCarritoVisible, setIsCarritoVisible] = useState(false);
  const { carrito, eliminarDelCarrito, agregarProducto, vaciarCarrito } = useCarrito();
  const [supermercadoActual, setSupermercadoActual] = useState(null);

  const toggleCarritoVisibility = () => {
    setIsCarritoVisible(!isCarritoVisible);
  };

  const totalItems = carrito.reduce((total, producto) => total + producto.cantidad, 0);

  useEffect(() => {
    if (carrito.length > 0) {
      setSupermercadoActual(carrito[0].supermercadoId);
    }
  }, [carrito]);

  const agregarProductoAlCarrito = (producto) => {
    if (supermercadoActual && producto.supermercadoId !== supermercadoActual) {
      alert('Solo puedes agregar productos del mismo supermercado al carrito.');
      return;
    }
    agregarProducto(producto);
  };

  return (
    <>
      <button className="carrito-button" onClick={toggleCarritoVisibility}>
        Carrito
        {totalItems > 0 && (
          <span className="carrito-count">{totalItems}</span>
        )}
      </button>
      {isCarritoVisible && (
        <div className="carrito-container">
          <div className="carrito-header">
            <span>Carrito de Compras</span>
            <button className="close-btn" onClick={toggleCarritoVisibility}>X</button>
          </div>
          {carrito.length === 0 ? (
            <div className="carrito-vacio">No hay productos en el carrito</div>
          ) : (
            <>
              {carrito.map((producto, index) => (
                <div key={index} className="carrito-item">
                  <img src={producto.imagen} alt={producto.nombre} className="carrito-item-imagen" />
                  <div className="carrito-item-info">
                    <p className="producto-nombre">{producto.nombre}</p>
                    <p className="producto-precio">Precio: ${producto.precioConDescuento}</p>
                    <p>Cantidad: {producto.cantidad}</p>
                  </div>
                  <button className="eliminar-btn" onClick={() => eliminarDelCarrito(producto.id)}>
                    Eliminar
                  </button>
                </div>
              ))}
              <div className="carrito-total">
                <p>Total: ${carrito.reduce((total, producto) => total + producto.precioConDescuento * producto.cantidad, 0).toFixed(2)}</p>
                <button className="boton-ir-pagar" onClick={() => window.location.href = '/portal-pago'}>Ir a Pagar</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default CarritoButton;
