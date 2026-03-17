import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const Routines = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [routines, setRoutines] = useState([]);
    const [error, setError] = useState("");
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");

    useEffect(() => {
        const fetchRoutines = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/routines`);
                const data = await response.json();

                console.log("DATA FROM API:", data);

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

    console.log("RUTINAS EN ESTADO:", routines);

    const filteredRoutines =
        selectedMuscleGroup === "all"
            ? routines
            : routines.filter((item) => {
                const muscle = item.muscle_group?.toLowerCase().trim();
                return muscle === selectedMuscleGroup;
            });

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Rutinas disponibles</h2>
                <Link to="/private" className="btn btn-secondary">
                    Volver al inicio
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-4">
                <label className="form-label">Filtrar por grupo muscular</label>
                <select
                    className="form-select"
                    value={selectedMuscleGroup}
                    onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                >
                    <option value="all">Todos</option>
                    <option value="chest">Pecho</option>
                    <option value="legs">Piernas</option>
                    <option value="back">Espalda</option>
                    <option value="shoulders">Hombros</option>
                    <option value="arms">Brazos</option>
                    <option value="core">Core</option>
                </select>
            </div>

            <div className="row">
                {filteredRoutines.length > 0 ? (
                    filteredRoutines.map((item) => (
                        <div className="col-md-4 mb-4" key={item.id}>
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5>{item.name}</h5>
                                    <p><strong>Objetivo:</strong> {item.goal}</p>
                                    <p><strong>Nivel:</strong> {item.level}</p>
                                    <p>
                                        <strong>Grupo muscular:</strong>{" "}
                                        {item.muscle_group || "No especificado"}
                                    </p>
                                    <p><strong>Entrenador:</strong> {item.trainer_email}</p>
                                    <Link
                                        to={`/routines/${item.id}`}
                                        className="btn btn-outline-primary"
                                    >
                                        Ver detalles
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="alert alert-warning">
                            No hay rutinas para ese grupo muscular.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
