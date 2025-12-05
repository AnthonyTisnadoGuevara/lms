import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Layout from "../components/Layout";
import "./dashboard.css";

export default function DashboardAdmin() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("courses")
      .select("id, name, code, teacher_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando cursos:", error);
      setErrorMsg("No se pudieron cargar los cursos.");
      setLoading(false);
      return;
    }

    const teacherIds = Array.from(
      new Set((data || []).map((c) => c.teacher_id).filter(Boolean))
    );

    let teachersMap = {};
    if (teacherIds.length) {
      const { data: teachersData, error: teachersError } = await supabase
        .from("profiles")
        .select("id, full_name, first_name, last_name")
        .in("id", teacherIds);

      if (!teachersError && teachersData) {
        teachersMap = teachersData.reduce((acc, t) => {
          acc[t.id] =
            t.full_name ||
            `${t.first_name || ""} ${t.last_name || ""}`.trim() ||
            "Sin docente";
          return acc;
        }, {});
      }
    }

    const enriched = (data || []).map((c) => ({
      ...c,
      teacherName: teachersMap[c.teacher_id] || "Sin docente",
    }));

    setCourses(enriched);
    setLoading(false);
  };

  const loadStudents = async (courseId) => {
    setLoadingStudents(true);

    // Intentamos en la tabla estándar course_students
    const { data, error } = await supabase
      .from("course_students")
      .select("student_id, profiles(full_name, first_name, last_name, email)")
      .eq("course_id", courseId);

    if (!error && data && data.length > 0) {
      setStudents(data);
      setLoadingStudents(false);
      return;
    }

    // Fallback: si usas la tabla curso_estudiantes
    const { data: altData, error: altError } = await supabase
      .from("curso_estudiantes")
      .select("student_id, profiles(full_name, first_name, last_name, email)")
      .eq("course_id", courseId);

    if (altError) {
      console.error("No se pudieron cargar estudiantes:", altError);
      setStudents([]);
      setLoadingStudents(false);
      return;
    }

    setStudents(altData || []);
    setLoadingStudents(false);
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    loadStudents(course.id);
  };

  const removeStudent = async (studentId) => {
    if (!selectedCourse) return;
    await supabase
      .from("course_students")
      .delete()
      .eq("course_id", selectedCourse.id)
      .eq("student_id", studentId);
    loadStudents(selectedCourse.id);
  };

  const deleteCourse = async (courseId) => {
    const confirmDelete = window.confirm(
      "¿Eliminar el curso y sus registros relacionados?"
    );
    if (!confirmDelete) return;
    await supabase.from("courses").delete().eq("id", courseId);
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(null);
      setStudents([]);
    }
    loadCourses();
  };

  const removeTeacher = async (courseId) => {
    const ok = window.confirm("¿Quitar al docente de este curso?");
    if (!ok) return;
    await supabase.from("courses").update({ teacher_id: null }).eq("id", courseId);
    if (selectedCourse?.id === courseId) {
      setSelectedCourse({ ...selectedCourse, teacherName: "Sin docente" });
    }
    loadCourses();
  };

  return (
    <Layout>
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h1>Panel de Administrador</h1>
          <p style={{ color: "#aab8d3" }}>
            Lista de cursos. Selecciona uno para ver alumnos y acciones.
          </p>

          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Docente</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Cargando cursos...</td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan="5">{errorMsg}</td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan="5">No hay cursos creados</td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.name}</td>
                    <td>{course.code}</td>
                    <td>{course.teacherName}</td>
                    <td>{new Date(course.created_at).toLocaleDateString()}</td>
                    <td style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn small edit"
                        onClick={() => handleSelectCourse(course)}
                      >
                        Ver
                      </button>
                      <button
                        className="btn small edit"
                        onClick={() => removeTeacher(course.id)}
                      >
                        Quitar docente
                      </button>
                      <button
                        className="btn small delete"
                        onClick={() => deleteCourse(course.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            width: "360px",
            background: "#1b2436",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 0 14px rgba(0,0,0,0.35)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Alumnos del curso</h3>
          {selectedCourse ? (
            <>
              <p style={{ color: "#aab8d3" }}>
                {selectedCourse.name} · Código {selectedCourse.code || "—"}
              </p>
              {loadingStudents ? (
                <p>Cargando estudiantes...</p>
              ) : students.length === 0 ? (
                <p>No hay estudiantes inscritos.</p>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {students.map((s) => (
                    <li
                      key={s.student_id}
                      style={{
                        background: "#111827",
                        border: "1px solid #243047",
                        borderRadius: "10px",
                        padding: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {s.profiles?.full_name ||
                            `${s.profiles?.first_name || ""} ${
                              s.profiles?.last_name || ""
                            }`}
                        </div>
                        <div style={{ color: "#9ca3af", fontSize: "13px" }}>
                          {s.profiles?.email}
                        </div>
                      </div>
                      <button
                        className="btn small delete"
                        onClick={() => removeStudent(s.student_id)}
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p style={{ color: "#aab8d3" }}>
              Selecciona un curso para ver sus alumnos.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
