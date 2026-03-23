import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AssignedWorkouts = () => {
    const { store } = useGlobalReducer();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [assignedRoutines, setAssignedRoutines] = useState([]);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAssignedWorkouts = async () => {
            try {
                const token = store.token || sessionStorage.getItem("token");
                if (!token) {
                    setError("No autenticado");
                    return;
                }

                const [routinesRes, classesRes] = await Promise.all([
                    fetch(`${backendUrl}/api/assigned_routines`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    }),
                    fetch(`${backendUrl}/api/assigned_classes`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                ]);

                if (routinesRes.ok) {
                    const routinesData = await routinesRes.json();
                    setAssignedRoutines(routinesData);
                }

                if (classesRes.ok) {
                    const classesData = await classesRes.json();
                    setAssignedClasses(classesData);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedWorkouts();
    }, [backendUrl, store.token]);

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2">Cargando asignaciones...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error}</div>
                <Link to="/private" className="btn btn-secondary">Volver al perfil</Link>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Mis Asignaciones</h2>

            <div className="row">
                <div className="col-md-6">
                    <h3>Rutinas Asignadas</h3>
                    {assignedRoutines.length === 0 ? (
                        <div className="alert alert-info">No tienes rutinas asignadas aún.</div>
                    ) : (
                        <div className="list-group">
                            {assignedRoutines.map((assigned) => (
                                <div key={assigned.id} className="list-group-item">
                                    <h5>{assigned.routine?.name}</h5>
                                    <p>{assigned.routine?.description}</p>
                                    <small className="text-muted">
                                        Asignado por: {assigned.trainer_name} | Fecha: {assigned.assigned_date}
                                    </small>
                                    <br />
                                    <Link
                                        to={`/routines/${assigned.routine?.id}`}
                                        className="btn btn-outline-primary btn-sm mt-2"
                                    >
                                        Ver rutina
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-md-6">
                    <h3>Clases Asignadas</h3>
                    {assignedClasses.length === 0 ? (
                        <div className="alert alert-info">No tienes clases asignadas aún.</div>
                    ) : (
                        <div className="list-group">
                            {assignedClasses.map((assigned) => (
                                <div key={assigned.id} className="list-group-item">
                                    <h5>{assigned.class?.title}</h5>
                                    <p>{assigned.class?.description}</p>
                                    <small className="text-muted">
                                        Asignado por: {assigned.trainer_name} | Fecha: {assigned.assigned_date}
                                    </small>
                                    <br />
                                    <Link
                                        to={`/classes/${assigned.class?.id}`}
                                        className="btn btn-outline-success btn-sm mt-2"
                                    >
                                        Ver clase
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <Link to="/private" className="btn btn-secondary">Volver al perfil</Link>
            </div>
        </div>
    );
};