import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Layout from "../components/Layout";
import "./roles.css";

export default function ManageRoles() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  // ===============================
  // Cargar usuarios desde profiles
  // ===============================
  const loadUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      alert("Error cargando usuarios: " + error.message);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  };

  // ===============================
  // Filtro por búsqueda
  // ===============================
  const filteredUsers = users.filter((u) => {
    const text = `${u.full_name ?? ""} ${u.email}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // ===============================
  // Cambiar rol (Profiles + Auth)
  // ===============================
  const handleRoleChange = async (userId, newRole) => {
    try {
      setSavingUserId(userId);

      // 1️⃣ Actualizar role en tabla profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (profileError) {
        console.error(profileError);
        alert("Error actualizando perfil: " + profileError.message);
        return;
      }

      // 2️⃣ Actualizar metadata en auth.users (solo admin API)
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: { role: newRole },
        }
      );

      if (authError) {
        console.error(authError);
        alert("Error actualizando auth.user: " + authError.message);
        return;
      }

      // 3️⃣ Refrescar UI sin recargar
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      alert("Rol actualizado correctamente ✔️");
    } finally {
      setSavingUserId(null);
    }
  };

  // ===============================
  // Render
  // ===============================
  return (
    <Layout>
      <div className="roles-page">
        <h1 className="roles-title">Gestionar Roles</h1>

        <div className="roles-search-wrapper">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="roles-search-input"
          />
        </div>

        <div className="roles-card">
          <table className="roles-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol Actual</th>
                <th>Cambiar Rol</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                    Cargando usuarios...
                  </td>
                </tr>
              )}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}

              {!loading &&
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name || "(Sin nombre)"}</td>
                    <td>{user.email}</td>

                    <td>
                      <span className={`role-pill role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <select
                        value={user.role}
                        disabled={savingUserId === user.id}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="roles-select"
                      >
                        <option value="estudiante">Estudiante</option>
                        <option value="docente">Docente</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
