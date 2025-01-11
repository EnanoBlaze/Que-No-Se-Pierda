import React, { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Importar funciones de Firebase Storage
import { db, auth } from '../firebase'; // Base de datos Firestore y autenticación
import { collection, addDoc } from 'firebase/firestore'; // Función para agregar documentos a Firestore
import { useAuthState } from 'react-firebase-hooks/auth'; // Hook para obtener el estado de autenticación
import * as XLSX from 'xlsx'; // Biblioteca para manejar archivos Excel
import './SubirProducto.css'; // Archivo de estilos

const SubirProductoMasivo = () => {
  // Estado para manejar usuario autenticado
  const [user] = useAuthState(auth);

  // Estados para manejar el archivo Excel y mensajes de éxito/error
  const [archivoExcel, setArchivoExcel] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  // Función principal para procesar el archivo Excel
  const procesarExcel = async (e) => {
    e.preventDefault(); // Evitar recarga de página
    setError(''); // Limpiar errores previos
    setExito(''); // Limpiar mensajes de éxito previos
    setCargando(true); // Activar el estado de carga

    if (!archivoExcel) {
      setError('Por favor, sube un archivo Excel.'); // Validar que el archivo esté presente
      setCargando(false); // Desactivar el estado de carga
      return;
    }

    const reader = new FileReader(); // Crear un lector de archivos
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result); // Leer el archivo como un arreglo binario
        const workbook = XLSX.read(data, { type: 'array' }); // Leer el archivo como libro de Excel
        const sheetName = workbook.SheetNames[0]; // Obtener el nombre de la primera hoja
        const sheet = workbook.Sheets[sheetName]; // Obtener los datos de la primera hoja
        const productos = XLSX.utils.sheet_to_json(sheet); // Convertir los datos a formato JSON

        // Validar que el usuario esté autenticado
        if (!user) {
          setError('No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.');
          setCargando(false);
          return;
        }

        const storage = getStorage(); // Inicializar almacenamiento
        const productosCollection = collection(db, 'productos'); // Referencia a la colección "productos" en Firestore

        // Iterar sobre cada producto en el archivo Excel
        for (const producto of productos) {
          // Validar que cada producto tenga los campos necesarios
          if (!producto.nombre || !producto.precio || !producto.cantidad || !producto.fechaVencimiento) {
            setError('El archivo Excel contiene productos con campos incompletos.');
            setCargando(false);
            return;
          }

          // Subir imagen si está presente
          let imagenURL = '';
          if (producto.imagen) {
            const storageRef = ref(storage, `productos/${producto.imagen}`); // Crear referencia al archivo en Firebase Storage
            const uploadTask = await uploadBytes(storageRef, producto.imagen); // Subir la imagen
            imagenURL = await getDownloadURL(uploadTask.ref); // Obtener la URL de descarga
          }

          // Subir los datos del producto a Firestore
          await addDoc(productosCollection, {
            nombre: producto.nombre,
            precio: parseFloat(producto.precio), // Convertir el precio a número
            cantidad: parseInt(producto.cantidad), // Convertir la cantidad a entero
            fechaVencimiento: producto.fechaVencimiento, // Fecha de vencimiento como texto
            imagen: imagenURL || '', // URL de la imagen, si existe
            vendedorId: user.uid, // ID del usuario que sube el producto
          });
        }

        // Si todos los productos se agregan correctamente
        setExito('Productos agregados con éxito');
        setArchivoExcel(null); // Limpiar el archivo cargado
      } catch (error) {
        setError('Error al procesar el archivo Excel.'); // Manejar errores
        console.error('Error al procesar el archivo Excel:', error);
      } finally {
        setCargando(false); // Desactivar el estado de carga
      }
    };

    reader.readAsArrayBuffer(archivoExcel); // Leer el archivo como un arreglo binario
  };

  return (
    <div className="subir-producto-container">
      <h2>Subir Productos</h2>
      {error && <p className="error-message">{error}</p>} {/* Mostrar mensaje de error */}
      {exito && <p className="success-message">{exito}</p>} {/* Mostrar mensaje de éxito */}
      {cargando && (
        <div className="loading-overlay">
          <div className="loading-message">Procesando archivo, por favor espera...</div> {/* Mostrar mensaje de carga */}
        </div>
      )}
      <form onSubmit={procesarExcel} className="subir-producto-form">
        <div className="form-group">
          <label>Archivo Excel:</label>
          <input
            type="file"
            accept=".xlsx, .xls" // Aceptar solo archivos Excel
            onChange={(e) => setArchivoExcel(e.target.files[0])} // Manejar cambio de archivo
            required
          />
        </div>
        <button type="submit" className="submit-button" disabled={cargando}> {/* Botón para subir */}
          Subir Productos
        </button>
      </form>
    </div>
  );
};

export default SubirProductoMasivo;
