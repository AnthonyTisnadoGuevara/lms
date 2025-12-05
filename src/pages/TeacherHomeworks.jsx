import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import "./teacher-course.css";

export default function TeacherHomeworks() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [homeworks, setHomeworks] = useState([]);
  const [course, setCourse] = useState(null);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [deliveryType, setDeliveryType] = useState("file"); // file | text
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("name, code")
      .eq("id", courseId)
      .single();

    if (!error) setCourse(data);
  };

  const fetchHomeworks = async () => {
    const { data, error } = await supabase
      .from("homeworks")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true });

    if (!error) setHomeworks(data || []);
  };

  const uploadAttachment = async () => {
    if (!file) return { url: null, name: null };
    const path = `homeworks/${courseId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("materials")
      .upload(path, file);
    if (uploadError) {
      alert("No se pudo subir el archivo.");
      return { url: null, name: null, failed: true };
    }
    const { data } = supabase.storage.from("materials").getPublicUrl(path);
    return { url: data.publicUrl, name: file.name };
  };

  const createHomework = async () => {
    if (!title.trim() || !startDate || !endDate) {
      return alert("Complete título y fechas.");
    }

    setSaving(true);
    const attachment = await uploadAttachment();
    const payload = {
      course_id: courseId,
      title,
      instructions,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime || null,
      end_time: endTime || null,
      delivery_type: deliveryType,
      attachment_url: attachment.url,
      attachment_name: attachment.name,
    };

    let { error } = await supabase.from("homeworks").insert(payload);

    if (error) {
      const meta = [];
      if (attachment.url) meta.push(`Adjunto: ${attachment.url}`);
      if (deliveryType) meta.push(`Modo entrega: ${deliveryType}`);
      if (startTime) meta.push(`Hora inicio: ${startTime}`);
      if (endTime) meta.push(`Hora fin: ${endTime}`);
      const fallbackInstructions =
        instructions + (meta.length ? `\n\n${meta.join(" | ")}` : "");

      const { error: retryError } = await supabase.from("homeworks").insert({
        course_id: courseId,
        title,
        instructions: fallbackInstructions,
        start_date: startDate,
        end_date: endDate,
      });

      if (retryError) {
        alert("No se pudo crear la tarea.");
        setSaving(false);
        return;
      }

      alert(
        "Tarea creada, pero la tabla no admite columnas extra. Se añadió el enlace en las instrucciones."
      );
    } else if (error) {
      alert("No se pudo crear la tarea.");
      setSaving(false);
      return;
    }

    setTitle("");
    setInstructions("");
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setDeliveryType("file");
    setFile(null);
    fetchHomeworks();
    setSaving(false);
  };

  const deleteHomework = async (id) => {
    const ok = window.confirm("¿Eliminar esta tarea?");
    if (!ok) return;
    setDeletingId(id);
    await supabase.from("homeworks").delete().eq("id", id);
    setDeletingId(null);
    fetchHomeworks();
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchCourse(), fetchHomeworks()]);
      setLoading(false);
    };
    load();
  }, [courseId]);

  return (
    <div className="teacher-course-page">
      <header className="course-header">
        <div>
          <p className="eyebrow">Docente</p>
          <h1>Tareas del curso</h1>
          <p className="subtitle">
            {course ? `${course.name} • Código: ${course.code ?? "—"}` : "Crea y administra las tareas"}
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
            <button className="chip active">Tareas</button>
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
          <h2>Crear tarea</h2>
          <span className="badge">{homeworks.length}</span>
        </div>

        <div className="form-grid column card-surface">
          <input
            className="input"
            placeholder="Título de la tarea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="input textarea"
            placeholder="Instrucciones"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />

          <div className="double">
            <div className="field">
              <label>Fecha y hora de inicio</label>
              <input
                className="input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <input
                className="input"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Fecha y hora de entrega</label>
              <input
                className="input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
              <input
                className="input"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Modo de entrega</label>
            <div className="delivery-row">
              <label className="radio-chip">
                <input
                  type="radio"
                  name="delivery"
                  value="file"
                  checked={deliveryType === "file"}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
                <span>Archivo requerido</span>
              </label>
              <label className="radio-chip">
                <input
                  type="radio"
                  name="delivery"
                  value="text"
                  checked={deliveryType === "text"}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
                <span>Solo texto</span>
              </label>
            </div>
          </div>

          <div className="field">
            <label>Archivo adjunto (opcional)</label>
            <input
              className="input"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="muted helper">
              Acepta imágenes, PPT o Word. Se sube a almacenamiento y queda
              descargable por el estudiante.
            </p>
          </div>

          <button className="btn primary" onClick={createHomework} disabled={saving}>
            {saving ? "Creando..." : "Crear tarea"}
          </button>
        </div>
      </section>

      <section className="list-section">
        {loading ? (
          <p className="muted">Cargando...</p>
        ) : homeworks.length === 0 ? (
          <div className="empty-state">
            <p>No hay tareas creadas todavía.</p>
          </div>
        ) : (
          <div className="list-grid">
            {homeworks.map((h) => (
              <article key={h.id} className="list-card">
                <p className="item-title">{h.title}</p>
                <p className="muted">
                  {h.start_date} {h.start_time || ""} • {h.end_date} {h.end_time || ""}
                </p>
                {h.instructions && <p className="body-text">{h.instructions}</p>}
                {h.delivery_type && (
                  <p className="muted">Entrega: {h.delivery_type === "text" ? "Solo texto" : "Archivo"}</p>
                )}
                {h.attachment_url && (
                  <a
                    className="chip link"
                    href={h.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Descargar: {h.attachment_name || "Archivo"}
                  </a>
                )}
                <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                  <button
                    className="chip ghost"
                    onClick={() => navigate(`/teacher/grades/${h.id}`)}
                  >
                    Calificar
                  </button>
                  <button className="chip danger" onClick={() => deleteHomework(h.id)} disabled={deletingId === h.id}>
                    {deletingId === h.id ? "Eliminando..." : "Eliminar"}
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
