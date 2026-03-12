import { useEffect, useState } from "react";

export const Routines = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [routines, setRoutines] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRoutines = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/routines`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error("Error al cargar rutinas");
                }

                setRoutines(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchRoutines();
    }, [backendUrl]);

    return (
        <div className="container mt-5">
            <h2>Rutinas disponibles</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row">
                {routines.map((item) => (
                    <div className="col-md-4 mb-4" key={item.id}>
                        <div className="card h-100">
                            <div className="card-body">
                                <h5>{item.name}</h5>
                                <p>{item.description}</p>
                                <p><strong>Objetivo:</strong> {item.goal}</p>
                                <p><strong>Nivel:</strong> {item.level}</p>
                                <p><strong>Tiempo:</strong> {item.estimated_time} min</p>
                                <p><strong>Ejercicios:</strong> {item.exercises}</p>
                                <p><strong>Entrenador:</strong> {item.trainer_email}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};