import { useState } from "react";
import { supabase } from "../supabase";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ------------------------------
    // LOGIN CORRECTO CON SUPABASE V2
    // ------------------------------
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      alert("Error al iniciar sesión: " + error.message);
      return;
    }

    const user = data?.user;
    if (!user) {
      setLoading(false);
      alert("No se pudo obtener el usuario.");
      return;
    }

    // ------------------------------
    // OBTENER PERFIL DESDE "profiles"
    // ------------------------------
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setLoading(false);
      alert("Error cargando el perfil: " + profileError.message);
      return;
    }

    if (!profile) {
      setLoading(false);
      alert("Tu perfil no existe en la base de datos.");
      return;
    }

    // ------------------------------
    // REDIRECCIÓN POR ROL
    // ------------------------------
    switch (profile.role) {
      case "admin":
        navigate("/admin");
        break;

      case "docente":
        navigate("/teacher");
        break;

      default:
        navigate("/student");
        break;
    }

    setLoading(false);
  };

  return (
    <div style={styles.fullScreen}>
      <div style={styles.card}>
        <h2 style={styles.title}>Iniciar Sesión</h2>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/register" style={styles.link}>Crear una cuenta</Link>
          <Link to="/recover" style={styles.link}>¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  fullScreen: {
    width: "100vw",
    height: "100vh",
    backgroundColor: "#141a2b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: "320px",
    padding: "30px",
    borderRadius: "10px",
    backgroundColor: "#1e2639",
    boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
    color: "white",
    textAlign: "center",
  },

  title: {
    fontSize: "20px",
    marginBottom: "20px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #333",
    backgroundColor: "#2b3245",
    color: "white",
  },

  button: {
    marginTop: "10px",
    padding: "12px",
    backgroundColor: "#6a5af9",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  links: {
    marginTop: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  link: {
    color: "#6a8dff",
    fontSize: "13px",
    cursor: "pointer",
  },
};
