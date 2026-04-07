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
                const token =
                    localStorage.getItem("token") || sessionStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await fetch(`${backendUrl}/api/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
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
            <div className="gp-list-page">
                <div className="gp-list-shell">
                    <div className="gp-empty-state gp-card">
                        <div className="gp-list-spinner"></div>
                        <p>Cargando perfil...</p>
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
                    <Link to="/private" className="gp-btn-secondary">Volver</Link>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="gp-list-page">
                <div className="gp-list-shell">
                    <div className="gp-auth-error">No se pudo cargar el perfil</div>
                    <Link to="/private" className="gp-btn-secondary">Volver</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="gp-list-page">
            <div className="gp-list-shell">
                <section className="gp-list-hero gp-card">
                    <div>
                        <div className="gp-eyebrow">PROFILE</div>
                        <h1 className="gp-list-title">MI PERFIL</h1>
                        <p className="gp-list-subtitle">
                            Consulta tu información personal y tu configuración de entrenamiento.
                        </p>
                    </div>

                    <div className="gp-list-hero-actions">
                        <Link to="/editar-perfil" className="gp-btn-primary">
                            Editar perfil
                        </Link>
                        <Link to="/private" className="gp-btn-secondary">
                            Volver
                        </Link>
                    </div>
                </section>

                <section className="gp-profile-grid">
                    <article className="gp-profile-main gp-card">
                        <div className="gp-profile-header">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt="Avatar"
                                    className="gp-profile-avatar-image"
                                />
                            ) : (
                                <div className="gp-profile-avatar-fallback">
                                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div>
                                <h2>{user.name || user.email}</h2>
                                <p>{user.role === "trainer" ? "Entrenador" : "Usuario"}</p>
                            </div>
                        </div>

                        <div className="gp-profile-section">
                            <div className="gp-eyebrow">INFORMACIÓN PERSONAL</div>

                            <div className="gp-profile-info-grid">
                                <div className="gp-profile-info-card">
                                    <span>Nombre completo</span>
                                    <strong>{user.name || "No especificado"}</strong>
                                </div>

                                <div className="gp-profile-info-card">
                                    <span>Email</span>
                                    <strong>{user.email}</strong>
                                </div>

                                <div className="gp-profile-info-card">
                                    <span>Teléfono</span>
                                    <strong>{user.phone || "No especificado"}</strong>
                                </div>

                                <div className="gp-profile-info-card">
                                    <span>Fecha de nacimiento</span>
                                    <strong>{user.birth_date || "No especificado"}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="gp-profile-section">
                            <div className="gp-eyebrow">ENTRENAMIENTO</div>

                            <div className="gp-profile-info-grid">
                                <div className="gp-profile-info-card">
                                    <span>Nivel</span>
                                    <strong>
                                        {user.fitness_level === "principiante" && "Principiante"}
                                        {user.fitness_level === "intermedio" && "Intermedio"}
                                        {user.fitness_level === "avanzado" && "Avanzado"}
                                        {!user.fitness_level && "Principiante"}
                                    </strong>
                                </div>

                                <div className="gp-profile-info-card">
                                    <span>Objetivos</span>
                                    <strong>{user.fitness_goals || "No has establecido objetivos"}</strong>
                                </div>
                            </div>
                        </div>
                    </article>

                    <aside className="gp-profile-side gp-card">
                        <div className="gp-eyebrow">ACCESOS</div>
                        <h3>Gestión rápida</h3>
                        <p>Actualiza tu información o revisa tu historial de clases.</p>

                        <div className="gp-profile-actions">
                            <Link to="/editar-perfil" className="gp-btn-primary">
                                Editar perfil
                            </Link>

                            <Link to="/historial-clases" className="gp-btn-secondary">
                                Historial de clases
                            </Link>

                            <Link to="/private" className="gp-btn-secondary">
                                Volver al dashboard
                            </Link>
                        </div>
                    </aside>
                </section>
            </div>
        </div>
    );
};