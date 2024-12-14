// src/Paginas/PerfilC.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs } from 'firebase/firestore';
import './PerfilC.css';
import Modal from 'react-modal';
import html2pdf from 'html2pdf.js';

Modal.setAppElement('#root'); // Esto es necesario para accesibilidad

const PerfilC = () => {
  const [user] = useAuthState(auth);
  const [ventas, setVentas] = useState([]);
  const [boletaSeleccionada, setBoletaSeleccionada] = useState(null);

  useEffect(() => {
    if (user) {
      fetchVentas();
    }
  }, [user]);

  const fetchVentas = async () => {
    if (!user) return;

    try {
      const ventasRef = collection(db, 'usuarios', user.uid, 'ventas');
      const ventasSnapshot = await getDocs(ventasRef);
      const ventasData = ventasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVentas(ventasData);
    } catch (error) {
      console.error('Error al obtener las ventas:', error);
    }
  };

  const abrirModalBoleta = (boleta) => {
    setBoletaSeleccionada(boleta);
  };

  const cerrarModalBoleta = () => {
    setBoletaSeleccionada(null);
  };

  const descargarBoletaPDF = () => {
    if (!boletaSeleccionada) return;

    const element = document.getElementById('boleta-pdf');
    html2pdf()
      .from(element)
      .set({
        margin: 1,
        filename: `boleta_${boletaSeleccionada.fecha ? boletaSeleccionada.fecha.toDate().toLocaleString() : 'sin_fecha'}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait' }
      })
      .save();
  };

  return (
    <div className="perfil-container">
      <h2>Perfil de Usuario</h2>
      <p>Nombre de Usuario: {user ? user.displayName : 'Cargando...'}</p>

      <div className="boletas-container">
        <h3 className="boletas-titulo">Boletas</h3>
        {ventas.length > 0 ? (
          <ul className="boletas-lista">
            {ventas.map((venta) => (
              <li key={venta.id} onClick={() => abrirModalBoleta(venta)}>
                <p>
                  Fecha: {venta.fecha ? venta.fecha.toDate().toLocaleString() : 'Fecha no disponible'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay boletas registradas.</p>
        )}
      </div>

      {/* Modal para mostrar la información completa de la boleta */}
      <Modal
        isOpen={boletaSeleccionada !== null}
        onRequestClose={cerrarModalBoleta}
        contentLabel="Detalles de la Boleta"
        className="modal"
        overlayClassName="overlay"
      >
        {boletaSeleccionada && (
          <div id="boleta-pdf">
            <h2>Detalles de la Boleta</h2>
            <p>
              <strong>Fecha:</strong>{' '}
              {boletaSeleccionada.fecha ? boletaSeleccionada.fecha.toDate().toLocaleString() : 'Fecha no disponible'}
            </p>
            <p>
              <strong>Total:</strong> ${boletaSeleccionada.total}
            </p>
            <h3>Productos:</h3>
            <ul>
              {boletaSeleccionada.productos.map((producto, index) => (
                <li key={index}>
                  <p>
                    <strong>Nombre:</strong> {producto.nombre}
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
        )}
        <button onClick={cerrarModalBoleta} className="modal-close-button">
          Cerrar
        </button>
        {boletaSeleccionada && (
          <button onClick={descargarBoletaPDF} className="modal-download-button">
            Descargar PDF
          </button>
        )}
      </Modal>
    </div>
  );
};

export default PerfilC;
