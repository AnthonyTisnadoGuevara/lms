import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import "./teacher-course.css";

export default function TeacherSessions() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

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

  const uploadAttachment = async () => {
    if (!file) return { url: null, name: null };
    const path = `sessions/${courseId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("materials").upload(path, file);
    if (error) return { url: null, name: null, failed: true, message: error.message };
    const { data } = supabase.storage.from("materials").getPublicUrl(path);
    return { url: data.publicUrl, name: file.name };
  };

  const createSession = async () => {
    setErrorMsg("");
    if (!title.trim()) return alert("Ingrese un nombre para la sesión.");
    setSaving(true);

    const attachment = await uploadAttachment();
    if (attachment.failed) {
      setErrorMsg("No se pudo subir el archivo de la sesión. Verifica el bucket 'materials' y permisos.");
      setSaving(false);
      return;
    }

    const payload = {
      title,
      course_id: courseId,
      attachment_url: attachment.url,
      attachment_name: attachment.name,
    };

    let { error } = await supabase.from("sessions").insert(payload);

    // fallback si no existen columnas attachment_*
    if (error && attachment.url) {
      const { error: retryError } = await supabase.from("sessions").insert({
        title,
        course_id: courseId,
        description: attachment.url,
      });
      if (retryError) {
        alert("No se pudo crear la sesión.");
        setSaving(false);
        return;
      }
    } else if (error) {
      alert("No se pudo crear la sesión.");
      setSaving(false);
      return;
    }

    setTitle("");
    setFile(null);
    fetchSessions();
    setSaving(false);
  };

  const deleteSession = async (id) => {
    await supabase.from("sessions").delete().eq("id", id);
    fetchSessions();
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
          <p className="eyebrow">Docente</p>
          <h1>Sesiones del curso</h1>
          <p className="subtitle">
            {course
              ? `${course.name} • Código: ${course.code ?? "—"}`
              : "Gestiona las semanas o módulos"}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn ghost" onClick={() => navigate("/teacher")}>
            Volver al panel
          </button>
          <div className="nav-chips">
            <button className="chip active">Sesiones</button>
            <button
              className="chip ghost"
              onClick={() => navigate(`/teacher/homeworks/${courseId}`)}
            >
              Tareas
            </button>
            <button
              className="chip ghost"
              onClick={() => navigate(`/teacher/students/${courseId}`)}
            >
              Estudiantes
            </button>
          </div>
        </div>
      </header>

      <section className="card-panel">
        <div className="section-heading">
          <h2>Agregar sesión</h2>
          <span className="badge">{sessions.length}</span>
        </div>
        {errorMsg && <p className="muted" style={{ color: "#fca5a5" }}>{errorMsg}</p>}
        <div className="form-grid column card-surface">
          <input
            className="input"
            placeholder="Semana 1, Semana 2..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="field">
            <label>Archivo opcional (PDF, Word, PPT)</label>
            <input
              className="input"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <button className="btn primary" onClick={createSession} disabled={saving}>
            {saving ? "Creando..." : "Crear sesión"}
          </button>
        </div>
      </section>

      <section className="list-section">
        {loading ? (
          <p className="muted">Cargando...</p>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <p>No hay sesiones creadas todavía.</p>
          </div>
        ) : (
          <div className="list-grid">
            {sessions.map((s) => (
              <article key={s.id} className="list-card row">
                <div>
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
                </div>
                <button className="chip danger" onClick={() => deleteSession(s.id)}>
                  Eliminar
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
