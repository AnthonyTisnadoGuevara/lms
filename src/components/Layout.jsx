import { NavLink, useNavigate } from "react-router-dom";
import "./layout.css";

export default function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="layout-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="sidebar-title">LMS Admin</h2>

        <nav className="sidebar-menu">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/create-course"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Crear curso
          </NavLink>

          <NavLink
            to="/admin/assign-teacher"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Asignar docente
          </NavLink>

          <NavLink
            to="/admin/assign-students"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Asignar estudiantes
          </NavLink>

          <NavLink
            to="/admin/roles"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Gestionar roles
          </NavLink>
        </nav>

        {/* LOGOUT */}
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">{children}</main>
    </div>
  );
}
