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
                const token = localStorage.getItem("token");
                if (!token) {
                    window.location.href = "/login";
                    return;
                }

                const res = await fetch(`${backendUrl}/api/attended_classes`, {
                    headers: { "Authorization": `Bearer ${token}` }
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
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2">Cargando historial de clases...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error}</div>
                <Link to="/perfil" className="btn btn-primary">Volver al perfil</Link>
            </div>
        );
    }

    return (
        <div className="container-fluid py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    <div className="bg-white rounded-4 p-4 p-lg-5 shadow-sm">
                        <div className="d-flex align-items-center mb-4">
                            <Link to="/perfil" className="btn btn-outline-secondary me-3">
                                <i className="fas fa-arrow-left"></i>
                            </Link>
                            <h2 className="mb-0">Historial de Clases Asistidas</h2>
                        </div>

                        {attendedClasses.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-calendar-times fa-4x text-muted mb-3"></i>
                                <h4 className="text-muted">No hay historial de clases asistidas</h4>
                                <p className="text-muted">Aún no has asistido a ninguna clase.</p>
                                <Link to="/classes" className="btn btn-primary mt-3">
                                    <i className="fas fa-search me-2"></i>
                                    Explorar Clases Disponibles
                                </Link>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {attendedClasses.map((assigned) => (
                                    <div key={assigned.id} className="col-md-6 col-lg-4">
                                        <div className="card h-100 border-0 shadow-sm">
                                            {assigned.class?.image_url && (
                                                <img
                                                    src={assigned.class.image_url}
                                                    className="card-img-top"
                                                    alt={assigned.class.title}
                                                    style={{ height: "200px", objectFit: "cover" }}
                                                />
                                            )}
                                            <div className="card-body">
                                                <h5 className="card-title">{assigned.class?.title}</h5>
                                                <p className="card-text text-muted small">
                                                    {assigned.class?.description}
                                                </p>
                                                <div className="mb-2">
                                                    <small className="text-muted">
                                                        <i className="fas fa-calendar me-1"></i>
                                                        {assigned.class?.date} - {assigned.class?.time}
                                                    </small>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">
                                                        <i className="fas fa-clock me-1"></i>
                                                        {assigned.class?.duration} minutos
                                                    </small>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">
                                                        <i className="fas fa-user me-1"></i>
                                                        Entrenador: {assigned.trainer_name || "N/A"}
                                                    </small>
                                                </div>
                                                {assigned.attended_date && (
                                                    <div className="mb-2">
                                                        <small className="text-success">
                                                            <i className="fas fa-check-circle me-1"></i>
                                                            Asistida el {assigned.attended_date}
                                                        </small>
                                                    </div>
                                                )}
                                                <span className={`badge ${assigned.class?.level === 'principiante' ? 'bg-success' :
                                                    assigned.class?.level === 'intermedio' ? 'bg-warning' : 'bg-danger'}`}>
                                                    {assigned.class?.level}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};