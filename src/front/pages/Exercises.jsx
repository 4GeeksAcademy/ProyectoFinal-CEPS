import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Exercises = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { store } = useGlobalReducer();
  const { user, token } = store;

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    zone: "",
    equipment: "",
    execution: "",
    preparation: "",
    image_url: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/exercises`);
        if (!response.ok) {
          throw new Error("Error al obtener los ejercicios");
        }
        const data = await response.json();
        setExercises(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [backendUrl]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const [editingExercise, setEditingExercise] = useState(null); // Nuevo estado para el ejercicio en edición

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const method = editingExercise ? "PUT" : "POST";
      const url = editingExercise
        ? `${backendUrl}/api/exercises/${editingExercise.id}`
        : `${backendUrl}/api/exercises`;

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || `Error al ${editingExercise ? "actualizar" : "crear"} ejercicio`);

      alert(`Ejercicio ${editingExercise ? "actualizado" : "creado"} con éxito`);
      if (editingExercise) {
        setExercises(exercises.map(ex => ex.id === editingExercise.id ? data.exercise : ex));
      } else {
        setExercises([...exercises, data.exercise]);
      }
      setShowForm(false);
      setForm({ name: "", zone: "", equipment: "", execution: "", preparation: "", image_url: "" });
      setEditingExercise(null); // Limpiar el ejercicio en edición
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (exercise) => {
    setEditingExercise(exercise);
    setForm(exercise); // Cargar los datos del ejercicio en el formulario
    setShowForm(true);
  };

  const handleDelete = async (exerciseId) => {
    if (!confirm("¿Está seguro de eliminar este ejercicio? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/exercises/${exerciseId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al eliminar el ejercicio");

      alert("Ejercicio eliminado con éxito");
      setExercises(exercises.filter(ex => ex.id !== exerciseId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="container mt-5 text-center">Cargando ejercicios...</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Banco de Ejercicios</h2>
        {user?.role === "trainer" && !editingExercise && ( // Mostrar botón de crear solo si no estamos editando
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cerrar Formulario" : "+ Crear Ejercicio"}
          </button>
        )}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="card p-4 mb-4 shadow-sm">
          <h4>{editingExercise ? "Editar Ejercicio" : "Nuevo Ejercicio"}</h4>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6 mb-2">
                <input className="form-control" name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-2">
                <select className="form-select" name="zone" value={form.zone} onChange={handleChange} required>
                  <option value="" disabled>Selecciona la Zona Muscular</option>
                  <option value="Pecho">Pecho</option>
                  <option value="Espalda">Espalda</option>
                  <option value="Hombros">Hombros</option>
                  <option value="Bíceps">Bíceps</option>
                  <option value="Tríceps">Tríceps</option>
                  <option value="Antebrazos">Antebrazos</option>
                  <option value="Abdomen">Abdomen</option>
                  <option value="Cuádriceps">Cuádriceps</option>
                  <option value="Isquiotibiales">Isquiotibiales</option>
                  <option value="Glúteos">Glúteos</option>
                  <option value="Pantorrillas">Pantorrillas</option>
                  <option value="Cuerpo Completo">Cuerpo Completo</option>
                </select>
              </div>
              <div className="col-md-6 mb-2">
                <input className="form-control" name="equipment" placeholder="Equipamiento" value={form.equipment} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-2">
                <input className="form-control" name="image_url" placeholder="URL de Imagen o GIF" value={form.image_url} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-2">
                <textarea className="form-control" name="preparation" placeholder="Preparación" value={form.preparation} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-2">
                <textarea className="form-control" name="execution" placeholder="Ejecución" value={form.execution} onChange={handleChange} required />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success w-100" disabled={submitting}>
                {submitting ? "Guardando..." : (editingExercise ? "Actualizar Ejercicio" : "Guardar Ejercicio")}
              </button>
              {editingExercise && <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingExercise(null); setForm({ name: "", zone: "", equipment: "", execution: "", preparation: "", image_url: "" }); }}>Cancelar</button>}
            </div>
          </form>
        </div>
      )}

      <div className="row">
        {exercises.map((exercise) => (
          <div className="col-md-4 mb-4" key={exercise.id}>
            <div className="card h-100 shadow-sm">
              {exercise.image_url ? (
                <div
                  className="card-img-top"
                  style={{
                    height: "200px",
                    backgroundImage: `url(${exercise.image_url})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                ></div>
              ) : null}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-primary">{exercise.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">Zona: {exercise.zone}</h6>
                <p className="card-text mb-1"><strong>Equipamiento:</strong> {exercise.equipment}</p>
                <p className="card-text small text-truncate mb-3"><strong>Ejecución:</strong> {exercise.execution}</p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <Link to={`/exercises/${exercise.id}`} className="btn btn-sm btn-outline-primary">
                    Ver Detalles
                  </Link>
                  {user?.role === "trainer" && (
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-warning" onClick={() => handleEditClick(exercise)}>
                        Editar
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exercise.id)}>
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};