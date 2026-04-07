import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const CreateRoutine = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { store } = useGlobalReducer();
  const { user, token } = store;

  const [form, setForm] = useState({
    name: "",
    description: "",
    goal: "",
    level: "",
    estimated_time: "",
    muscle_group: ""
  });

  const [allExercises, setAllExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showExerciseSelection, setShowExerciseSelection] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <div className="gp-auth-error">
            Solo los entrenadores pueden acceder a esta página.
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddExercise = (exercise) => {
    if (!selectedExercises.find((ex) => ex.id === exercise.id)) {
      setSelectedExercises([...selectedExercises, exercise]);
    }
    setShowExerciseSelection(false);
  };

  const handleRemoveExercise = (id) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.id !== id));
  };

  const muscleGroupLabels = {
    chest: "pecho",
    legs: "piernas",
    back: "espalda",
    shoulders: "hombros",
    arms: "brazos",
    core: "abdomen"
  };

  const filteredExercises =
    selectedMuscleGroup === "all"
      ? allExercises
      : allExercises.filter((ex) =>
          ex.zone?.toLowerCase().includes(muscleGroupLabels[selectedMuscleGroup])
        );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      exercises: selectedExercises.map((ex) => ex.id)
    };

    try {
      const response = await fetch(`${backendUrl}/api/routines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Error al crear la rutina");

      alert("Rutina creada exitosamente");
      navigate("/private");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showExerciseSelection) {
    return (
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <section className="gp-list-hero gp-card">
            <div>
              <div className="gp-eyebrow">EXERCISE PICKER</div>
              <h1 className="gp-list-title">SELECCIONAR EJERCICIO</h1>
              <p className="gp-list-subtitle">
                Explora el banco de ejercicios y añade los que harán parte de tu rutina.
              </p>
            </div>

            <div className="gp-list-hero-actions">
              <button
                type="button"
                className="gp-btn-secondary"
                onClick={() => setShowExerciseSelection(false)}
              >
                Volver a la rutina
              </button>
            </div>
          </section>

          <div className="gp-filter-bar gp-card">
            <span>Filtrar:</span>

            {[
              { value: "all", label: "Todos" },
              { value: "chest", label: "Pecho" },
              { value: "legs", label: "Piernas" },
              { value: "back", label: "Espalda" },
              { value: "shoulders", label: "Hombros" },
              { value: "arms", label: "Brazos" },
              { value: "core", label: "Abdomen" }
            ].map((group) => (
              <button
                key={group.value}
                type="button"
                className={`gp-filter-btn ${selectedMuscleGroup === group.value ? "active" : ""}`}
                onClick={() => setSelectedMuscleGroup(group.value)}
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
              <h3>No se encontraron ejercicios</h3>
              <p>No hay ejercicios disponibles para ese grupo muscular.</p>
            </div>
          ) : (
            <section className="gp-classes-grid">
              {filteredExercises.map((ex) => (
                <article className="gp-class-card gp-card" key={ex.id}>
                  <div className="gp-class-media">
                    <img
                      src={
                        ex.image_url ||
                        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
                      }
                      alt={ex.name}
                    />
                  </div>

                  <div className="gp-class-content">
                    <div className="gp-class-meta">
                      <span>{ex.zone || "General"}</span>
                    </div>

                    <h3>{ex.name}</h3>

                    <div className="gp-class-info">
                      <div className="gp-class-info-item">
                        <span>Zona</span>
                        <strong>{ex.zone || "No especificada"}</strong>
                      </div>
                    </div>

                    <div className="gp-class-actions">
                      <button
                        type="button"
                        className="gp-btn-primary"
                        onClick={() => handleAddExercise(ex)}
                      >
                        Seleccionar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="gp-list-page">
      <div className="gp-list-shell">
        <section className="gp-list-hero gp-card">
          <div>
            <div className="gp-eyebrow">CREATE ROUTINE</div>
            <h1 className="gp-list-title">CREAR RUTINA</h1>
            <p className="gp-list-subtitle">
              Diseña una rutina completa, selecciona ejercicios y define objetivos
              para tus usuarios.
            </p>
          </div>

          <div className="gp-list-hero-actions">
            <button
              type="button"
              className="gp-btn-secondary"
              onClick={() => navigate("/private")}
            >
              Cancelar
            </button>
          </div>
        </section>

        {error && <div className="gp-auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="gp-form gp-card" noValidate>
          <div className="gp-form-section">
            <h3>Información básica</h3>

            <div className="gp-form-grid">
              <div className="gp-form-field">
                <label>Nombre</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nombre de la rutina"
                  required
                />
              </div>

              <div className="gp-form-field">
                <label>Objetivo</label>
                <input
                  name="goal"
                  value={form.goal}
                  onChange={handleChange}
                  placeholder="Ej: Hipertrofia, resistencia..."
                  required
                />
              </div>
            </div>

            <div className="gp-form-field">
              <label>Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe la rutina"
                required
              />
            </div>
          </div>

          <div className="gp-form-section">
            <h3>Configuración</h3>

            <div className="gp-form-grid">
              <div className="gp-form-field">
                <label>Nivel</label>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>

              <div className="gp-form-field">
                <label>Grupo muscular</label>
                <select
                  name="muscle_group"
                  value={form.muscle_group}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona</option>
                  <option value="chest">Pecho</option>
                  <option value="legs">Piernas</option>
                  <option value="back">Espalda</option>
                  <option value="shoulders">Hombros</option>
                  <option value="arms">Brazos</option>
                  <option value="core">Abdomen</option>
                </select>
              </div>
            </div>

            <div className="gp-form-field">
              <label>Tiempo estimado (min)</label>
              <input
                type="number"
                name="estimated_time"
                value={form.estimated_time}
                onChange={handleChange}
                placeholder="Ej: 45"
                required
              />
            </div>
          </div>

          <div className="gp-form-section">
            <h3>Ejercicios seleccionados ({selectedExercises.length})</h3>

            <button
              type="button"
              className="gp-btn-secondary"
              onClick={() => setShowExerciseSelection(true)}
            >
              + Añadir ejercicio
            </button>

            <div className="gp-selected-exercises">
              {selectedExercises.length === 0 ? (
                <div className="gp-auth-error">
                  Aún no has seleccionado ejercicios
                </div>
              ) : (
                selectedExercises.map((ex) => (
                  <div className="gp-selected-exercise" key={ex.id}>
                    <span>
                      <strong>{ex.name}</strong> - {ex.zone}
                    </span>

                    <button
                      type="button"
                      className="gp-btn-secondary"
                      onClick={() => handleRemoveExercise(ex.id)}
                    >
                      Quitar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="gp-form-actions">
            <button type="submit" className="gp-btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Crear rutina"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};