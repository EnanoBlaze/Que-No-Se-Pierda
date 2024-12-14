// src/Paginas/SubirProducto.js
import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './SubirProducto.css';

const SubirProducto = () => {
  const [user] = useAuthState(auth);
  const [nombreProducto, setNombreProducto] = useState('');
  const [precioProducto, setPrecioProducto] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [imagenProducto, setImagenProducto] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false); // Estado para manejar la carga

  // Obtener la fecha actual en formato 'yyyy-mm-dd' para establecer el valor mínimo
  const obtenerFechaActual = () => {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${anio}-${mes}-${dia}`;
  };

  const handleProductUpload = (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setCargando(true); // Iniciar el estado de carga

    if (!imagenProducto) {
      setError('Por favor, sube una imagen del producto.');
      setCargando(false); // Detener el estado de carga
      return;
    }

    if (!user) {
      setError('No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.');
      setCargando(false); // Detener el estado de carga
      return;
    }

    const storage = getStorage();
    const storageRef = ref(storage, `productos/${imagenProducto.name}`); // Guardar en la carpeta "productos"
    const uploadTask = uploadBytesResumable(storageRef, imagenProducto);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Puedes manejar el progreso si lo deseas
      },
      (error) => {
        setError('Error al subir la imagen.');
        setCargando(false); // Detener el estado de carga
        console.error('Error al subir la imagen:', error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          await addDoc(collection(db, 'productos'), {
            nombre: nombreProducto,
            precio: parseFloat(precioProducto),
            cantidad: parseInt(cantidadProducto),
            fechaVencimiento: fechaVencimiento,
            imagen: downloadURL,
            vendedorId: user.uid, // Asociamos el producto al vendedor
          });
          setExito('Producto agregado con éxito');
          setCargando(false); // Detener el estado de carga
          // Limpiar campos después de un éxito
          setNombreProducto('');
          setPrecioProducto('');
          setCantidadProducto('');
          setFechaVencimiento('');
          setImagenProducto(null);
        } catch (error) {
          setError('Error al agregar el producto.');
          setCargando(false); // Detener el estado de carga
          console.error('Error al agregar el producto:', error);
        }
      }
    );
  };

  return (
    <div className="subir-producto-container">
      <h2>Subir Producto</h2>
      {error && <p className="error-message">{error}</p>}
      {exito && <p className="success-message">{exito}</p>}
      {cargando && <div className="loading-overlay">
        <div className="loading-message">Subiendo producto, por favor espera...</div>
      </div>}
      <form onSubmit={handleProductUpload} className="subir-producto-form">
        <div className="form-group">
          <label>Nombre del Producto:</label>
          <input
            type="text"
            value={nombreProducto}
            onChange={(e) => setNombreProducto(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Precio:</label>
          <input
            type="number"
            value={precioProducto}
            onChange={(e) => setPrecioProducto(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Cantidad:</label>
          <input
            type="number"
            value={cantidadProducto}
            onChange={(e) => setCantidadProducto(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Fecha de Vencimiento:</label>
          <input
            type="date"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            min={obtenerFechaActual()} // Configuramos el valor mínimo con la fecha actual
            required
          />
        </div>
        <div className="form-group">
          <label>Imagen del Producto:</label>
          <input
            type="file"
            onChange={(e) => setImagenProducto(e.target.files[0])}
            required
          />
        </div>
        <button type="submit" className="submit-button" disabled={cargando}>Subir Producto</button>
      </form>
    </div>
  );
};

export default SubirProducto;
