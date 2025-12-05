import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import "./teacher-course.css";

export default function StudentGrades() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [course, setCourse] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    setUserId(data.user.id);
  }

  async function fetchCourse() {
    const { data, error } = await supabase
      .from("courses")
      .select("name, code")
      .eq("id", courseId)
      .single();

    if (!error) setCourse(data);
  }

  async function fetchGrades() {
    if (!userId) return;

    const { data, error } = await supabase
      .from("submissions")
      .select("id, score, feedback, submitted_at, homeworks!inner(id, title, start_date, end_date, course_id)")
      .eq("student_id", userId)
      .eq("homeworks.course_id", courseId)
      .order("submitted_at", { ascending: false });

    if (!error) setGrades(data || []);
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchCourse(), fetchGrades()]);
      setLoading(false);
    };
    load();
  }, [userId]);

  return (
    <div className="teacher-course-page">
      <header className="course-header">
        <div>
          <p className="eyebrow">Estudiante</p>
          <h1>Notas</h1>
          <p className="subtitle">
            {course
              ? `${course.name} • Código: ${course.code ?? "—"}`
              : "Revisa tus calificaciones"}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn ghost" onClick={() => navigate("/student")}>
            Volver al panel
          </button>
          <div className="nav-chips">
            <button
              className="chip ghost"
              onClick={() => navigate(`/student/sessions/${courseId}`)}
            >
              Sesiones
            </button>
            <button
              className="chip ghost"
              onClick={() => navigate(`/student/homeworks/${courseId}`)}
            >
              Tareas
            </button>
            <button className="chip active">Notas</button>
          </div>
        </div>
      </header>

      <section className="list-section">
        {loading ? (
          <p className="muted">Cargando...</p>
        ) : grades.length === 0 ? (
          <div className="empty-state">
            <p>No hay calificaciones registradas.</p>
          </div>
        ) : (
          <div className="list-grid">
            {grades.map((g) => (
              <article key={g.id} className="list-card">
                <p className="item-title">{g.homeworks?.title}</p>
                <p className="muted">
                  Inicio: {g.homeworks?.start_date} • Fin: {g.homeworks?.end_date}
                </p>
                <p className="body-text">Nota: {g.score ?? "Sin calificar"}</p>
                <p className="muted">
                  Feedback: {g.feedback ?? "Sin comentarios"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
