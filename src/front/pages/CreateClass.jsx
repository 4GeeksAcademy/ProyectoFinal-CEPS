import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const CreateClass = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { store } = useGlobalReducer();

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

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, token } = store;

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
      const response = await fetch(`${backendUrl}/api/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Error al crear clase");
      }

      alert("Clase creada exitosamente");
      navigate("/classes");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Crear Clase</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="title" placeholder="Título" value={form.title} onChange={handleChange} required />
        <textarea className="form-control mb-2" name="description" placeholder="Descripción" value={form.description} onChange={handleChange} required />
        <input className="form-control mb-2" name="category" placeholder="Categoría" value={form.category} onChange={handleChange} required />
        <input className="form-control mb-2" type="date" name="date" value={form.date} onChange={handleChange} required />
        <input className="form-control mb-2" type="time" name="time" value={form.time} onChange={handleChange} required />
        <input className="form-control mb-2" type="number" name="duration" placeholder="Duración en minutos" value={form.duration} onChange={handleChange} required />
        <input className="form-control mb-2" type="number" name="capacity" placeholder="Capacidad" value={form.capacity} onChange={handleChange} required />
        <input className="form-control mb-2" name="level" placeholder="Nivel" value={form.level} onChange={handleChange} required />
        <input className="form-control mb-2" name="location" placeholder="Ubicación" value={form.location} onChange={handleChange} />
        <input className="form-control mb-2" name="image_url" placeholder="URL de imagen" value={form.image_url} onChange={handleChange} />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Creando..." : "Crear clase"}
        </button>
        <button type="button" className="btn btn-secondary mx-3" disabled={loading} onClick={() => navigate("/private")}>
          Cancelar
        </button>
      </form>
    </div>
  );
};