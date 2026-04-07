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
                setFotoPreview(user.avatar_url || "");

            } catch (error) {
                setError(error.message);
            } finally {
                setCargando(false);
            }
        };

        cargarPerfil();
    }, [backendUrl, navigate, store.token]);

    const manejarSeleccionFoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(file.type)) {
            setError("Formato no permitido. Use JPG, PNG, GIF o WEBP");
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

        if (fechaNac) {
            const fechaSeleccionada = new Date(fechaNac);
            const fechaActual = new Date();
            const fechaMinima = new Date();
            fechaMinima.setFullYear(fechaActual.getFullYear() - 120);

            if (fechaSeleccionada > fechaActual) {
                setError("La fecha de nacimiento no puede ser futura");
                setGuardando(false);
                return;
            }

            if (fechaSeleccionada < fechaMinima) {
                setError("La fecha de nacimiento no puede ser hace más de 120 años");
                setGuardando(false);
                return;
            }
        }

        try {
            const token = store.token || sessionStorage.getItem("token");

            const formData = new FormData();
            formData.append('name', nombre);
            formData.append('fitness_goals', objetivos);
            formData.append('fitness_level', nivel);
            formData.append('birth_date', fechaNac);
            formData.append('phone', telefono);

            if (fotoFile) {
                formData.append('photo', fotoFile);
            }

            const res = await fetch(`${backendUrl}/api/profile`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.msg || "Error al guardar");

            setExito("Perfil actualizado correctamente");

            if (data.user && data.user.avatar_url) {
                setFotoPreview(data.user.avatar_url);
            }

            setFotoFile(null);

            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            setError("Error: " + error.message);
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

                            <form onSubmit={guardarCambios}>
                                <div className="text-center mb-4">
                                    <div className="position-relative d-inline-block">
                                        {fotoPreview ? (
                                            <img
                                                src={fotoPreview}
                                                alt="Perfil"
                                                className="rounded-circle border"
                                                style={{ width: "120px", height: "120px", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border"
                                                style={{ width: "120px", height: "120px" }}>
                                                <i className="fas fa-user fa-3x text-secondary"></i>
                                            </div>
                                        )}
                                        <label
                                            htmlFor="fotoInput"
                                            className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <i className="fas fa-camera text-white"></i>
                                        </label>
                                    </div>
                                    <input
                                        id="fotoInput"
                                        type="file"
                                        className="d-none"
                                        accept="image/*"
                                        onChange={manejarSeleccionFoto}
                                    />
                                    {fotoFile && (
                                        <div className="mt-2">
                                            <small className="text-success">
                                                ✓ Foto seleccionada: {fotoFile.name}
                                            </small>
                                        </div>
                                    )}
                                    <small className="d-block text-muted mt-1">
                                        JPG, PNG o GIF (max 5MB)
                                    </small>
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