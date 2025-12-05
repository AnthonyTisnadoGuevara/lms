import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import "./teacher-course.css";

export default function TeacherStudents() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("name, code")
      .eq("id", courseId)
      .single();

    if (!error) setCourse(data);
  };

  const fetchStudents = async () => {
    // Intenta en course_students
    const { data, error } = await supabase
      .from("course_students")
      .select(
        `
        student_id,
        profiles (full_name, first_name, last_name, email)
      `
      )
      .eq("course_id", courseId);

    if (!error && data && data.length > 0) {
      setStudents(data);
      return;
    }

    // Fallback a curso_estudiantes (si existe)
    const { data: altData, error: altError } = await supabase
      .from("curso_estudiantes")
      .select(
        `
        student_id,
        profiles (full_name, first_name, last_name, email)
      `
      )
      .eq("course_id", courseId);

    if (altError) {
      console.error("No se pudieron cargar estudiantes:", altError);
      setStudents([]);
      return;
    }

    setStudents(altData || []);
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchCourse(), fetchStudents()]);
      setLoading(false);
    };
    load();
  }, [courseId]);

  return (
    <div className="teacher-course-page">
      <header className="course-header">
        <div>
          <p className="eyebrow">Docente</p>
          <h1>Estudiantes del curso</h1>
          <p className="subtitle">
            {course
              ? `${course.name} • Código: ${course.code ?? "—"}`
              : "Revisando estudiantes inscritos"}
          </p>
        </div>

        <div className="header-actions">
          <button className="btn ghost" onClick={() => navigate("/teacher")}>
            Volver al panel
          </button>
          <div className="nav-chips">
            <button
              className="chip ghost"
              onClick={() => navigate(`/teacher/sessions/${courseId}`)}
            >
              Sesiones
            </button>
            <button
              className="chip ghost"
              onClick={() => navigate(`/teacher/homeworks/${courseId}`)}
            >
              Tareas
            </button>
            <button className="chip active">Estudiantes</button>
          </div>
        </div>
      </header>

      <section className="card-panel">
        <div className="section-heading">
          <h2>Estudiantes inscritos</h2>
          <span className="badge">{students.length}</span>
        </div>

        {loading ? (
          <p className="muted">Cargando...</p>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <p>Aún no hay estudiantes inscritos.</p>
          </div>
        ) : (
          <div className="list-grid">
            {students.map((s) => (
              <article key={s.student_id} className="list-card">
                <p className="item-title">
                  {s.profiles?.full_name ||
                    `${s.profiles?.first_name || ""} ${
                      s.profiles?.last_name || ""
                    }`.trim()}
                </p>
                <p className="muted">{s.profiles?.email}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
