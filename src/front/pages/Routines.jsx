import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Routines = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");
    const [favoriteRoutines, setFavoriteRoutines] = useState([]);
    const { store } = useGlobalReducer();
    const { token, user } = store;

    useEffect(() => {
        const fetchRoutines = async () => {
            try {
                setLoading(true);

                const response = await fetch(`${backendUrl}/api/routines`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error("Error al cargar rutinas");
                }

                setRoutines(data);

                if (token && user?.role === "user") {
                    const favRes = await fetch(`${backendUrl}/api/favorites_routines`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (favRes.ok) {
                        const favData = await favRes.json();
                        setFavoriteRoutines(favData.map(fav => fav.routine_id || fav.routine?.id));
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
            alert("Necesitas iniciar sesión para añadir a favoritos.");
            return;
        }

        const isFavorite = favoriteRoutines.includes(routineId);
        const method = isFavorite ? "DELETE" : "POST";

        try {
            const response = await fetch(`${backendUrl}/api/favorites_routines/${routineId}`, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.msg || "Error al actualizar favoritos.");
            }

            if (isFavorite) {
                setFavoriteRoutines(favoriteRoutines.filter(id => id !== routineId));
            } else {
                setFavoriteRoutines([...favoriteRoutines, routineId]);
            }

        } catch (error) {
            alert(error.message);
        }
    };

    const filteredRoutines =
        selectedMuscleGroup === "all"
            ? routines
            : routines.filter((item) => {
                  const muscle = item.muscle_group?.toLowerCase().trim();
                  return muscle === selectedMuscleGroup;
              });

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="alert alert-info">Cargando rutinas...</div>
            </div>
        );
    }

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
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="mb-0">{item.name}</h5>
                                        {token && user?.role === 'user' && (
                                            <button
                                                className="btn btn-sm border-0 bg-transparent text-warning"
                                                onClick={() => toggleFavorite(item.id)}
                                                title={favoriteRoutines.includes(item.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                                                style={{ fontSize: "1.5rem", padding: "0", lineHeight: 1 }}
                                            >
                                                {favoriteRoutines.includes(item.id) ? "★" : "☆"}
                                            </button>
                                        )}
                                    </div>
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