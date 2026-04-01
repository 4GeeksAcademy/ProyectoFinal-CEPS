import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const CreateRoutine = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { store } = useGlobalReducer();
  const { user, token } = store;

  // Estado para el formulario de la rutina
  const [form, setForm] = useState({
    name: "",
    description: "",
    goal: "",
    level: "",
    estimated_time: "",
    muscle_group: ""
  });

  // Estados para el manejo de ejercicios
  const [allExercises, setAllExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showExerciseSelection, setShowExerciseSelection] = useState(false);
  const [filterZone, setFilterZone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Obtener los ejercicios desde el backend
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/exercises`);
        if (res.ok) {
          const data = await res.json();
          setAllExercises(data);
        }
      } catch (err) {
        console.error("Error cargando ejercicios", err);
      }
    };
    fetchExercises();
  }, [backendUrl]);

  if (!user || user.role !== "trainer") {
    return (
      <div className="container mt-5 alert alert-danger">
        Solo los entrenadores pueden acceder a esta página.
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Funciones para manejar la selección de ejercicios
  const handleAddExercise = (exercise) => {
    // Evitar duplicados
    if (!selectedExercises.find((ex) => ex.id === exercise.id)) {
      setSelectedExercises([...selectedExercises, exercise]);
    }
    // Retorna a la vista de creación de rutina tras seleccionar
    setShowExerciseSelection(false);
  };

  const handleRemoveExercise = (id) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.id !== id));
  };

  // Ejercicios filtrados por grupo muscular
  const filteredExercises = filterZone
    ? allExercises.filter((ex) => ex.zone.toLowerCase().includes(filterZone.toLowerCase()))
    : allExercises;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Preparamos el payload (mandamos los IDs de los ejercicios seleccionados)
    const payload = {
      ...form,
      exercises: selectedExercises.map((ex) => ex.id)
    };

    try {
      const response = await fetch(`${backendUrl}/api/routines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Error al crear la rutina");

      alert("Rutina creada exitosamente");
      navigate("/private"); // O a donde prefieras redirigir
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VISTA 2: SELECCIÓN DE EJERCICIOS
  // ==========================================
  if (showExerciseSelection) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Seleccionar Ejercicio</h2>
          <button className="btn btn-secondary" onClick={() => setShowExerciseSelection(false)}>
            Volver a la Rutina
          </button>
        </div>

        <input type="text" className="form-control mb-4" placeholder="Filtrar por grupo muscular (Ej: Pecho, Pierna...)" value={filterZone} onChange={(e) => setFilterZone(e.target.value)} />

        <div className="row">
          {filteredExercises.map((ex) => (
            <div className="col-md-4 mb-3" key={ex.id}>
              <div className="card h-100">
                {ex.image_url && (
                  <img
                    src={ex.image_url}
                    alt={ex.name}
                    className="card-img-top"
                    style={{ height: "200px", objectFit: "contain" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{ex.name}</h5>
                  <p className="card-text text-muted">Zona: {ex.zone}</p>
                  <button className="btn btn-outline-success w-100" onClick={() => handleAddExercise(ex)}>
                    Seleccionar
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredExercises.length === 0 && <p className="text-muted">No se encontraron ejercicios para esa zona.</p>}
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA 1: FORMULARIO DE LA RUTINA
  // ==========================================
  return (
    <div className="container mt-5">
      <h2>Crear Nueva Rutina</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="row mb-3">
          <div className="col-md-6"><input className="form-control mb-2" name="name" placeholder="Nombre de la Rutina" value={form.name} onChange={handleChange} required /></div>
          <div className="col-md-6"><input className="form-control mb-2" name="goal" placeholder="Objetivo (Ej: Hipertrofia)" value={form.goal} onChange={handleChange} required /></div>
          <div className="col-md-6"><input className="form-control mb-2" name="level" placeholder="Nivel (Ej: Principiante)" value={form.level} onChange={handleChange} required /></div>
          <div className="col-md-6"><input className="form-control mb-2" type="number" name="estimated_time" placeholder="Tiempo estimado (minutos)" value={form.estimated_time} onChange={handleChange} required /></div>
          <div className="col-md-12"><input className="form-control mb-2" name="muscle_group" placeholder="Grupo muscular principal de la rutina" value={form.muscle_group} onChange={handleChange} required /></div>
          <div className="col-md-12"><textarea className="form-control mb-2" name="description" placeholder="Descripción" value={form.description} onChange={handleChange} required /></div>
        </div>

        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Ejercicios Seleccionados ({selectedExercises.length})</h5>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => setShowExerciseSelection(true)}>+ Añadir Ejercicio</button>
          </div>
          <ul className="list-group list-group-flush">
            {selectedExercises.map((ex) => (<li key={ex.id} className="list-group-item d-flex justify-content-between align-items-center"><span><strong>{ex.name}</strong> - {ex.zone}</span><button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemoveExercise(ex.id)}>Quitar</button></li>))}
            {selectedExercises.length === 0 && <li className="list-group-item text-muted text-center py-3">Aún no has seleccionado ningún ejercicio</li>}
          </ul>
        </div>

        <button className="btn btn-success w-100 py-2" disabled={loading}>{loading ? "Creando..." : "Crear Rutina"}</button>
      </form>
    </div>
  );
};