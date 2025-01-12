// src/Paginas/Home.js
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const fechaActual = new Date();
        const productosFiltrados = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const fechaVencimiento = new Date(data.fechaVencimiento);
            const descuento = data.precio * 0.2; // 20% de descuento
            const precioConDescuento = data.precio - descuento;

            return {
              id: doc.id,
              ...data,
              precioConDescuento: precioConDescuento.toFixed(2), // Mostrar con 2 decimales
              fechaVencimiento,
            };
          })
          .filter((producto) => producto.fechaVencimiento >= fechaActual) // Filtrar productos no vencidos
          .slice(0, 3); // Mostrar máximo 3 productos

        setProductos(productosFiltrados);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
      }
    };

    fetchProductos();
  }, []);

  const handleRedirect = () => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login"); // Redirigir al login si no está autenticado
    } else {
      navigate("/tienda"); // Redirigir a la tienda si está autenticado
    }
  };
  
  return (
    <div className="home-container">
      {/* Sección Nuestra Misión */}
      <section className="about-section">
        <h2 className="section-title">Nuestra Misión</h2>
        <div className="about-content">
          <p>
            En ¡Que No Se Pierda! trabajamos para reducir el desperdicio de alimentos
            conectando negocios locales con consumidores conscientes. Ofrecemos:
          </p>
          <ul>
            <li>Productos cerca de su fecha de caducidad a precios reducidos</li>
            <li>Apoyo a comercios locales</li>
            <li>Impacto positivo en el medio ambiente</li>
            <li>Ahorro para los consumidores</li>
            <li>Plataforma fácil de usar</li>
          </ul>
        </div>
      </section>

      {/* Sección Productos Destacados */}
      <section className="products-section">
        <h2 className="section-title">Vista Previa de Productos</h2>
        <div className="productos-grid">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="producto-card"
              onClick={handleRedirect}
            >
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="product-image"
              />
              <h3>{producto.nombre}</h3>
              <p className="precio-original">
                Precio Original: ${producto.precio}
              </p>
              <p className="precio-descuento">
                Precio con Descuento: ${producto.precioConDescuento}
              </p>
              <p>Cantidad disponible: {producto.cantidad}</p>
              <p
                className="fecha-vencimiento"
                style={{ color: "green" }}
              >
                Fecha de Vencimiento: {producto.fechaVencimiento.toISOString().split("T")[0]}
              </p>
            </div>
          ))}
        </div>
        <button className="cta-button" onClick={handleRedirect}>
          Ver Ofertas
        </button>
      </section>

      {/* Sección Cómo Funciona */}
      <section className="features-section">
        <h2 className="section-title">¿Cómo Funciona?</h2>
        <div className="features-grid">
          <article className="feature-card">
            <h3>Negocios Publican</h3>
            <p>Los comercios suben sus productos con descuento antes de que caduquen.</p>
          </article>
          <article className="feature-card">
            <h3>Tú Compras</h3>
            <p>Encuentras ofertas increíbles en productos de calidad.</p>
          </article>
          <article className="feature-card">
            <h3>Todos Ganamos</h3>
            <p>Reduces el desperdicio mientras ahorras dinero.</p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default Home;
