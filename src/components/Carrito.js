// src/components/Carrito.js
import React from 'react';
import '../components/Carrito.css';
import { useCarrito } from '../context/CarritoContext';
import { useNavigate } from 'react-router-dom';

const Carrito = ({ cerrarCarrito }) => {
  const { carrito, eliminarDelCarrito } = useCarrito();
  const navigate = useNavigate();

  const handleIrAPagar = () => {
    navigate('/portal-pago');
  };

  return (
    <div className="carrito-container">
      <div className="carrito-header">
        Carrito de Compras
        <button className="cerrar-carrito" onClick={cerrarCarrito}>X</button>
      </div>
      {carrito.length === 0 ? (
        <div className="carrito-vacio">No hay productos en el carrito</div>
      ) : (
        carrito.map((producto, index) => (
          <div key={index} className="carrito-item">
            <div>
              <p>{producto.nombre}</p>
              <p>Precio: ${producto.precio}</p>
              <p>Cantidad: {producto.cantidad}</p>
            </div>
            <button
              className="eliminar-btn"
              onClick={() => eliminarDelCarrito(producto.id)}
            >
              Eliminar
            </button>
          </div>
        ))
      )}
      {carrito.length > 0 && (
        <div className="carrito-total">
          <button className="boton-ir-pagar" onClick={handleIrAPagar}>Ir a Pagar</button>
        </div>
      )}
    </div>
  );
};

export default Carrito;
// src/components/Carrito.js
import React from 'react';
import '../components/Carrito.css';
import { useCarrito } from '../context/CarritoContext';
import { useNavigate } from 'react-router-dom';

const Carrito = ({ cerrarCarrito }) => {
  const { carrito, eliminarDelCarrito } = useCarrito();
  const navigate = useNavigate();

  const handleIrAPagar = () => {
    navigate('/portal-pago');
  };

  return (
    <div className="carrito-container">
      <div className="carrito-header">
        Carrito de Compras
        <button className="cerrar-carrito" onClick={cerrarCarrito}>X</button>
      </div>
      {carrito.length === 0 ? (
        <div className="carrito-vacio">No hay productos en el carrito</div>
      ) : (
        carrito.map((producto, index) => (
          <div key={index} className="carrito-item">
            <div>
              <p>{producto.nombre}</p>
              <p>Precio: ${producto.precio}</p>
              <p>Cantidad: {producto.cantidad}</p>
            </div>
            <button
              className="eliminar-btn"
              onClick={() => eliminarDelCarrito(producto.id)}
            >
              Eliminar
            </button>
          </div>
        ))
      )}
      {carrito.length > 0 && (
        <div className="carrito-total">
          <button className="boton-ir-pagar" onClick={handleIrAPagar}>Ir a Pagar</button>
        </div>
      )}
    </div>
  );
};

export default Carrito;
