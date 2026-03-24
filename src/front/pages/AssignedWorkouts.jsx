import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import {
    initGoogleCalendar,
    requestGoogleAccess,
    createCalendarEvent,
} from "../services/googleCalendar";

export const AssignedWorkouts = () => {
  const { store } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [assignedRoutines, setAssignedRoutines] = useState([]);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [calendarLoadingId, setCalendarLoadingId] = useState(null);

    useEffect(() => {
        const initializeGoogle = async () => {
            try {
                await initGoogleCalendar();
            } catch (err) {
                console.error("Error inicializando Google Calendar:", err);
            }
        };

        initializeGoogle();
    }, []);

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

    const buildDateTime = (dateString, hour = 18, minutes = 0) => {
        if (!dateString) return null;

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;

        date.setHours(hour, minutes, 0, 0);
        return date.toISOString();
    };

    const handleAddClassToCalendar = async (assigned) => {
        try {
            setCalendarLoadingId(`class-${assigned.id}`);

            await requestGoogleAccess();

            const startDateTime =
                buildDateTime(assigned.assigned_date, 18, 0) ||
                new Date().toISOString();

            const endDateTime =
                buildDateTime(assigned.assigned_date, 19, 0) ||
                new Date(Date.now() + 60 * 60 * 1000).toISOString();

            await createCalendarEvent({
                title: `GymPlanner - ${assigned.class?.title || "Clase"}`,
                description: `Clase: ${assigned.class?.description || "Sin descripción"}
Asignado por: ${assigned.trainer_name || "Trainer"}
Fecha: ${assigned.assigned_date || "Sin fecha"}`,
                startDateTime,
                endDateTime,
                timeZone: "America/Bogota",
            });

            alert("Clase agregada al calendario");
        } catch (err) {
            console.error(err);
            alert(err.message || "Error al agregar clase");
        } finally {
            setCalendarLoadingId(null);
        }
    };

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
                                    <div className="d-flex gap-2 flex-wrap mt-2">
                                        <Link
                                            to={`/classes/${assigned.class?.id}`}
                                            className="btn btn-outline-success btn-sm"
                                        >
                                            Ver clase
                                        </Link>

                                        <button
                                            className="btn btn-outline-dark btn-sm"
                                            onClick={() => handleAddClassToCalendar(assigned)}
                                            disabled={calendarLoadingId === `class-${assigned.id}`}
                                        >
                                            {calendarLoadingId === `class-${assigned.id}`
                                                ? "Agregando..."
                                                : "Agregar al calendario"}
                                        </button>
                                    </div>
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
