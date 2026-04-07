import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const HistoryClasses = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [attendedClasses, setAttendedClasses] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarHistorial = async () => {
            try {
                const token =
                    localStorage.getItem("token") || sessionStorage.getItem("token");

                if (!token) {
                    window.location.href = "/login";
                    return;
                }

                const res = await fetch(`${backendUrl}/api/attended_classes`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || "Error cargando historial");
                setAttendedClasses(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setCargando(false);
            }
        };

        cargarHistorial();
    }, [backendUrl]);

    if (cargando) {
        return (
            <div className="gp-list-page">
                <div className="gp-list-shell">
                    <div className="gp-empty-state gp-card">
                        <div className="gp-list-spinner"></div>
                        <p>Cargando historial de clases...</p>
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
                    <Link to="/perfil" className="gp-btn-secondary">Volver al perfil</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="gp-list-page">
            <div className="gp-list-shell">
                <section className="gp-list-hero gp-card">
                    <div>
                        <div className="gp-eyebrow">CLASS HISTORY</div>
                        <h1 className="gp-list-title">HISTORIAL DE CLASES</h1>
                        <p className="gp-list-subtitle">
                            Revisa las clases a las que ya asististe y mantén visible tu recorrido de entrenamiento.
                        </p>
                    </div>

                    <div className="gp-list-hero-actions">
                        <Link to="/perfil" className="gp-btn-secondary">
                            Volver al perfil
                        </Link>
                    </div>
                </section>

                {attendedClasses.length === 0 ? (
                    <div className="gp-empty-state gp-card">
                        <div className="gp-empty-icon">
                            <i className="fas fa-calendar-times"></i>
                        </div>
                        <h3>No hay historial de clases asistidas</h3>
                        <p>Aún no has asistido a ninguna clase.</p>
                        <Link to="/classes" className="gp-btn-primary">
                            Explorar clases disponibles
                        </Link>
                    </div>
                ) : (
                    <section className="gp-classes-grid">
                        {attendedClasses.map((assigned) => (
                            <article className="gp-class-card gp-card" key={assigned.id}>
                                {assigned.class?.image_url ? (
                                    <div className="gp-class-media">
                                        <img
                                            src={assigned.class.image_url}
                                            alt={assigned.class.title}
                                        />
                                    </div>
                                ) : null}

                                <div className="gp-class-content">
                                    <div className="gp-class-meta">
                                        <span>{assigned.class?.level || "General"}</span>
                                        <span>Asistida</span>
                                    </div>

                                    <h3>{assigned.class?.title}</h3>
                                    <p>{assigned.class?.description}</p>

                                    <div className="gp-class-info">
                                        <div className="gp-class-info-item">
                                            <span>Fecha</span>
                                            <strong>{assigned.class?.date} - {assigned.class?.time}</strong>
                                        </div>

                                        <div className="gp-class-info-item">
                                            <span>Duración</span>
                                            <strong>{assigned.class?.duration} min</strong>
                                        </div>

                                        <div className="gp-class-info-item">
                                            <span>Entrenador</span>
                                            <strong>{assigned.trainer_name || "N/A"}</strong>
                                        </div>

                                        <div className="gp-class-info-item">
                                            <span>Asistencia</span>
                                            <strong>{assigned.attended_date || "Registrada"}</strong>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
};