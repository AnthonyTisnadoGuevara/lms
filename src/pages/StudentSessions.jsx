import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import "./teacher-course.css";

export default function StudentSessions() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
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

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true });

    if (!error) setSessions(data || []);
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchCourse(), fetchSessions()]);
      setLoading(false);
    };
    load();
  }, [courseId]);

  return (
    <div className="teacher-course-page">
      <header className="course-header">
        <div>
          <p className="eyebrow">Estudiante</p>
          <h1>Sesiones del curso</h1>
          <p className="subtitle">
            {course
              ? `${course.name} • Código: ${course.code ?? "—"}`
              : "Revisa las sesiones disponibles"}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn ghost" onClick={() => navigate("/student")}>
            Volver al panel
          </button>
          <div className="nav-chips">
            <button className="chip active">Sesiones</button>
            <button
              className="chip ghost"
              onClick={() => navigate(`/student/homeworks/${courseId}`)}
            >
              Tareas
            </button>
            <button
              className="chip ghost"
              onClick={() => navigate(`/student/grades/${courseId}`)}
            >
              Notas
            </button>
          </div>
        </div>
      </header>

      <section className="list-section">
        {loading ? (
          <p className="muted">Cargando...</p>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <p>Aún no hay sesiones creadas.</p>
          </div>
        ) : (
          <div className="list-grid">
            {sessions.map((s) => (
              <article key={s.id} className="list-card">
                <p className="item-title">{s.title}</p>
                {s.attachment_url && (
                  <a
                    className="chip link"
                    href={s.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Descargar: {s.attachment_name || "Archivo"}
                  </a>
                )}
                {s.description && !s.attachment_url && (
                  <p className="muted">{s.description}</p>
                )}
                <p className="muted">ID: {s.id}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
