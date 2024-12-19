// src/components/Navbar.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Consultar Firestore para obtener el tipo de usuario
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserType(userDoc.data().userType);
        }
      } else {
        setUser(null);
        setUserType(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Sesión cerrada con éxito");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error al cerrar sesión: ", error);
      });
  };

  return (
    <nav className="navbar-horizontal">
      <div className="navbar-logo">
        <Link to="/">QUE NO SE PIERDA</Link>
      </div>
      <ul className="navbar-links">
        {userType === "vendedor" && (
          <li>
            <Link to="/subir-producto">Subir Productos</Link>
          </li>
        )}
        <li>
          <Link
            to={
              user
                ? userType === "vendedor"
                  ? "/perfil-vendedor"
                  : "/perfil-cliente"
                : "/login"
            }
          >
            Perfil
          </Link>
        </li>
        <li>
          <Link to="/contacto">Contáctanos</Link>
        </li>
        {user ? (
          <li>
            <button className="navbar-logout" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </li>
        ) : (
          <li>
            <Link to="/login">Iniciar Sesión</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
