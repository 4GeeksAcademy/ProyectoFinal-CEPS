import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const EditClass = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { store } = useGlobalReducer();
    const { user, token } = store;

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        date: "",
        time: "",
        duration: "",
        capacity: "",
        level: "",
        location: "",
        image_url: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchClass = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${backendUrl}/api/classes/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.msg || "Error al cargar la clase");
                }

                if (data.trainer_id !== user?.id) {
                    throw new Error("No puedes editar esta clase");
                }

                setForm({
                    title: data.title || "",
                    description: data.description || "",
                    category: data.category || "",
                    date: data.date || "",
                    time: data.time || "",
                    duration: data.duration || "",
                    capacity: data.capacity || "",
                    level: data.level || "",
                    location: data.location || "",
                    image_url: data.image_url || ""
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (!user || !token) {
            setLoading(false);
            return;
        }

        fetchClass();
    }, [backendUrl, id, token, user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const response = await fetch(`${backendUrl}/api/classes/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || "Error al actualizar la clase");
            }

            alert("Clase actualizada exitosamente");
            navigate("/classes");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!user || user.role !== "trainer") {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">Solo los entrenadores pueden acceder a esta página.</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando datos de la clase...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2>Editar Clase</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-4">
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Título</label>
                    </div>
                    <div className="col-md-10">
                        <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Categoría</label>
                    </div>
                    <div className="col-md-10">
                        <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
                            <option value="" disabled>Selecciona la categoría</option>
                            <option value="Clases de fuerza">Clases de fuerza</option>
                            <option value="Clases de mente, cuerpo y flexibilidad">Clases de mente, cuerpo y flexibilidad</option>
                            <option value="Clases de intervalos de alta intensidad">Clases de intervalos de alta intensidad</option>
                            <option value="Clases de ciclismo en interior">Clases de ciclismo en interior</option>
                            <option value="Clases especializadas">Clases especializadas</option>
                        </select>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Fecha</label>
                    </div>
                    <div className="col-md-10">
                        <input className="form-control" type="date" name="date" value={form.date} onChange={handleChange} required />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Hora</label>
                    </div>
                    <div className="col-md-10">
                        <input className="form-control" type="time" name="time" value={form.time} onChange={handleChange} required />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Duración (min)</label>
                    </div>
                    <div className="col-md-10">
                        <input className="form-control" type="number" name="duration" value={form.duration} onChange={handleChange} required />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Capacidad</label>
                    </div>
                    <div className="col-md-10">
                        <input className="form-control" type="number" name="capacity" value={form.capacity} onChange={handleChange} required />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Nivel</label>
                    </div>
                    <div className="col-md-10">
                        <select className="form-select" name="level" value={form.level} onChange={handleChange} required>
                            <option value="" disabled>Selecciona el nivel</option>
                            <option value="Principiante">Principiante</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Avanzado">Avanzado</option>
                        </select>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Ubicación</label>
                    </div>
                    <div className="col-md-10">
                        <input className="form-control" name="location" value={form.location} onChange={handleChange} />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Descripción</label>
                    </div>
                    <div className="col-md-10">
                        <textarea className="form-control" name="description" value={form.description} onChange={handleChange} required />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-2">
                        <label className="form-label fw-bold">URL de imagen/video</label>
                    </div>
                    <div className="col-md-10">
                        <input className="form-control" name="image_url" value={form.image_url} onChange={handleChange} />
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-success flex-fill py-2" disabled={saving}>
                        {saving ? "Guardando..." : "Actualizar Clase"}
                    </button>
                    <button type="button" className="btn btn-secondary flex-fill py-2" disabled={saving} onClick={() => navigate("/classes")}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};
