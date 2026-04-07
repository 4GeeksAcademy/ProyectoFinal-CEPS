import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const Signup = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("user");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, role })
            });

            let data = {};
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(data.msg || "Error al crear el usuario");
            }

            alert("Usuario creado exitosamente");
            navigate("/login");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gp-auth-page">
            <div className="gp-auth-shell">
                <div
                    className="gp-auth-visual"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80')"
                    }}
                >
                    <div className="gp-auth-visual-overlay"></div>

                    <div className="gp-auth-visual-content">
                        <div className="gp-auth-kicker">
                            <span className="gp-auth-kicker-line"></span>
                            BUILD YOUR ROUTINE
                        </div>

                        <h1 className="gp-auth-hero">
                            CREATE
                            <br />
                            YOUR
                            <br />
                            <em>POWER</em>
                        </h1>

                        <p className="gp-auth-hero-copy">
                            Únete a GymPlanner y organiza entrenamientos, clases y progreso en una sola experiencia.
                        </p>
                    </div>
                </div>

                <div className="gp-auth-panel">
                    <div className="gp-auth-panel-inner">
                        <div className="gp-auth-brand">GYMPLANNER</div>

                        <h2 className="gp-auth-title">Crear cuenta</h2>
                        <p className="gp-auth-subtitle">
                            Crea tu cuenta para comenzar a entrenar sin límites.
                        </p>

                        {error && <div className="gp-auth-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="gp-auth-form">
                            <div className="gp-auth-field">
                                <label>Correo</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="gp-auth-field">
                                <label>Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>

                            <div className="gp-auth-field">
                                <label>Confirmar contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Repite tu contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="gp-auth-field">
                                <label>Tipo de cuenta</label>
                                <select
                                    className="gp-auth-select"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="user">Usuario</option>
                                    <option value="trainer">Entrenador</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="gp-auth-submit"
                                disabled={loading}
                            >
                                {loading ? "CREANDO..." : "CREAR CUENTA"}
                            </button>
                        </form>

                        <p className="gp-auth-switch">
                            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};