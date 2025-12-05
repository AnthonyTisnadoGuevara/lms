import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import "./teacher-course.css";

export default function StudentSubmit() {
  const { homeworkId } = useParams();
  const navigate = useNavigate();
  const [homework, setHomework] = useState(null);
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    setUserId(data?.user?.id);
  }

  async function fetchHomework() {
    const { data } = await supabase
      .from("homeworks")
      .select("*")
      .eq("id", homeworkId)
      .single();

    setHomework(data);
  }

  async function sendSubmission(event) {
    const isTextOnly = homework?.delivery_type === "text";
    let file = null;

    if (isTextOnly) {
      if (!textAnswer.trim() || !userId) return;
      file = new File([textAnswer], "respuesta.txt", { type: "text/plain" });
    } else {
      file = event.target.files ? event.target.files[0] : null;
      if (!file || !userId) return;
    }

    setUploading(true);

    const filePath = `${homeworkId}/${userId}_${file.name}`;

    let { error: storageError } = await supabase.storage
      .from("materials")
      .upload(filePath, file);

    if (storageError) {
      alert("Error subiendo archivo.");
      return setUploading(false);
    }

    const { data: urlData } = supabase.storage
      .from("materials")
      .getPublicUrl(filePath);

    await supabase.from("submissions").insert({
      homework_id: homeworkId,
      student_id: userId,
      file_url: urlData.publicUrl,
      file_name: file.name,
    });

    alert("Tarea enviada con éxito.");
    setUploading(false);
    setTextAnswer("");
  }

  useEffect(() => {
    fetchHomework();
    getUser();
  }, []);

  if (!homework) return <p>Cargando...</p>;

  return (
    <div className="teacher-course-page">
      <header className="course-header">
        <div>
          <p className="eyebrow">Estudiante</p>
          <h1>Enviar tarea</h1>
          <p className="subtitle">
            {homework.title}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn ghost" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </header>

      <section className="card-panel">
        <p className="body-text">{homework.instructions}</p>

        {homework.attachment_url && (
          <p style={{ marginTop: 10 }}>
            <a className="chip link" href={homework.attachment_url} target="_blank" rel="noreferrer">
              Descargar {homework.attachment_name || "archivo"}
            </a>
          </p>
        )}

        <p className="muted" style={{ marginTop: 10 }}>
          Disponible: {homework.start_date} {homework.start_time || ""} • Hasta: {homework.end_date} {homework.end_time || ""}
        </p>

        {homework.delivery_type === "text" ? (
          <>
            <p className="muted" style={{ marginTop: 10 }}>Entrega requerida: solo texto.</p>
            <textarea
              className="input textarea"
              placeholder="Escribe tu respuesta..."
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={uploading}
            />
            <button className="btn primary" onClick={sendSubmission} disabled={uploading || !textAnswer.trim()}>
              {uploading ? "Enviando..." : "Enviar texto"}
            </button>
          </>
        ) : (
          <>
            <input className="input" type="file" onChange={sendSubmission} disabled={uploading} />
            {uploading && <p className="muted">Subiendo archivo...</p>}
          </>
        )}
      </section>
    </div>
  );
}
