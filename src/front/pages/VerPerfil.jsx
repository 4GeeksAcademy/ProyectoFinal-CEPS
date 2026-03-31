import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";



export const VerPerfil = () => {
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [user, setUser] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await fetch(`${backendUrl}/api/profile`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || "Error cargando perfil");
                setUser(data.user);
            } catch (error) {
                setError(error.message);
            } finally {
                setCargando(false);
            }
        };

        cargarPerfil();
    }, [backendUrl, navigate]);

    if (cargando) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2">Cargando perfil</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{error}</div>
                <Link to="/private" className="btn btn-primary">Volver</Link>
            </div>
        );
    }




    if (!user) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">No se pudo cargar el perfil</div>
                <Link to="/private" className="btn btn-primary">Volver</Link>
            </div>
        );
    }




    return (
        <div className="container-fluid py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    <div className="bg-white rounded-4 p-4 p-lg-5 shadow-sm">
                        <div className="text-center mb-5">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt="Avatar"
                                    className="rounded-circle"
                                    style={{ width: "120px", height: "120px", objectFit: "cover" }}
                                />
                            ) : (
                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                    style={{ width: "120px", height: "120px" }}>
                                    <i className="fas fa-user fa-3x text-secondary"></i>
                                </div>
                            )}
                            <h2 className="mt-3 mb-1">{user.name || user.email}</h2>
                            <p className="text-muted">{user.role === "trainer" ? "Entrenador" : "Usuario"}</p>
                        </div>

                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="border-bottom pb-2 mb-3">
                                    <small className="text-muted text-uppercase">Información personal</small>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Nombre completo</label>
                                    <p className="fs-5 mb-0">{user.name || "No especificado"}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Email</label>
                                    <p className="fs-5 mb-0">{user.email}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Teléfono</label>
                                    <p className="fs-5 mb-0">{user.phone || "No especificado"}</p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Fecha de nacimiento</label>
                                    <p className="fs-5 mb-0">{user.birth_date || "No especificado"}</p>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="border-bottom pb-2 mb-3">
                                    <small className="text-muted text-uppercase">Información de entrenamiento</small>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Nivel</label>
                                    <p className="fs-5 mb-0">
                                        {user.fitness_level === "principiante" && "Principiante"}
                                        {user.fitness_level === "intermedio" && "Intermedio"}
                                        {user.fitness_level === "avanzado" && "Avanzado"}
                                        {!user.fitness_level && "Principiante"}
                                    </p>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Objetivos</label>
                                    <p className="fs-5 mb-0">{user.fitness_goals || "No has establecido objetivos"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex gap-3 mt-5 pt-3">
                            <Link to="/editar-perfil" className="btn btn-primary flex-fill py-2 rounded-pill">
                                <i className="fas fa-edit me-2"></i>
                                Editar Perfil
                            </Link>
                            <Link to="/historial-clases" className="btn btn-outline-info flex-fill py-2 rounded-pill">
                                <i className="fas fa-history me-2"></i>
                                Historial de Clases
                            </Link>
                            <Link to="/private" className="btn btn-outline-secondary flex-fill py-2 rounded-pill">
                                <i className="fas fa-arrow-left me-2"></i>
                                Volver
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};