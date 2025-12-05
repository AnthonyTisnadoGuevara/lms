import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Contraseña actualizada correctamente.");
      setTimeout(() => navigate("/"), 1500);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2 className="auth-title">Nueva contraseña</h2>

        <form onSubmit={handleReset} className="auth-form">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />

          <button className="auth-btn">Actualizar Contraseña</button>

          {message && <p style={{ marginTop: 10 }}>{message}</p>}
        </form>
      </div>
    </div>
  );
}
