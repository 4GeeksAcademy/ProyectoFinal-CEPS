import { useEffect, useState } from "react";

export const Classes = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/classes`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error("Error al cargar clases");
                }

                setClasses(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchClasses();
    }, [backendUrl]);

    return (
        <div className="container mt-5">
            <h2>Clases disponibles</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row">
                {classes.map((item) => (
                    <div className="col-md-4 mb-4" key={item.id}>
                        <div className="card h-100">
                            {item.image_url && (
                                <img src={item.image_url} className="card-img-top" alt={item.title} />
                            )}
                            <div className="card-body">
                                <h5>{item.title}</h5>
                                <p>{item.description}</p>
                                <p><strong>Categoría:</strong> {item.category}</p>
                                <p><strong>Fecha:</strong> {item.date}</p>
                                <p><strong>Hora:</strong> {item.time}</p>
                                <p><strong>Duración:</strong> {item.duration} min</p>
                                <p><strong>Nivel:</strong> {item.level}</p>
                                <p><strong>Entrenador:</strong> {item.trainer_email}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};