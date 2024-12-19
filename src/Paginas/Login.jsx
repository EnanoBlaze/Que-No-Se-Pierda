// src/Paginas/Login.js
import React, { useState } from "react";
import { auth, db, storage } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import googleLogo from "../assets/Google-Logo.png"; // Importa la imagen de Google
import "./Login.css";
import { Layout } from "../layout";

Modal.setAppElement("#root"); // Asegura que el modal se asocie correctamente con la raíz de la app

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false); // Estado para el modal
  const [userType, setUserType] = useState("cliente");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [googleUser, setGoogleUser] = useState(null); // Estado para el usuario de Google
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log("Usuario autenticado:", user);
      navigate("/"); // Redirige a Home después de iniciar sesión
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      setGoogleUser(user); // Guardamos el usuario de Google

      // Verificar si el usuario ya tiene un tipo de usuario registrado
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Si el usuario ya tiene un tipo registrado, lo redirigimos a Home
        if (userDoc.data().userType) {
          console.log(
            "Usuario ya tiene tipo registrado:",
            userDoc.data().userType,
          );
          navigate("/tienda");
        } else {
          // Si no tiene `userType`, mostramos el modal para completar
          console.log("Usuario no tiene tipo registrado, mostrar modal.");
          setModalIsOpen(true); // Abrimos el modal
        }
      } else {
        // Si el usuario no existe en Firestore, creamos el documento básico
        await setDoc(userDocRef, {
          username: user.displayName || "Usuario Google",
          email: user.email,
          phoneNumber: null,
          userType: null, // El usuario deberá seleccionar el tipo en el modal
          createdAt: new Date(),
        });
        console.log("Usuario nuevo creado en Firestore.");
        setModalIsOpen(true); // Mostramos el modal para completar el perfil
      }
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        setError(
          "El popup de inicio de sesión se cerró antes de completar el proceso.",
        );
      } else {
        setError(error.message);
      }
    }
  };

  const handleSaveUserType = async () => {
    if (!googleUser) {
      setError("No se pudo encontrar la información del usuario de Google.");
      return;
    }

    try {
      const userRef = doc(db, "users", googleUser.uid);
      await updateDoc(userRef, {
        userType: userType,
        phoneNumber: phoneNumber || null, // Si no se ingresa número, guardamos null
      });
      console.log("Datos de usuario actualizados:", { userType, phoneNumber });
      setModalIsOpen(false); // Cerramos el modal
      navigate("/tienda"); // Redirigimos a Home después de guardar
    } catch (error) {
      setError("Error al guardar los datos: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Inicio de Sesión</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin} className="login-form">
        <div>
          <label>Correo Electrónico:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo"
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Iniciar Sesión
        </button>
      </form>

      <div className="google-login">
        <button onClick={handleGoogleLogin} className="google-button">
          <img src={googleLogo} alt="Google login" className="google-logo" />{" "}
          {/* Solo imagen */}
        </button>
      </div>

      {/* Botón para redirigir al registro */}
      <div className="register-redirect">
        <p>
          ¿No tienes una cuenta?{" "}
          <button
            onClick={() => navigate("/register")}
            className="register-button"
          >
            Regístrate
          </button>
        </p>
      </div>

      {/* Modal para completar el tipo de usuario y teléfono */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Seleccionar Tipo de Usuario"
        className="Modal"
        overlayClassName="Overlay"
      >
        <h2>Datos Adicionales</h2>
        <div>
          <label>Tipo de Usuario:</label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="cliente">Cliente</option>
            <option value="vendedor">Vendedor</option>
          </select>
        </div>
        <div>
          <label>Número de Teléfono (opcional):</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Ingresa tu número de teléfono"
          />
        </div>
        <button onClick={handleSaveUserType} className="modal-save-button">
          Guardar
        </button>
      </Modal>
    </div>
  );
}

export default Login;
