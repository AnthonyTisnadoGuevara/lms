import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function EditCourse() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  async function loadCourse() {
    const { data } = await supabase
      .from("courses")
      .select("*, course_students(student_id)")
      .eq("id", id)
      .single();

    setCourse(data);
    setSelectedStudents(data.course_students.map((s) => s.student_id));
  }

  async function fetchUsers() {
    const { data: teachersData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "docente");

    const { data: studentsData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "estudiante");

    setTeachers(teachersData);
    setStudents(studentsData);
  }

  async function updateCourse(e) {
    e.preventDefault();

    // Actualizar curso
    await supabase
      .from("courses")
      .update({
        name: course.name,
        code: course.code,
        description: course.description,
        teacher_id: course.teacher_id,
      })
      .eq("id", id);

    // Resetear estudiantes del curso
    await supabase.from("course_students").delete().eq("course_id", id);

    // Insertar nuevos estudiantes seleccionados
    for (let studentId of selectedStudents) {
      await supabase.from("course_students").insert([
        {
          course_id: id,
          student_id: studentId,
        },
      ]);
    }

    alert("Curso actualizado correctamente");
  }

  useEffect(() => {
    loadCourse();
    fetchUsers();
  }, []);

  if (!course) return <p>Cargando...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>Editar curso</h2>

      <form onSubmit={updateCourse}>
        <input
          type="text"
          value={course.name}
          onChange={(e) => setCourse({ ...course, name: e.target.value })}
        />

        <input
          type="text"
          value={course.code}
          onChange={(e) => setCourse({ ...course, code: e.target.value })}
        />

        <textarea
          value={course.description}
          onChange={(e) =>
            setCourse({ ...course, description: e.target.value })
          }
        />

        <h3>Docente</h3>
        <select
          value={course.teacher_id}
          onChange={(e) =>
            setCourse({ ...course, teacher_id: e.target.value })
          }
        >
          <option value="">Seleccionar docente</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.first_name} {t.last_name}
            </option>
          ))}
        </select>

        <h3>Estudiantes</h3>
        {students.map((s) => (
          <div key={s.id}>
            <input
              type="checkbox"
              checked={selectedStudents.includes(s.id)}
              value={s.id}
              onChange={(e) => {
                const value = e.target.value;
                if (e.target.checked) {
                  setSelectedStudents([...selectedStudents, value]);
                } else {
                  setSelectedStudents(
                    selectedStudents.filter((x) => x !== value)
                  );
                }
              }}
            />
            {s.first_name} {s.last_name}
          </div>
        ))}

        <button type="submit">Guardar cambios</button>
      </form>
    </div>
  );
}
