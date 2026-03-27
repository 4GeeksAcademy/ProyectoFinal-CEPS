import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const Classes = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoading(true);

                const response = await fetch(`${backendUrl}/api/classes`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error("Error al cargar clases");
                }

                setClasses(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [backendUrl]);

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando clases...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Clases disponibles</h2>
                <Link to="/private" className="btn btn-secondary">
                    Volver al inicio
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row">
                {classes.map((item) => (
                    <div className="col-md-4 mb-4" key={item.id}>
                        <div className="card h-100">
                            {item.image_url && (
                                <img
                                    src={item.image_url}
                                    className="card-img-top"
                                    alt={item.title}
                                />
                            )}

                            <div className="card-body">
                                <h5>{item.title}</h5>
                                <p><strong>Categoría:</strong> {item.category}</p>
                                <p><strong>Fecha:</strong> {item.date}</p>
                                <p><strong>Entrenador:</strong> {item.trainer_email}</p>
                                <p><strong>Capacidad total:</strong> {item.capacity}</p>
                                <p><strong>Cupos ocupados:</strong> {item.occupied_slots ?? 0}</p>
                                <p><strong>Cupos disponibles:</strong> {item.available_slots ?? item.capacity}</p>

                                <span className={`badge mb-3 ${(item.available_slots ?? item.capacity) > 0 ? "bg-success" : "bg-danger"}`}>
                                    {(item.available_slots ?? item.capacity) > 0 ? "Disponible" : "Clase llena"}
                                </span>

                                <div>
                                    <Link
                                        to={`/classes/${item.id}`}
                                        className="btn btn-outline-primary"
                                    >
                                        Ver detalles
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};