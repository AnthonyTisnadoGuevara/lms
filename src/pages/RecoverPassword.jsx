import { useState } from "react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRecover = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Revisa tu correo para continuar.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h2>Recuperar contraseña</h2>
        <p className="auth-subtitle">Te enviaremos un enlace para restablecerla.</p>

        <form onSubmit={handleRecover} className="auth-form">
          <input
            type="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>

          {message && <p className="auth-footer" style={{ marginTop: 10 }}>{message}</p>}
        </form>

        <p className="auth-footer">
          ¿Recordaste tu contraseña? <Link to="/">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
