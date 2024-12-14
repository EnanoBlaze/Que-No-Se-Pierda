// src/context/CarritoContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, setDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const CarritoContext = createContext();

export const useCarrito = () => useContext(CarritoContext);

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    let unsubscribe;
    if (user) {
      const carritoRef = collection(db, 'usuarios', user.uid, 'carrito');

      unsubscribe = onSnapshot(carritoRef, (snapshot) => {
        const carritoActualizado = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCarrito(carritoActualizado);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const saveCarrito = async (nuevoCarrito) => {
    if (!user) return;
    try {
      const carritoRef = collection(db, 'usuarios', user.uid, 'carrito');

      const carritoSnapshot = await getDocs(carritoRef);
      await Promise.all(
        carritoSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      );

      await Promise.all(
        nuevoCarrito.map(async (producto) => {
          const productoRef = doc(carritoRef, producto.id);
          await setDoc(productoRef, producto);
        })
      );
    } catch (error) {
      console.error('Error al guardar el carrito:', error);
    }
  };

  const agregarProducto = (producto) => {
    const carritoExistente = [...carrito];
    const index = carritoExistente.findIndex((item) => item.id === producto.id);

    if (index >= 0) {
      carritoExistente[index].cantidad += 1;
    } else {
      const discountRate = 0.20; // Aplicamos un descuento del 20%
      const precioConDescuento = producto.precio * (1 - discountRate);

      carritoExistente.push({ ...producto, precio: precioConDescuento.toFixed(2), cantidad: 1 });
    }

    setCarrito(carritoExistente);
    saveCarrito(carritoExistente);
  };

  const eliminarDelCarrito = (id) => {
    const carritoActualizado = carrito.filter((item) => item.id !== id);
    setCarrito(carritoActualizado);
    saveCarrito(carritoActualizado);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    saveCarrito([]);
  };

  return (
    <CarritoContext.Provider value={{ carrito, agregarProducto, eliminarDelCarrito, vaciarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
};
