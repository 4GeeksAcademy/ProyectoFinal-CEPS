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
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
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

  const filteredExercises =
    selectedMuscleGroup === "all"
      ? exercises
      : exercises.filter((exercise) => exercise.zone === selectedMuscleGroup);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      zone: "",
      equipment: "",
      execution: "",
      preparation: "",
      image_url: ""
    });
    setEditingExercise(null);
    setShowForm(false);
  };

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
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.msg || `Error al ${editingExercise ? "actualizar" : "crear"} ejercicio`
        );
      }

      alert(`Ejercicio ${editingExercise ? "actualizado" : "creado"} con éxito`);

      if (editingExercise) {
        setExercises(exercises.map((ex) => (ex.id === editingExercise.id ? data.exercise : ex)));
      } else {
        setExercises([...exercises, data.exercise]);
      }

      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (exercise) => {
    setEditingExercise(exercise);
    setForm({
      name: exercise.name || "",
      zone: exercise.zone || "",
      equipment: exercise.equipment || "",
      execution: exercise.execution || "",
      preparation: exercise.preparation || "",
      image_url: exercise.image_url || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (exerciseId) => {
    if (!window.confirm("¿Está seguro de eliminar este ejercicio? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/exercises/${exerciseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al eliminar el ejercicio");

      alert("Ejercicio eliminado con éxito");
      setExercises(exercises.filter((ex) => ex.id !== exerciseId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <div className="gp-empty-state gp-card">
            <div className="gp-list-spinner"></div>
            <p>Cargando ejercicios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gp-list-page">
      <div className="gp-list-shell">
        <section className="gp-list-hero gp-card">
          <div>
            <div className="gp-eyebrow">EXERCISE LIBRARY</div>
            <h1 className="gp-list-title">BANCO DE EJERCICIOS</h1>
            <p className="gp-list-subtitle">
              Explora ejercicios, filtra por grupo muscular y mantén tu biblioteca siempre organizada.
            </p>
          </div>

          <div className="gp-list-hero-actions">
            {user?.role === "trainer" && !showForm && (
              <button className="gp-btn-primary" onClick={() => setShowForm(true)}>
                Crear ejercicio
              </button>
            )}
            <Link to="/private" className="gp-btn-secondary">
              Volver
            </Link>
          </div>
        </section>

        {error && <div className="gp-auth-error">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="gp-form gp-card" noValidate>
            <div className="gp-form-section">
              <h3>{editingExercise ? "Editar ejercicio" : "Nuevo ejercicio"}</h3>

              <div className="gp-form-grid">
                <div className="gp-form-field">
                  <label>Nombre</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nombre del ejercicio"
                    required
                  />
                </div>

                <div className="gp-form-field">
                  <label>Zona muscular</label>
                  <select name="zone" value={form.zone} onChange={handleChange} required>
                    <option value="">Selecciona la zona muscular</option>
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
              </div>

              <div className="gp-form-field">
                <label>Equipamiento</label>
                <input
                  name="equipment"
                  value={form.equipment}
                  onChange={handleChange}
                  placeholder="Ej: mancuernas, barra, banco"
                  required
                />
              </div>

              <div className="gp-form-field">
                <label>URL de imagen o GIF</label>
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="Pega la URL de la imagen"
                  required
                />
              </div>

              <div className="gp-form-field">
                <label>Preparación</label>
                <textarea
                  name="preparation"
                  value={form.preparation}
                  onChange={handleChange}
                  placeholder="Explica cómo prepararse para el ejercicio"
                  required
                />
              </div>

              <div className="gp-form-field">
                <label>Ejecución</label>
                <textarea
                  name="execution"
                  value={form.execution}
                  onChange={handleChange}
                  placeholder="Explica cómo ejecutar correctamente el ejercicio"
                  required
                />
              </div>
            </div>

            <div className="gp-form-actions">
              <button type="submit" className="gp-btn-primary" disabled={submitting}>
                {submitting
                  ? "Guardando..."
                  : editingExercise
                  ? "Actualizar ejercicio"
                  : "Guardar ejercicio"}
              </button>

              <button
                type="button"
                className="gp-btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {!showForm && (
          <>
            <div className="gp-filter-bar gp-card">
              <span>Filtrar:</span>

              {[
                { value: "all", label: "Todos" },
                { value: "Pecho", label: "Pecho" },
                { value: "Espalda", label: "Espalda" },
                { value: "Hombros", label: "Hombros" },
                { value: "Bíceps", label: "Bíceps" },
                { value: "Tríceps", label: "Tríceps" },
                { value: "Antebrazos", label: "Antebrazos" },
                { value: "Abdomen", label: "Abdomen" },
                { value: "Cuádriceps", label: "Cuádriceps" },
                { value: "Isquiotibiales", label: "Isquiotibiales" },
                { value: "Glúteos", label: "Glúteos" },
                { value: "Pantorrillas", label: "Pantorrillas" },
                { value: "Cuerpo Completo", label: "Cuerpo Completo" }
              ].map((group) => (
                <button
                  key={group.value}
                  className={`gp-filter-btn ${selectedMuscleGroup === group.value ? "active" : ""}`}
                  onClick={() => setSelectedMuscleGroup(group.value)}
                  type="button"
                >
                  {group.label}
                </button>
              ))}
            </div>

            {filteredExercises.length === 0 ? (
              <div className="gp-empty-state gp-card">
                <div className="gp-empty-icon">
                  <i className="fas fa-dumbbell"></i>
                </div>
                <h3>No hay ejercicios disponibles</h3>
                <p>
                  {selectedMuscleGroup === "all"
                    ? "En este momento no hay ejercicios cargados. Vuelve más tarde para ver nuevos ejercicios."
                    : `No hay ejercicios para el grupo muscular "${selectedMuscleGroup}".`}
                </p>

                {user?.role === "trainer" && (
                  <button className="gp-btn-primary" onClick={() => setShowForm(true)}>
                    Crear ejercicio
                  </button>
                )}
              </div>
            ) : (
              <section className="gp-classes-grid">
                {filteredExercises.map((exercise) => (
                  <article className="gp-class-card gp-card" key={exercise.id}>
                    {exercise.image_url ? (
                      <div className="gp-class-media">
                        <img src={exercise.image_url} alt={exercise.name} />
                      </div>
                    ) : null}

                    <div className="gp-class-content">
                      <div className="gp-class-meta">
                        <span>{exercise.zone}</span>
                      </div>

                      <h3>{exercise.name}</h3>

                      <div className="gp-class-info">
                        <div className="gp-class-info-item">
                          <span>Equipamiento</span>
                          <strong>{exercise.equipment}</strong>
                        </div>
                      </div>

                      <div className="gp-class-actions">
                        <Link to={`/exercises/${exercise.id}`} className="gp-btn-primary">
                          Ver detalles
                        </Link>

                        {user?.role === "trainer" && (
                          <>
                            <button
                              className="gp-btn-secondary"
                              onClick={() => handleEditClick(exercise)}
                              type="button"
                            >
                              Editar
                            </button>

                            <button
                              className="gp-class-delete"
                              onClick={() => handleDelete(exercise.id)}
                              type="button"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};