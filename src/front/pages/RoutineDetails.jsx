import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

export const RoutineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${backendUrl}/api/routines/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || "Error al cargar la rutina");
        }

        setRoutine(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutine();
  }, [backendUrl, id]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando rutina...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          {error}
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          No se encontró la rutina.
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>{routine.name}</h2>
      <p>{routine.description}</p>

      <div className="row mt-4">
        <div className="col-md-6">
          <p>
            <strong>Objetivo:</strong> {routine.goal}
          </p>

          <p>
            <strong>Nivel:</strong> {routine.level}
          </p>

          <p>
            <strong>Grupo muscular:</strong>{" "}
            {routine.muscle_group || "No especificado"}
          </p>

          <p>
            <strong>Tiempo estimado:</strong>{" "}
            {routine.estimated_time} min
          </p>
        </div>

        <div className="col-md-6">
          <p>
            <strong>Ejercicios:</strong>
          </p>

          {Array.isArray(routine.exercises) ? (
            <ul className="list-group mb-3">
              {routine.exercises.map(ex => (
                <li key={ex.id} className="list-group-item d-flex align-items-start gap-3">
                  {ex.image_url && (
                    <img
                      src={ex.image_url}
                      alt={ex.name}
                      className="rounded"
                      style={{ width: "120px", height: "120px", objectFit: "cover" }}
                    />
                  )}
                  <div>
                    <h5 className="mb-1">
                      <Link to={`/exercises/${ex.id}`} className="text-decoration-none">{ex.name}</Link>
                    </h5>
                    <p className="text-muted mb-1">Zona: {ex.zone}</p>
                    <p className="mb-0 mt-1 small"><strong>Ejecución:</strong> {ex.execution}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {routine.exercises}
            </pre>
          )}

          <p>
            <strong>Entrenador:</strong>{" "}
            {routine.trainer_email || "No disponible"}
          </p>
        </div>
      </div>

      <button
        className="btn btn-secondary mt-4"
        onClick={() => navigate("/routines")}
      >
        Volver a rutinas
      </button>
    </div>
  );
};
