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
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <div className="gp-auth-error">
            Solo los entrenadores pueden acceder a esta página.
          </div>
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.msg || "Error al crear la clase");
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
    <div className="gp-list-page">
      <div className="gp-list-shell">
        <section className="gp-list-hero gp-card">
          <div>
            <div className="gp-eyebrow">CREATE SESSION</div>
            <h1 className="gp-list-title">CREAR CLASE</h1>
            <p className="gp-list-subtitle">
              Configura una nueva sesión de entrenamiento, define cupos, nivel,
              ubicación y publica tu clase para los usuarios.
            </p>
          </div>

          <div className="gp-list-hero-actions">
            <button
              type="button"
              className="gp-btn-secondary"
              onClick={() => navigate("/private")}
            >
              Cancelar
            </button>
          </div>
        </section>

        {error && <div className="gp-auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="gp-form gp-card" noValidate>
          <div className="gp-form-section">
            <h3>Información básica</h3>

            <div className="gp-form-grid">
              <div className="gp-form-field">
                <label htmlFor="title">Título</label>
                <input
                  id="title"
                  name="title"
                  placeholder="Título de la clase"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="gp-form-field">
                <label htmlFor="category">Categoría</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Clases de fuerza">Clases de fuerza</option>
                  <option value="Clases de mente, cuerpo y flexibilidad">
                    Clases de mente, cuerpo y flexibilidad
                  </option>
                  <option value="Clases de intervalos de alta intensidad">
                    Clases de intervalos de alta intensidad
                  </option>
                  <option value="Clases de ciclismo en interior">
                    Clases de ciclismo en interior
                  </option>
                  <option value="Clases especializadas">Clases especializadas</option>
                </select>
              </div>
            </div>

            <div className="gp-form-field">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe la clase, objetivos y lo que incluye"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="gp-form-section">
            <h3>Horario</h3>

            <div className="gp-form-grid">
              <div className="gp-form-field">
                <label htmlFor="date">Fecha</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="gp-form-field">
                <label htmlFor="time">Hora</label>
                <input
                  id="time"
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="gp-form-grid">
              <div className="gp-form-field">
                <label htmlFor="duration">Duración (min)</label>
                <input
                  id="duration"
                  type="number"
                  name="duration"
                  placeholder="Ej. 45"
                  value={form.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="gp-form-field">
                <label htmlFor="capacity">Capacidad</label>
                <input
                  id="capacity"
                  type="number"
                  name="capacity"
                  placeholder="Ej. 20"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="gp-form-section">
            <h3>Detalles</h3>

            <div className="gp-form-grid">
              <div className="gp-form-field">
                <label htmlFor="level">Nivel</label>
                <select
                  id="level"
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un nivel</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>

              <div className="gp-form-field">
                <label htmlFor="location">Ubicación</label>
                <input
                  id="location"
                  name="location"
                  placeholder="Ubicación"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="gp-form-field">
              <label htmlFor="image_url">URL de imagen o video</label>
              <input
                id="image_url"
                name="image_url"
                placeholder="Pega una URL de imagen o video"
                value={form.image_url}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="gp-form-actions">
            <button type="submit" className="gp-btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Crear clase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};