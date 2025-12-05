import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./dashboard.css";

export default function DashboardStudent() {
  const [courses, setCourses] = useState([]);

  async function loadCourses() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    // Primer intento: course_students
    const { data: enrolled, error } = await supabase
      .from("course_students")
      .select("course_id")
      .eq("student_id", user.id);

    // Fallback: curso_estudiantes
    let courseIds = enrolled || [];
    if ((!enrolled || enrolled.length === 0) && error == null) {
      const { data: enrolledAlt, error: altError } = await supabase
        .from("curso_estudiantes")
        .select("course_id")
        .eq("student_id", user.id);
      if (altError) {
        console.error("No se pudieron cargar cursos del estudiante:", altError);
      } else {
        courseIds = enrolledAlt || [];
      }
    }

    const ids = courseIds.map((c) => c.course_id).filter(Boolean);
    if (ids.length === 0) {
      setCourses([]);
      return;
    }

    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id, name, description")
      .in("id", ids);

    if (courseError) {
      console.error("No se pudieron cargar los cursos:", courseError);
      return;
    }

    setCourses(courseData || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">LMS Estudiante</h2>
        <nav className="menu">
          <span className="menu-item">Mis cursos</span>
        </nav>
        <button className="logout-btn" onClick={logout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="main">
        <h1 className="main-title">Panel del Estudiante</h1>
        <h3 className="section-title">Cursos inscritos</h3>

        {courses.length === 0 ? (
          <p className="empty-text">No estás inscrito en ningún curso.</p>
        ) : (
          <div className="courses-grid">
            {courses.map((c) => (
              <div className="course-card" key={c.id}>
                <h2>{c.name}</h2>
                <p>{c.description}</p>
                <a
                  className="btn-primary"
                  href={`/student/sessions/${c.id}`}
                >
                  Ingresar al curso
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
