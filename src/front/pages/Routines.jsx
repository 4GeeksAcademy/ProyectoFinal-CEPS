import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const muscleGroupLabels = {
  chest: "Pecho",
  legs: "Piernas",
  back: "Espalda",
  shoulders: "Hombros",
  arms: "Brazos",
  core: "Abdomen"
};

const getEnglishMuscleGroup = (spanishValue) => {
  const reverseLabels = {
    "Pecho": "chest",
    "Piernas": "legs",
    "Espalda": "back",
    "Hombros": "shoulders",
    "Brazos": "arms",
    "Abdomen": "core",
    "Todos": "all"
  };
  return reverseLabels[spanishValue] || spanishValue;
};

export const Routines = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("Todos");
  const [favoriteRoutines, setFavoriteRoutines] = useState([]);
  const [deletingRoutineId, setDeletingRoutineId] = useState(null);

  const { store } = useGlobalReducer();
  const { token, user } = store;

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${backendUrl}/api/routines`);
        const data = await response.json();

        if (!response.ok) throw new Error("Error al cargar rutinas");

        setRoutines(data);

        if (token && user?.role === "user") {
          const favRes = await fetch(`${backendUrl}/api/favorites_routines`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (favRes.ok) {
            const favData = await favRes.json();
            setFavoriteRoutines(favData.map(f => f.routine_id || f.routine?.id));
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, [backendUrl, token, user?.role]);

  const toggleFavorite = async (routineId) => {
    if (!token) {
      alert("Necesitas iniciar sesión.");
      return;
    }

    const isFavorite = favoriteRoutines.includes(routineId);
    const method = isFavorite ? "DELETE" : "POST";

    try {
      const response = await fetch(`${backendUrl}/api/favorites_routines/${routineId}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Error al actualizar favoritos");

      if (isFavorite) {
        setFavoriteRoutines(favoriteRoutines.filter(id => id !== routineId));
      } else {
        setFavoriteRoutines([...favoriteRoutines, routineId]);
      }

    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    if (!window.confirm("¿Eliminar esta rutina?")) return;

    try {
      setDeletingRoutineId(routineId);

      const response = await fetch(`${backendUrl}/api/routines/${routineId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Error al eliminar");

      setRoutines(routines.filter(r => r.id !== routineId));

    } catch (error) {
      alert(error.message);
    } finally {
      setDeletingRoutineId(null);
    }
  };

  const filteredRoutines =
    selectedMuscleGroup === "Todos"
      ? routines
      : routines.filter(r => {
          const muscle = r.muscle_group?.toLowerCase().trim();
          const english = getEnglishMuscleGroup(selectedMuscleGroup);
          return muscle === english;
        });

  if (loading) {
    return (
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <div className="gp-list-loading gp-card">
            <div className="gp-list-spinner"></div>
            <p>Cargando rutinas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gp-list-page">
      <div className="gp-list-shell">

        {/* HERO */}
        <section className="gp-list-hero gp-card">
          <div>
            <div className="gp-eyebrow">TRAINING LIBRARY</div>
            <h1 className="gp-list-title">RUTINAS</h1>
            <p className="gp-list-subtitle">
              Explora rutinas por grupo muscular, guarda tus favoritas y accede a detalles completos de cada entrenamiento.
            </p>
          </div>

          <div className="gp-list-hero-actions">
            <Link to="/private" className="gp-btn-secondary">
              Volver
            </Link>

            {user?.role === "trainer" && (
              <Link to="/create-routine" className="gp-btn-primary">
                Crear rutina
              </Link>
            )}
          </div>
        </section>

        {/* FILTRO */}
        <div className="gp-filter-bar gp-card">
          <span>Filtrar:</span>

          {["Todos","Pecho","Piernas","Espalda","Hombros","Brazos","Abdomen"].map(group => (
            <button
              key={group}
              className={`gp-filter-btn ${selectedMuscleGroup === group ? "active" : ""}`}
              onClick={() => setSelectedMuscleGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>

        {/* GRID */}
        <section className="gp-classes-grid">
          {filteredRoutines.map((item) => (
            <article className="gp-class-card gp-card" key={item.id}>

              <div className="gp-class-content">

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-start">
                  <h3>{item.name}</h3>

                  {user?.role === "user" && (
                    <button
                      className="gp-fav-btn"
                      onClick={() => toggleFavorite(item.id)}
                    >
                      {favoriteRoutines.includes(item.id) ? "★" : "☆"}
                    </button>
                  )}
                </div>

                {/* META */}
                <div className="gp-class-meta">
                  <span>{muscleGroupLabels[item.muscle_group]}</span>
                  <span>{item.level}</span>
                </div>

                {/* INFO */}
                <div className="gp-class-info">
                  <div className="gp-class-info-item">
                    <span>Objetivo</span>
                    <strong>{item.goal}</strong>
                  </div>

                  <div className="gp-class-info-item">
                    <span>Entrenador</span>
                    <strong>{item.trainer_email}</strong>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="gp-class-actions">
                  <Link to={`/routines/${item.id}`} className="gp-btn-primary">
                    Ver rutina
                  </Link>

                  {user?.role === "trainer" && Number(user?.id) === item.trainer_id && (
                    <>
                      <Link to={`/routines/${item.id}/edit`} className="gp-btn-secondary">
                        Editar
                      </Link>

                      <button
                        className="gp-class-delete"
                        onClick={() => handleDeleteRoutine(item.id)}
                        disabled={deletingRoutineId === item.id}
                      >
                        {deletingRoutineId === item.id ? "..." : "Eliminar"}
                      </button>
                    </>
                  )}
                </div>

              </div>
            </article>
          ))}
        </section>

      </div>
    </div>
  );
};