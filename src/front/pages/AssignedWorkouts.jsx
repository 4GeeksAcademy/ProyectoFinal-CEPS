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
        const token =
          store.token || localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          setError("No autenticado");
          return;
        }

        const [routinesRes, classesRes] = await Promise.all([
          fetch(`${backendUrl}/api/assigned_routines`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${backendUrl}/api/assigned_classes`, {
            headers: { Authorization: `Bearer ${token}` }
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
        buildDateTime(assigned.assigned_date, 18, 0) || new Date().toISOString();

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
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <div className="gp-empty-state gp-card">
            <div className="gp-list-spinner"></div>
            <p>Cargando asignaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <div className="gp-auth-error">{error}</div>
          <Link to="/private" className="gp-btn-secondary">
            Volver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="gp-list-page">
      <div className="gp-list-shell">
        <section className="gp-list-hero gp-card">
          <div>
            <div className="gp-eyebrow">MY WORKOUTS</div>
            <h1 className="gp-list-title">MIS ASIGNACIONES</h1>
            <p className="gp-list-subtitle">
              Aquí puedes ver todo lo que tu entrenador te asignó y agregar clases al calendario.
            </p>
          </div>

          <div className="gp-list-hero-actions">
            <Link to="/private" className="gp-btn-secondary">
              Volver
            </Link>
          </div>
        </section>

        <section className="gp-assigned-section">
          <div className="gp-assigned-head">
            <div className="gp-eyebrow">RUTINAS</div>
            <h2 className="gp-assign-title">Rutinas asignadas</h2>
          </div>

          {assignedRoutines.length === 0 ? (
            <div className="gp-empty-state gp-card">
              <div className="gp-empty-icon">
                <i className="fas fa-dumbbell"></i>
              </div>
              <h3>No tienes rutinas asignadas</h3>
              <p>Cuando tu entrenador te asigne rutinas aparecerán aquí.</p>
            </div>
          ) : (
            <section className="gp-classes-grid">
              {assignedRoutines.map((assigned) => (
                <article className="gp-class-card gp-card" key={assigned.id}>
                  <div className="gp-class-content">
                    <div className="gp-class-meta">
                      <span>Rutina</span>
                      <span>{assigned.assigned_date || "Sin fecha"}</span>
                    </div>

                    <h3>{assigned.routine?.name}</h3>
                    <p>{assigned.routine?.description}</p>

                    <div className="gp-class-info">
                      <div className="gp-class-info-item">
                        <span>Asignado por</span>
                        <strong>{assigned.trainer_name || "Trainer"}</strong>
                      </div>

                      <div className="gp-class-info-item">
                        <span>Fecha</span>
                        <strong>{assigned.assigned_date || "Sin fecha"}</strong>
                      </div>
                    </div>

                    <div className="gp-class-actions">
                      <Link
                        to={`/routines/${assigned.routine?.id}`}
                        className="gp-btn-primary"
                      >
                        Ver rutina
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </section>

        <section className="gp-assigned-section">
          <div className="gp-assigned-head">
            <div className="gp-eyebrow">CLASES</div>
            <h2 className="gp-assign-title">Clases asignadas</h2>
          </div>

          {assignedClasses.length === 0 ? (
            <div className="gp-empty-state gp-card">
              <div className="gp-empty-icon">
                <i className="fas fa-calendar-times"></i>
              </div>
              <h3>No tienes clases asignadas</h3>
              <p>Cuando tu entrenador te asigne clases aparecerán aquí.</p>
            </div>
          ) : (
            <section className="gp-classes-grid">
              {assignedClasses.map((assigned) => (
                <article className="gp-class-card gp-card" key={assigned.id}>
                  <div className="gp-class-content">
                    <div className="gp-class-meta">
                      <span>Clase</span>
                      <span>{assigned.assigned_date || "Sin fecha"}</span>
                    </div>

                    <h3>{assigned.class?.title}</h3>
                    <p>{assigned.class?.description}</p>

                    <div className="gp-class-info">
                      <div className="gp-class-info-item">
                        <span>Asignado por</span>
                        <strong>{assigned.trainer_name || "Trainer"}</strong>
                      </div>

                      <div className="gp-class-info-item">
                        <span>Fecha</span>
                        <strong>{assigned.assigned_date || "Sin fecha"}</strong>
                      </div>
                    </div>

                    <div className="gp-class-actions">
                      <Link
                        to={`/classes/${assigned.class?.id}`}
                        className="gp-btn-secondary"
                      >
                        Ver clase
                      </Link>

                      <button
                        className="gp-btn-primary"
                        onClick={() => handleAddClassToCalendar(assigned)}
                        disabled={calendarLoadingId === `class-${assigned.id}`}
                        type="button"
                      >
                        {calendarLoadingId === `class-${assigned.id}`
                          ? "Agregando..."
                          : "Agregar al calendario"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </section>
      </div>
    </div>
  );
};