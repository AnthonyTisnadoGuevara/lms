import { useState } from "react";
import { supabase } from "../supabase";
import Layout from "../components/Layout";

export default function CreateCourse() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const createCourse = async () => {
    if (!name || !code) {
      alert("Nombre y código del curso son obligatorios");
      return;
    }

    const { error } = await supabase.from("courses").insert({
      name,
      code,
      description,
    });

    if (error) return alert(error.message);

    alert("Curso creado correctamente");
    setName("");
    setCode("");
    setDescription("");
  };

  return (
    <Layout>
      <div className="form-container">
        <h1>Crear Curso</h1>

        <label>Nombre del curso</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ejemplo: Matemática 1"
        />

        <label>Código del curso</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ejemplo: MAT101"
        />

        <label>Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descripción del curso"
        />

        <button onClick={createCourse}>Crear Curso</button>
      </div>
    </Layout>
  );
}

