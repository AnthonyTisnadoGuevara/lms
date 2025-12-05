import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./dashboard-docente.css";

export default function DashboardDocente() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadTeacherCourses();
  }, []);

  const loadTeacherCourses = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("teacher_id", user.id);

    if (error) {
      console.error("Error loading courses:", error);
      return;
    }

    setCourses(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="teacher-layout">
      <header className="teacher-header">
        <div>
          <p className="eyebrow">Docente</p>
          <h1>Panel del Docente</h1>
          <p className="subtitle">
            Bienvenido, aquí tienes tus cursos asignados.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn ghost" onClick={loadTeacherCourses}>
            Actualizar
          </button>
          <button className="btn danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="courses">
        <div className="section-heading">
          <h2>Mis cursos</h2>
          <span className="badge">{courses.length}</span>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state">
            <p>No tienes cursos asignados aún.</p>
            <small>Cuando el admin te asigne alguno, aparecerá aquí.</small>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <article key={course.id} className="course-card">
                <div className="course-header">
                  <div>
                    <p className="course-code">Código: {course.code ?? "—"}</p>
                    <h3>{course.name}</h3>
                  </div>
                </div>

                <div className="course-actions">
                  <button
                    className="chip"
                    onClick={() => navigate(`/teacher/sessions/${course.id}`)}
                  >
                    Sesiones
                  </button>
                  <button
                    className="chip"
                    onClick={() => navigate(`/teacher/homeworks/${course.id}`)}
                  >
                    Tareas
                  </button>
                  <button
                    className="chip"
                    onClick={() => navigate(`/teacher/students/${course.id}`)}
                  >
                    Estudiantes
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
