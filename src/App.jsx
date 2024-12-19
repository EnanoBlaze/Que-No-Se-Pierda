// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db, auth } from "./firebase";
import Home from "./Paginas/Home";
import Tienda from "./Paginas/Tienda";
import PerfilV from "./Paginas/PerfilV";
import PerfilC from "./Paginas/PerfilC";
import Login from "./Paginas/Login";
import Register from "./Paginas/Register";
import SubirProducto from "./Paginas/SubirProducto";
import CarritoButton from "./components/CarritoButton";
import PortalPago from "./Paginas/PortalPago";
import { Layout } from "./layout";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const noCarritoRoutes = ["/login", "/register", "/portal-pago"]; // Rutas sin carrito
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole === "cliente") {
      navigate("/perfil-vendedor");
    } else if (userRole === "vendedor") {
      navigate("/perfil-cliente");
    }
  }, [userRole, navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/perfil-vendedor" element={<PerfilV />} />
        <Route path="/perfil-cliente" element={<PerfilC />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/subir-producto" element={<SubirProducto />} />
        <Route path="/portal-pago" element={<PortalPago />} />
      </Routes>
      {!noCarritoRoutes.includes(location.pathname) && <CarritoButton />}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <AppContent />
      </Layout>
    </Router>
  );
}
export default App;
