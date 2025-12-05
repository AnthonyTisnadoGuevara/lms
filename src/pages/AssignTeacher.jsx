import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Layout from "../components/Layout";
import "./assign-teacher.css";

export default function AssignTeacher() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
    loadTeachers();
    setLoading(false);
  }, []);

  const loadCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*");
    if (!error) setCourses(data);
  };

  const loadTeachers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "docente"); // Solo docentes

    if (!error) setTeachers(data);
  };

  const assignTeacher = async () => {
    if (!selectedCourse || !selectedTeacher)
      return alert("Seleccione un curso y un docente");

    const { error } = await supabase
      .from("courses")
      .update({ teacher_id: selectedTeacher })
      .eq("id", selectedCourse);

    if (error) alert(error.message);
    else alert("Docente asignado correctamente");
  };

  return (
    <Layout>
      <div className="assign-wrapper">
        <div className="assign-card">
          <h1>Asignar Docente</h1>
          <p className="assign-subtitle">
            Elige un curso y asígnalo a un docente disponible.
          </p>

          <label>Curso</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Seleccione un curso</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label>Docente</label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">Seleccione un docente</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name || `${t.first_name || ""} ${t.last_name || ""}`}
              </option>
            ))}
          </select>

          <button className="assign-btn" onClick={assignTeacher} disabled={loading}>
            Asignar Docente
          </button>
        </div>
      </div>
    </Layout>
  );
}

