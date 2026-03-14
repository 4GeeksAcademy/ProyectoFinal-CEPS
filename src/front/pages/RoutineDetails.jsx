import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
            <div className="container mt-5">
                <div className="alert alert-info">Cargando rutina...</div>
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

    if (!routine) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">No se encontró la rutina.</div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2>{routine.name}</h2>
            <p>{routine.description}</p>

            <div className="row">
                <div className="col-md-6">
                    <p>
                        <strong>Objetivo:</strong> {routine.goal}
                    </p>
                    <p>
                        <strong>Nivel:</strong> {routine.level}
                    </p>
                    <p>
                        <strong>Tiempo estimado:</strong> {routine.estimated_time} min
                    </p>
                </div>
                <div className="col-md-6">
                    <p>
                        <strong>Ejercicios:</strong>
                    </p>
                    <pre style={{ whiteSpace: "pre-wrap" }}>{routine.exercises}</pre>
                    <p>
                        <strong>Entrenador:</strong> {routine.trainer_email || "No disponible"}
                    </p>
                </div>
            </div>

            <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                Volver
            </button>
        </div>
    );
};
