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

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.msg || "Error en el servidor. Por favor revisa la terminal del backend.");
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
            <label className="form-label fw-bold">Descripción</label>
          </div>
          <div className="col-md-10">
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} required />
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
            <label className="form-label fw-bold">Duración (minutos)</label>
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
            <label className="form-label fw-bold">URL de Imagen/Video</label>
          </div>
          <div className="col-md-10">
            <input className="form-control" name="image_url" value={form.image_url} onChange={handleChange} />
          </div>
        </div>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success flex-fill py-2" disabled={loading}>
            {loading ? "Creando..." : "Crear Clase"}
          </button>
          <button type="button" className="btn btn-secondary flex-fill py-2" disabled={loading} onClick={() => navigate("/private")}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};