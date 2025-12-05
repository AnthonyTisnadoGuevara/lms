import { Navigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile && allowedRoles.includes(profile.role)) {
        setAllowed(true);
      }

      setLoading(false);
    }

    checkRole();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return allowed ? children : <Navigate to="/" />;
}
