import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const EditarPerfil = () => {
    const navigate = useNavigate();
    const { store } = useGlobalReducer();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [nombre, setNombre] = useState("");
    const [objetivos, setObjetivos] = useState("");
    const [nivel, setNivel] = useState("principiante");
    const [fechaNac, setFechaNac] = useState("");
    const [telefono, setTelefono] = useState("");
    const [fotoPreview, setFotoPreview] = useState("");
    const [fotoFile, setFotoFile] = useState(null);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const token = store.token || localStorage.getItem("token") || sessionStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await fetch(`${backendUrl}/api/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || "Error al cargar perfil");

                const user = data.user || {};

                setNombre(user.name || "");
                setObjetivos(user.fitness_goals || "");
                setNivel(user.fitness_level || "principiante");
                setFechaNac(user.birth_date || "");
                setTelefono(user.phone || "");
                setFotoPreview(user.avatar_url || "");
            } catch (err) {
                setError(err.message || "No se pudo cargar el perfil");
            } finally {
                setCargando(false);
            }
        };

        cargarPerfil();
    }, [backendUrl, navigate, store.token]);

    const manejarSeleccionFoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const tiposPermitidos = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];

        if (!tiposPermitidos.includes(file.type)) {
            setError("Formato no permitido. Usa JPG, PNG, GIF o WEBP");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("La imagen no debe superar 5MB");
            return;
        }

        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
        setError("");
    };

    const guardarCambios = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError("");
        setExito("");

        try {
            const token = store.token || localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                throw new Error("Sesión no válida");
            }

            const formData = new FormData();
            formData.append("name", nombre);
            formData.append("fitness_goals", objetivos);
            formData.append("fitness_level", nivel);
            formData.append("birth_date", fechaNac);
            formData.append("phone", telefono);

            if (fotoFile) {
                formData.append("photo", fotoFile);
            }

            const res = await fetch(`${backendUrl}/api/profile`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.msg || "Error al guardar");

            setExito("Perfil actualizado correctamente");

            setTimeout(() => {
                navigate("/perfil");
            }, 1000);
        } catch (err) {
            setError(err.message || "No se pudo guardar el perfil");
        } finally {
            setGuardando(false);
        }
    };

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

    return (
        <div className="gp-list-page">
            <div className="gp-list-shell">
                <section className="gp-list-hero gp-card">
                    <div>
                        <div className="gp-eyebrow">PROFILE SETTINGS</div>
                        <h1 className="gp-list-title">EDITAR PERFIL</h1>
                        <p className="gp-list-subtitle">
                            Actualiza tu identidad, datos personales y enfoque de entrenamiento.
                        </p>
                    </div>

                    <div className="gp-list-hero-actions">
                        <Link to="/perfil" className="gp-btn-secondary">
                            Volver al perfil
                        </Link>
                    </div>
                </section>

                {error && <div className="gp-auth-error">{error}</div>}
                {exito && <div className="gp-auth-success">{exito}</div>}

                <form onSubmit={guardarCambios} className="gp-edit-profile-layout">
                    <aside className="gp-edit-profile-side gp-card">
                        <div className="gp-edit-profile-avatar-wrap">
                            {fotoPreview ? (
                                <img
                                    src={fotoPreview}
                                    alt="Perfil"
                                    className="gp-edit-profile-avatar-image"
                                />
                            ) : (
                                <div className="gp-edit-profile-avatar-fallback">
                                    {(nombre || "U").charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="gp-edit-profile-side-copy">
                            <div className="gp-eyebrow">VISUAL IDENTITY</div>
                            <h3>{nombre || "Tu perfil"}</h3>
                            <p>
                                Sube una foto y mantén tu identidad visual alineada con tu perfil.
                            </p>
                        </div>

                        <label className="gp-edit-profile-upload">
                            <span>Cambiar foto</span>
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={manejarSeleccionFoto}
                            />
                        </label>

                        <p className="gp-edit-profile-upload-note">
                            JPG, PNG, GIF o WEBP · máximo 5MB
                        </p>

                        <div className="gp-edit-profile-side-stats">
                            <div className="gp-edit-profile-stat">
                                <span>Estado</span>
                                <strong>Listo para actualizar</strong>
                            </div>

                            <div className="gp-edit-profile-stat">
                                <span>Nivel actual</span>
                                <strong>
                                    {nivel === "principiante" && "Principiante"}
                                    {nivel === "intermedio" && "Intermedio"}
                                    {nivel === "avanzado" && "Avanzado"}
                                </strong>
                            </div>
                        </div>
                    </aside>

                    <section className="gp-edit-profile-main gp-card">
                        <div className="gp-edit-profile-section">
                            <div className="gp-eyebrow">PERSONAL DATA</div>
                            <h3>Información principal</h3>

                            <div className="gp-form-grid">
                                <div className="gp-form-field">
                                    <label>Nombre</label>
                                    <input
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Tu nombre"
                                    />
                                </div>

                                <div className="gp-form-field">
                                    <label>Teléfono</label>
                                    <input
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        placeholder="+57 300 000 0000"
                                    />
                                </div>

                                <div className="gp-form-field">
                                    <label>Fecha de nacimiento</label>
                                    <input
                                        type="date"
                                        value={fechaNac}
                                        onChange={(e) => setFechaNac(e.target.value)}
                                    />
                                </div>

                                <div className="gp-form-field">
                                    <label>Nivel</label>
                                    <select
                                        value={nivel}
                                        onChange={(e) => setNivel(e.target.value)}
                                    >
                                        <option value="principiante">Principiante</option>
                                        <option value="intermedio">Intermedio</option>
                                        <option value="avanzado">Avanzado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="gp-edit-profile-section">
                            <div className="gp-eyebrow">TRAINING FOCUS</div>
                            <h3>Objetivos</h3>

                            <div className="gp-form-field">
                                <label>Metas fitness</label>
                                <textarea
                                    value={objetivos}
                                    onChange={(e) => setObjetivos(e.target.value)}
                                    placeholder="Ej: ganar masa muscular, mejorar resistencia, bajar porcentaje de grasa..."
                                />
                            </div>
                        </div>

                        <div className="gp-edit-profile-actions">
                            <Link to="/perfil" className="gp-edit-profile-btn gp-edit-profile-btn-secondary">
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                className="gp-edit-profile-btn gp-edit-profile-btn-primary"
                                disabled={guardando}
                            >
                                {guardando ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
};