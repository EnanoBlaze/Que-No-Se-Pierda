// src/Paginas/PerfilV.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import './PerfilV.css';
import Modal from 'react-modal';
import { FiMoreVertical } from 'react-icons/fi';

Modal.setAppElement('#root'); // Esto es necesario para accesibilidad

const PerfilV = () => {
  const [user] = useAuthState(auth);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ nombre: '', cantidad: '', precio: '' });

  useEffect(() => {
    if (user) {
      fetchProductos();
    }
  }, [user]);

  const fetchProductos = async () => {
    if (!user) return;

    try {
      const productosRef = collection(db, 'productos');
      const q = query(productosRef, where('vendedorId', '==', user.uid));
      const productosSnapshot = await getDocs(q);
      const productosData = productosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(productosData);
    } catch (error) {
      console.error('Error al obtener los productos del vendedor:', error);
    }
  };

  const abrirEditarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setEditData({ nombre: producto.nombre, cantidad: producto.cantidad, precio: producto.precio });
    setEditModalOpen(true);
  };

  const cerrarEditarProducto = () => {
    setEditModalOpen(false);
    setProductoSeleccionado(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const guardarCambiosProducto = async () => {
    if (!productoSeleccionado) return;

    try {
      const productoRef = doc(db, 'productos', productoSeleccionado.id);
      await updateDoc(productoRef, {
        nombre: editData.nombre,
        cantidad: editData.cantidad,
        precio: editData.precio,
      });
      cerrarEditarProducto();
      fetchProductos(); // Actualizar la lista de productos después de guardar los cambios
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
    }
  };

  return (
    <div className="perfil-container">
      <h2>Perfil de Usuario</h2>
      <p>{user ? user.displayName : 'Cargando...'}</p>

      <div className="productos-container">
        <h3 className="productos-titulo">Productos Subidos</h3>
        {productos.length > 0 ? (
          <ul className="productos-lista">
            {productos.map((producto) => (
              <li key={producto.id} className="producto-item-horizontal">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="producto-imagen-horizontal"
                />
                <div className="producto-info-horizontal">
                  <p><strong>Nombre:</strong> {producto.nombre}</p>
                  <p><strong>ID del Producto:</strong> {producto.id}</p>
                  <p><strong>Cantidad Disponible:</strong> {producto.cantidad}</p>
                  <p><strong>Precio:</strong> ${producto.precio}</p>
                </div>
                <button className="editar-producto-boton" onClick={() => abrirEditarProducto(producto)}>
                  <FiMoreVertical />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay productos subidos.</p>
        )}
      </div>

      {/* Modal para editar producto */}
      <Modal
        isOpen={editModalOpen}
        onRequestClose={cerrarEditarProducto}
        contentLabel="Editar Producto"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Editar Producto</h2>
        <form className="editar-form">
          <div className="form-group">
            <label>Nombre: </label>
            <input
              type="text"
              name="nombre"
              value={editData.nombre}
              onChange={handleEditChange}
              className="input-full-width"
            />
          </div>
          <div className="form-group">
            <label>Cantidad Disponible: </label>
            <input
              type="number"
              name="cantidad"
              value={editData.cantidad}
              onChange={handleEditChange}
              className="input-full-width"
            />
          </div>
          <div className="form-group">
            <label>Precio: </label>
            <input
              type="number"
              name="precio"
              value={editData.precio}
              onChange={handleEditChange}
              className="input-full-width"
            />
          </div>
        </form>
        <div className="modal-buttons">
          <button onClick={guardarCambiosProducto} className="modal-save-button">
            Guardar Cambios
          </button>
          <button onClick={cerrarEditarProducto} className="modal-close-button">
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PerfilV;
