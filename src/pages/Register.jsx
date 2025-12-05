import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      alert("Error al registrarse: " + error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email,
        role: "estudiante",
      });
    }

    alert("Cuenta creada. Revisa tu correo para confirmar.");
    setLoading(false);
    navigate("/");
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h2>Crear Cuenta</h2>
        <p className="auth-subtitle">Únete y empieza a usar el LMS.</p>

        <form className="auth-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Registrarse"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes una cuenta? <Link to="/">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
