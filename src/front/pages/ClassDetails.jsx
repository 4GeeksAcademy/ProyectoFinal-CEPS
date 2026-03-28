import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const ClassDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [gymClass, setGymClass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [assignedUsers, setAssignedUsers] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [isTrainer, setIsTrainer] = useState(false);

    useEffect(() => {
        const fetchClassData = async () => {
            try {
                setLoading(true);
                setError("");
                setActionMessage("");

                const classResponse = await fetch(`${backendUrl}/api/classes/${id}`);
                const classData = await classResponse.json();

                if (!classResponse.ok) {
                    throw new Error(classData.msg || "Error al cargar la clase");
                }

                setGymClass(classData);

                const token = localStorage.getItem("token") || sessionStorage.getItem("token");

                if (token) {
                    const [assignedResponse, profileResponse] = await Promise.all([
                        fetch(`${backendUrl}/api/classes/${id}/assigned-users`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }),
                        fetch(`${backendUrl}/api/profile`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        })
                    ]);

                    if (assignedResponse.ok) {
                        const assignedData = await assignedResponse.json();
                        setAssignedUsers(assignedData);
                    }

                    if (profileResponse.ok) {
                        const profileData = await profileResponse.json();
                        setCurrentUser(profileData.user);
                        setIsTrainer(profileData.user?.role === "trainer");
                        localStorage.setItem("user_id", profileData.user?.id);
                    }
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClassData();
    }, [backendUrl, id]);

    const isCurrentUserRegistered = assignedUsers.some(
        (assigned) => Number(assigned.user_id) === Number(currentUser?.id)
    );

    const refreshClassData = async () => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        const [updatedClassRes, updatedAssignedRes] = await Promise.all([
            fetch(`${backendUrl}/api/classes/${id}`),
            fetch(`${backendUrl}/api/classes/${id}/assigned-users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        ]);

        if (updatedClassRes.ok) {
            const updatedClass = await updatedClassRes.json();
            setGymClass(updatedClass);
        }

        if (updatedAssignedRes.ok) {
            const updatedAssigned = await updatedAssignedRes.json();
            setAssignedUsers(updatedAssigned);
        }
    };

    const handleRegisterToClass = async () => {
        try {
            setActionMessage("");

            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                setActionMessage("Debes iniciar sesión.");
                return;
            }

            if (!currentUser) {
                setActionMessage("No se pudo identificar al usuario.");
                return;
            }

            setActionLoading(true);

            const response = await fetch(
                `${backendUrl}/api/assigned_classes/${currentUser.id}/${id}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || "Error al registrarte en la clase");
            }

            setActionMessage("Te registraste correctamente en la clase.");
            await refreshClassData();
        } catch (error) {
            setActionMessage(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelRegistration = async () => {
        try {
            setActionMessage("");

            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                setActionMessage("Debes iniciar sesión.");
                return;
            }

            if (!currentUser) {
                setActionMessage("No se pudo identificar al usuario.");
                return;
            }

            setActionLoading(true);

            const response = await fetch(
                `${backendUrl}/api/assigned_classes/${currentUser.id}/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || "Error al cancelar la inscripción");
            }

            setActionMessage("Tu inscripción fue cancelada correctamente.");
            await refreshClassData();
        } catch (error) {
            setActionMessage(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando clase...</p>
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
                    <p><strong>Categoría:</strong> {gymClass.category}</p>
                    <p><strong>Fecha:</strong> {gymClass.date}</p>
                    <p><strong>Hora:</strong> {gymClass.time}</p>
                    <p><strong>Duración:</strong> {gymClass.duration} min</p>
                    <p><strong>Capacidad total:</strong> {gymClass.capacity}</p>
                    <p><strong>Cupos ocupados:</strong> {gymClass.occupied_slots ?? 0}</p>
                    <p><strong>Cupos disponibles:</strong> {gymClass.available_slots ?? gymClass.capacity}</p>
                </div>

                <div className="col-md-6">
                    <p><strong>Nivel:</strong> {gymClass.level}</p>
                    <p><strong>Ubicación:</strong> {gymClass.location || "No especificado"}</p>
                    <p><strong>Entrenador:</strong> {gymClass.trainer_email || "No disponible"}</p>
                </div>
            </div>

            <hr className="my-4" />

            <div className="row">
                <div className="col-md-6">
                    <h4>Usuarios inscritos</h4>

                    {assignedUsers.length === 0 ? (
                        <div className="alert alert-info">Aún no hay usuarios inscritos en esta clase.</div>
                    ) : (
                        <ul className="list-group">
                            {assignedUsers.map((assigned) => (
                                <li
                                    key={assigned.id}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    <div>
                                        <strong>{assigned.user_name || "Sin nombre"}</strong>
                                        <br />
                                        <small>{assigned.user_email}</small>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="col-md-6">
                    <h4>{isTrainer ? "Gestión de la clase" : "Registro a la clase"}</h4>

                    {isCurrentUserRegistered ? (
                        <>
                            <div className="alert alert-success">
                                Ya estás registrado en esta clase.
                            </div>

                            <button
                                className="btn btn-outline-danger"
                                onClick={handleCancelRegistration}
                                disabled={actionLoading}
                            >
                                {actionLoading ? "Cancelando..." : "Cancelar mi inscripción"}
                            </button>
                        </>
                    ) : (gymClass.available_slots ?? gymClass.capacity) <= 0 ? (
                        <div className="alert alert-warning">
                            La clase está llena.
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleRegisterToClass}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Registrando..." : "Registrarme a esta clase"}
                        </button>
                    )}

                    {actionMessage && (
                        <div className="alert alert-info mt-3">
                            {actionMessage}
                        </div>
                    )}
                </div>
            </div>

            <button
                className="btn btn-secondary mt-4"
                onClick={() => navigate(-1)}
            >
                Volver a clases
            </button>
        </div>
    );
};