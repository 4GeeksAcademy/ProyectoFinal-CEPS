import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const ClassDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [gymClass, setGymClass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/classes/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.msg || "Error al cargar la clase");
                }

                setGymClass(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClass();
    }, [backendUrl, id]);

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="alert alert-info">Cargando clase...</div>
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

    if (!gymClass) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">No se encontró la clase.</div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2>{gymClass.title}</h2>
            {gymClass.image_url && (
                <img
                    src={gymClass.image_url}
                    alt={gymClass.title}
                    className="img-fluid mb-4"
                    style={{ maxHeight: 400, objectFit: "cover" }}
                />
            )}

            <p>{gymClass.description}</p>

            <div className="row">
                <div className="col-md-6">
                    <p>
                        <strong>Categoría:</strong> {gymClass.category}
                    </p>
                    <p>
                        <strong>Fecha:</strong> {gymClass.date}
                    </p>
                    <p>
                        <strong>Hora:</strong> {gymClass.time}
                    </p>
                    <p>
                        <strong>Duración:</strong> {gymClass.duration} min
                    </p>
                    <p>
                        <strong>Capacidad:</strong> {gymClass.capacity}
                    </p>
                </div>
                <div className="col-md-6">
                    <p>
                        <strong>Nivel:</strong> {gymClass.level}
                    </p>
                    <p>
                        <strong>Ubicación:</strong> {gymClass.location || "No especificado"}
                    </p>
                    <p>
                        <strong>Entrenador:</strong> {gymClass.trainer_email || "No disponible"}
                    </p>
                </div>
            </div>

            <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                Volver a clases
            </button>
        </div>
    );
};