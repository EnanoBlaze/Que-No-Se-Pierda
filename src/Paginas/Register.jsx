// src/Paginas/Register.js
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState('cliente');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Verificar que la contraseña cumpla con los requisitos
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula y un carácter especial");
      return;
    }

    try {
      // Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar que `userType` esté correctamente definido
      if (!userType) {
        setError("Por favor, selecciona un tipo de usuario");
        return;
      }

      // Guardar la información del usuario en Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: user.email,
        phoneNumber: phoneNumber || null, // Guardamos null si no se ingresa el número
        userType: userType,
        createdAt: new Date()
      });

      console.log("Usuario registrado y datos guardados en Firestore:", user);

      // Redirigir al usuario a la página de Login
      navigate('/login'); 
    } catch (error) {
      setError("Error al registrar el usuario: " + error.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Registro de Usuario</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleRegister} className="register-form">
        <div>
          <label>Nombre de Usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu nombre de usuario"
            required
          />
        </div>
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
        <div>
          <label>Repetir Contraseña:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu contraseña"
            required
          />
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
        <div>
          <label>Tipo de Usuario:</label>
          <select value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="cliente">Cliente</option>
            <option value="vendedor">Vendedor</option>
          </select>
        </div>
        <button type="submit" className="submit-button">Registrarse</button>
      </form>
    </div>
  );
}

export default Register;
