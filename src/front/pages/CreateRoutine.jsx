import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const CreateRoutine = () => {
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [form, setForm] = useState({
        name: "",
        description: "",
        goal: "",
        level: "",
        estimated_time: "",
        exercises: "",
        muscle_group: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "trainer") {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    Solo los entrenadores pueden acceder a esta página.
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${backendUrl}/api/routines`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || "Error al crear rutina");
            }

            alert("Rutina creada exitosamente");
            navigate("/routines");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Crear Rutina</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <input
                    className="form-control mb-2"
                    name="name"
                    placeholder="Nombre"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <textarea
                    className="form-control mb-2"
                    name="description"
                    placeholder="Descripción"
                    value={form.description}
                    onChange={handleChange}
                    required
                />

                <input
                    className="form-control mb-2"
                    name="goal"
                    placeholder="Objetivo"
                    value={form.goal}
                    onChange={handleChange}
                    required
                />

                <input
                    className="form-control mb-2"
                    name="level"
                    placeholder="Nivel"
                    value={form.level}
                    onChange={handleChange}
                    required
                />

                <select
                    className="form-control mb-2"
                    name="muscle_group"
                    value={form.muscle_group}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecciona grupo muscular</option>
                    <option value="chest">Pecho</option>
                    <option value="legs">Piernas</option>
                    <option value="back">Espalda</option>
                    <option value="shoulders">Hombros</option>
                    <option value="arms">Brazos</option>
                    <option value="core">Core</option>
                </select>

                <input
                    className="form-control mb-2"
                    type="number"
                    name="estimated_time"
                    placeholder="Tiempo estimado en minutos"
                    value={form.estimated_time}
                    onChange={handleChange}
                    required
                />

                <textarea
                    className="form-control mb-2"
                    name="exercises"
                    placeholder="Ejercicios"
                    value={form.exercises}
                    onChange={handleChange}
                    required
                />

                <button className="btn btn-primary" disabled={loading}>
                    {loading ? "Creando..." : "Crear rutina"}
                </button>

                <button
                    type="button"
                    className="btn btn-secondary mx-3"
                    disabled={loading}
                    onClick={() => navigate("/private")}
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
};