// src/Paginas/Home.js
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import "./Home.css";
import { useCarrito } from "../context/CarritoContext";

function Home() {
  const [productosPorVendedor, setProductosPorVendedor] = useState({});
  const { carrito, agregarProducto } = useCarrito();
  const [userRole, setUserRole] = useState("");
  const [supermercadoActual, setSupermercadoActual] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().userType);
          }
        } catch (error) {
          console.error("Error obteniendo el rol del usuario:", error);
        }
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const productsArray = querySnapshot.docs.map((doc) => {
          const productData = doc.data();
          const discountRate = 0.2; // 20% de descuento
          const discountPrice = productData.precio * (1 - discountRate);

          return {
            id: doc.id,
            ...productData,
            precioConDescuento: discountPrice.toFixed(2),
          };
        });

        // Agrupar productos por vendedor
        const productosAgrupados = {};
        for (let product of productsArray) {
          const vendedorId = product.vendedorId;

          if (!productosAgrupados[vendedorId]) {
            const vendedorDoc = await getDoc(doc(db, "users", vendedorId));
            productosAgrupados[vendedorId] = {
              vendedorNombre: vendedorDoc.exists()
                ? vendedorDoc.data().username
                : "Vendedor desconocido",
              productos: [],
            };
          }

          productosAgrupados[vendedorId].productos.push(product);
        }

        setProductosPorVendedor(productosAgrupados);
      } catch (error) {
        console.error("Error obteniendo productos:", error);
      }
    };

    fetchProductos();
  }, []);

  const handleAgregarProducto = (producto) => {
    if (
      carrito.length > 0 &&
      supermercadoActual &&
      supermercadoActual !== producto.vendedorId
    ) {
      alert("Solo puedes agregar productos del mismo supermercado al carrito.");
      return;
    }

    if (carrito.length === 0) {
      setSupermercadoActual(producto.vendedorId);
    }

    agregarProducto(producto);
  };

  return (
    <div className="home-container">
      {Object.keys(productosPorVendedor).length > 0 ? (
        <div className="productos-scroll-container">
          {Object.keys(productosPorVendedor).map((vendedorId) => {
            const vendedor = productosPorVendedor[vendedorId];
            return (
              <div key={vendedorId} className="vendedor-section">
                <h3>{vendedor.vendedorNombre}</h3>
                <div className="productos-grid">
                  {vendedor.productos.map((product) => (
                    <div key={product.id} className="producto-card">
                      <img
                        src={product.imagen}
                        alt={product.nombre}
                        className="product-image"
                      />
                      <h3>{product.nombre}</h3>
                      <p className="precio-original">
                        Precio Original: ${product.precio}
                      </p>
                      <p className="precio-descuento">
                        Precio con Descuento: ${product.precioConDescuento}
                      </p>
                      <p>Cantidad disponible: {product.cantidad}</p>
                      <p
                        className="fecha-vencimiento"
                        style={{ color: "green" }}
                      >
                        Fecha de Vencimiento: {product.fechaVencimiento}
                      </p>
                      {product.cantidad === 0 ? (
                        <div className="agotado-banner">AGOTADO</div>
                      ) : (
                        <button
                          className="add-to-cart-button"
                          onClick={() => handleAgregarProducto(product)}
                        >
                          Agregar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No hay productos disponibles</p>
      )}
    </div>
  );
}

export default Home;
