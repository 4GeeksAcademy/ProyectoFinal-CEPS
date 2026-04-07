import { useEffect, useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";

export const ExerciseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromRoutine = searchParams.get("from") === "routine";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${backendUrl}/api/exercises/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || "Error al cargar el ejercicio");
        }

        setExercise(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [backendUrl, id]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando ejercicio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">No se encontró el ejercicio.</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6 mb-4 mb-md-0">
          {exercise.image_url && (
            <img
              src={exercise.image_url}
              alt={exercise.name}
              className="img-fluid rounded shadow-sm w-100"
              style={{ objectFit: 'cover', maxHeight: '550px' }}
            />
          )}
        </div>
        <div className="col-md-6">
          <h2 className="mb-3">{exercise.name}</h2>
          <p><strong>Zona Muscular:</strong> <span className="badge bg-info text-dark">{exercise.zone}</span></p>
          <p><strong>Equipamiento:</strong> {exercise.equipment}</p>
          <hr />
          <h4>Preparación</h4>
          <p style={{ whiteSpace: "pre-wrap" }}>{exercise.preparation}</p>
          <h4>Ejecución</h4>
          <p style={{ whiteSpace: "pre-wrap" }}>{exercise.execution}</p>
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        {fromRoutine && (
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Volver a la rutina
          </button>
        )}
        <Link to="/exercises" className="btn btn-outline-secondary">
          Ir al Banco de Ejercicios
        </Link>
      </div>
    </div>
  );
};