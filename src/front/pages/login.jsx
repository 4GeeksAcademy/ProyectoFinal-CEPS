import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Login = () => {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [keepLoggedIn, setKeepLoggedIn] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password })
            });

            let data = {};
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(data.msg || "Error al iniciar sesión");
            }

            if (keepLoggedIn) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
            } else {
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("user", JSON.stringify(data.user));
            }

            dispatch({
                type: "login",
                payload: {
                    token: data.token,
                    user: data.user
                }
            });

            navigate("/private");
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
                            "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1400&q=80')"
                    }}
                >
                    <div className="gp-auth-visual-overlay"></div>

                    <div className="gp-auth-visual-content">
                        <div className="gp-auth-kicker">
                            <span className="gp-auth-kicker-line"></span>
                            ELITE PERFORMANCE
                        </div>

                        <h1 className="gp-auth-hero">
                            TRAIN
                            <br />
                            WITHOUT
                            <br />
                            <em>LIMITS</em>
                        </h1>

                        <p className="gp-auth-hero-copy">
                            Accede a tu panel, administra tus entrenamientos y lleva tu progreso al siguiente nivel.
                        </p>
                    </div>
                </div>

                <div className="gp-auth-panel">
                    <div className="gp-auth-panel-inner">
                        <div className="gp-auth-brand">GYMPLANNER</div>

                        <h2 className="gp-auth-title">Welcome Back</h2>
                        <p className="gp-auth-subtitle">
                            Ingresa tus credenciales para continuar.
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
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="gp-auth-row">
                                <label className="gp-auth-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={keepLoggedIn}
                                        onChange={(e) => setKeepLoggedIn(e.target.checked)}
                                    />
                                    <span>Mantener sesión iniciada</span>
                                </label>

                                <button
                                    type="button"
                                    className="gp-auth-link-button"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="gp-auth-submit"
                                disabled={loading}
                            >
                                {loading ? "INGRESANDO..." : "INICIAR SESIÓN"}
                            </button>
                        </form>

                        <p className="gp-auth-switch">
                            ¿No tienes cuenta? <Link to="/signup">Regístrate</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};