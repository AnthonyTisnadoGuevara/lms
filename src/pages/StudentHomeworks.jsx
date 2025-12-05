import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../supabase";
import "./teacher-course.css";

export default function StudentHomeworks() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCourse = async () => {
    const { data } = await supabase
      .from("courses")
      .select("name, code")
      .eq("id", courseId)
      .single();

    if (data) setCourse(data);
  };

  const fetchHomeworks = async () => {
    const { data, error } = await supabase
      .from("homeworks")
      .select("*")
      .eq("course_id", courseId)
      .order("start_date", { ascending: true });

    if (!error) setTasks(data || []);
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchCourse(), fetchHomeworks()]);
      setLoading(false);
    };
    load();
  }, [courseId]);

  const deliveryLabel = (type) => {
    if (type === "text") return "Solo texto";
    return "Archivo";
  };

  return (
    <div className="teacher-course-page">
      <header className="course-header">
        <div>
          <p className="eyebrow">Estudiante</p>
          <h1>Tareas del curso</h1>
          <p className="subtitle">
            {course ? `${course.name} • Código: ${course.code ?? "—"}` : "Consulta y envía tus tareas"}
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
            <button className="chip active">Tareas</button>
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
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No hay tareas disponibles en este momento.</p>
          </div>
        ) : (
          <div className="list-grid">
            {tasks.map((t) => (
              <article key={t.id} className="list-card">
                <p className="item-title">{t.title}</p>
                {t.instructions && <p className="body-text">{t.instructions}</p>}

                <p className="muted">Entrega: {deliveryLabel(t.delivery_type)}</p>

                {t.attachment_url && (
                  <a
                    className="chip link"
                    href={t.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Descargar {t.attachment_name || "archivo"}
                  </a>
                )}

                <p className="muted">
                  Disponible: {t.start_date} • Hasta: {t.end_date}
                </p>

                <Link to={`/student/submit/${t.id}`} className="chip active">
                  Enviar tarea
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
