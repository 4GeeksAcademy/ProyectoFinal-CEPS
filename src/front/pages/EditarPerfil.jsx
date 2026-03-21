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
    const [foto, setFoto] = useState("");

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const token = store.token || sessionStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await fetch(`${backendUrl}/api/profile`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || "Error al cargar perfil");

                const user = data.user;
                setNombre(user.name || "");
                setObjetivos(user.fitness_goals || "");
                setNivel(user.fitness_level || "principiante");
                setFechaNac(user.birth_date || "");
                setTelefono(user.phone || "");
                setFoto(user.avatar_url || "");

            } catch (error) {
                setError(error.message);
            } finally {
                setCargando(false);
            }
        };

        cargarPerfil();
    }, [backendUrl, navigate, store.token]);

    const guardarCambios = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError("");
        setExito("");

        try {
            const token = store.token || sessionStorage.getItem("token");

            const res = await fetch(`${backendUrl}/api/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: nombre,
                    fitness_goals: objetivos,
                    fitness_level: nivel,
                    birth_date: fechaNac,
                    phone: telefono,
                    avatar_url: foto
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Error al guardar");

            setExito("Perfil actualizado");

        } catch (error) {
            setError("Error " + error.message);
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white py-3">
                            <h4 className="mb-0">Editar Perfil</h4>
                        </div>

                        <div className="card-body p-4">

                            {error && <div className="alert alert-danger">{error}</div>}
                            {exito && <div className="alert alert-success">{exito}</div>}

                            {foto && (
                                <div className="text-center mb-4">
                                    <img
                                        src={foto}
                                        alt="Perfil"
                                        className="rounded-circle border"
                                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                                    />
                                </div>
                            )}

                            <form onSubmit={guardarCambios}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Foto URL</label>
                                    <input
                                        type="url"
                                        className="form-control"
                                        placeholder="https://ejemplo.com/foto.jpg"
                                        value={foto}
                                        onChange={(e) => setFoto(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                    />
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Fecha nac.</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={fechaNac}
                                            onChange={(e) => setFechaNac(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Teléfono</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="+### ######"
                                            value={telefono}
                                            onChange={(e) => setTelefono(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nivel</label>
                                    <select
                                        className="form-select"
                                        value={nivel}
                                        onChange={(e) => setNivel(e.target.value)}
                                    >
                                        <option value="principiante">Principiante</option>
                                        <option value="intermedio">Intermedio</option>
                                        <option value="avanzado">Avanzado</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold">Objetivos</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Tus metas fitness..."
                                        value={objetivos}
                                        onChange={(e) => setObjetivos(e.target.value)}
                                    />
                                </div>

                                <div className="d-flex gap-2">
                                    <Link to="/private" className="btn btn-secondary flex-fill">
                                        Volver
                                    </Link>
                                    <button type="submit" className="btn btn-primary flex-fill" disabled={guardando}>
                                        {guardando ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};