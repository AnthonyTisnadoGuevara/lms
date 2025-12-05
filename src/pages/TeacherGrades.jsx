import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import "./teacher-course.css";

export default function TeacherGrades() {
  const { homeworkId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [homework, setHomework] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHomework = async () => {
    const { data } = await supabase
      .from("homeworks")
      .select("title, course_id")
      .eq("id", homeworkId)
      .single();
    setHomework(data);
  };

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from("submissions")
      .select(
        `
        id,
        file_url,
        file_name,
        score,
        feedback,
        profiles (full_name, first_name, last_name, email)
      `
      )
      .eq("homework_id", homeworkId);

    if (!error) setSubmissions(data || []);
  };

  async function saveGrade(id, score, feedback) {
    await supabase.from("submissions").update({ score, feedback }).eq("id", id);
    fetchSubmissions();
  }

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchHomework(), fetchSubmissions()]);
      setLoading(false);
    };
    load();
  }, [homeworkId]);

  return (
    <div className="teacher-course-page">
      <header className="course-header">
        <div>
          <p className="eyebrow">Docente</p>
          <h1>Calificar tareas</h1>
          <p className="subtitle">
            {homework ? homework.title : "Revisa las entregas de tus alumnos"}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn ghost" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </header>

      <section className="list-section">
        {loading ? (
          <p className="muted">Cargando...</p>
        ) : submissions.length === 0 ? (
          <div className="empty-state">
            <p>No hay entregas aún.</p>
          </div>
        ) : (
          <div className="list-grid">
            {submissions.map((s) => (
              <article key={s.id} className="list-card">
                <p className="item-title">
                  {s.profiles?.full_name ||
                    `${s.profiles?.first_name || ""} ${
                      s.profiles?.last_name || ""
                    }`.trim()}
                </p>
                <p className="muted">{s.profiles?.email}</p>

                {s.file_url && (
                  <a className="chip link" href={s.file_url} target="_blank" rel="noreferrer">
                    Descargar: {s.file_name || "Archivo"}
                  </a>
                )}

                <div className="double">
                  <div className="field">
                    <label>Nota</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={s.score || ""}
                      onBlur={(e) => saveGrade(s.id, e.target.value, s.feedback)}
                    />
                  </div>
                  <div className="field">
                    <label>Feedback</label>
                    <textarea
                      className="input textarea"
                      defaultValue={s.feedback || ""}
                      onBlur={(e) => saveGrade(s.id, s.score, e.target.value)}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
