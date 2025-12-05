import { useEffect, useState } from "react";
import { supabase } from "../supabase";   // ← CORRECTO
import Layout from "../components/Layout";
import "./form.css";

export default function AssignStudents() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  // 🚀 Cargar estudiantes y cursos al iniciar el componente
  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

  // 📌 Cargar estudiantes
  const loadStudents = async () => {
    const { data, error } = await supabase.from("profiles").select("*");

    if (error) {
      console.error("Error cargando estudiantes:", error);
      return;
    }

    // 🔎 Filtrar solo estudiantes según tu DB
    const filtered = data.filter(
      (u) =>
        u.role?.toLowerCase() === "estudiante" ||
        u.role?.toLowerCase() === "student"
    );

    setStudents(filtered);
  };

  // 📌 Cargar cursos de la tabla correcta: courses
  const loadCourses = async () => {
    const { data, error } = await supabase.from("courses").select("*");

    if (error) {
      console.error("Error cargando cursos:", error);
      return;
    }

    setCourses(data);
  };

  // 📌 Asignar estudiante a curso
  const assignStudent = async () => {
    if (!selectedCourse || !selectedStudent) {
      return alert("Seleccione un curso y un estudiante.");
    }

    // Insertar en tabla pivot course_students
    const { error } = await supabase.from("course_students").insert({
      course_id: selectedCourse,
      student_id: selectedStudent,
    });

    if (error) {
      alert("Error al asignar estudiante: " + error.message);
      return;
    }

    alert("Estudiante asignado correctamente 🎉");
  };

  return (
    <Layout>
      <div className="form-wrapper">
        <h1 className="form-title">Asignar Estudiantes</h1>

        {/* ----------------- SELECT CURSOS ----------------- */}
        <label>Curso</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">Seleccione un curso</option>
          {courses.length > 0 ? (
            courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {/* Mostrar nombre del curso */}
              </option>
            ))
          ) : (
            <option disabled>No hay cursos registrados</option>
          )}
        </select>

        {/* ----------------- SELECT ESTUDIANTES ----------------- */}
        <label>Estudiante</label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">Seleccione un estudiante</option>
          {students.length > 0 ? (
            students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name ??
                  `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim()}
              </option>
            ))
          ) : (
            <option disabled>No hay estudiantes registrados</option>
          )}
        </select>

        <button onClick={assignStudent}>Asignar Estudiante</button>
      </div>
    </Layout>
  );
}
