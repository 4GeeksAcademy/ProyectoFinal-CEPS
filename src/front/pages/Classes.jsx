import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const getYouTubeThumbnail = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2]?.length === 11 ? match[2] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : url;
};

export const Classes = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { store } = useGlobalReducer();
  const token = store.token;

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingClassId, setDeletingClassId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${backendUrl}/api/classes`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Error al cargar clases");
        }

        setClasses(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const localToken = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!localToken) {
          setUser(null);
          return;
        }

        const response = await fetch(`${backendUrl}/api/private`, {
          headers: { Authorization: `Bearer ${localToken}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    fetchClasses();
    fetchUser();
  }, [backendUrl]);

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("¿Está seguro de eliminar esta clase? Esta acción no se puede deshacer.")) return;

    try {
      setDeletingClassId(classId);
      setError("");

      const response = await fetch(`${backendUrl}/api/classes/${classId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Error al eliminar la clase");

      setClasses(classes.filter((item) => item.id !== classId));
      alert("Clase eliminada exitosamente");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingClassId(null);
    }
  };

  if (loading) {
    return (
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <div className="gp-list-loading gp-card">
            <div className="gp-list-spinner"></div>
            <p>Cargando clases...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gp-list-page">
      <div className="gp-list-shell">
        <section className="gp-list-hero gp-card">
          <div className="gp-list-hero-copy">
            <div className="gp-eyebrow">TRAINING SCHEDULE</div>
            <h1 className="gp-list-title">CLASES DISPONIBLES</h1>
            <p className="gp-list-subtitle">
              Explora sesiones activas, revisa cupos disponibles y entra al detalle de cada clase desde una experiencia más clara y moderna.
            </p>
          </div>

          <div className="gp-list-hero-actions">
            <Link to="/private" className="gp-btn-secondary">
              Volver al dashboard
            </Link>

            {user?.role === "trainer" && (
              <Link to="/create-class" className="gp-btn-primary">
                Crear nueva clase
              </Link>
            )}
          </div>
        </section>

        {error && <div className="gp-auth-error gp-list-error">{error}</div>}

        {classes.length === 0 && !error ? (
          <div className="gp-empty-state gp-card">
            <div className="gp-empty-icon">
              <i className="fas fa-calendar-times"></i>
            </div>
            <h3>No hay clases disponibles</h3>
            <p>
              En este momento no hay clases programadas. Vuelve más tarde para ver nuevas sesiones disponibles.
            </p>

            {user?.role === "trainer" && (
              <Link to="/create-class" className="gp-btn-primary">
                Crear Nueva Clase
              </Link>
            )}
          </div>
        ) : (
          <section className="gp-classes-grid">
            {classes.map((item) => {
              const availableSlots = item.available_slots ?? item.capacity;
              const occupiedSlots = item.occupied_slots ?? 0;
              const isAvailable = availableSlots > 0;
              const imageSrc = item.image_url
                ? getYouTubeThumbnail(item.image_url)
                : "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80";

              return (
                <article className="gp-class-card gp-card" key={item.id}>
                  <div className="gp-class-media">
                    <img src={imageSrc} alt={item.title} />
                    <div className={`gp-class-badge ${isAvailable ? "is-available" : "is-full"}`}>
                      {isAvailable ? "Disponible" : "Clase llena"}
                    </div>
                  </div>

                  <div className="gp-class-content">
                    <div className="gp-class-meta">
                      <span>{item.category || "General"}</span>
                      <span>{item.date || "Fecha por confirmar"}</span>
                    </div>

                    <h3>{item.title}</h3>

                    <div className="gp-class-info">
                      <div className="gp-class-info-item">
                        <span>Entrenador</span>
                        <strong>{item.trainer_email}</strong>
                      </div>

                      <div className="gp-class-info-item">
                        <span>Capacidad total</span>
                        <strong>{item.capacity}</strong>
                      </div>

                      <div className="gp-class-info-item">
                        <span>Cupos ocupados</span>
                        <strong>{occupiedSlots}</strong>
                      </div>

                      <div className="gp-class-info-item">
                        <span>Cupos disponibles</span>
                        <strong>{availableSlots}</strong>
                      </div>
                    </div>

                    <div className="gp-class-actions">
                      <Link to={`/classes/${item.id}`} className="gp-btn-primary">
                        Ver detalles
                      </Link>

                      {user?.role === "trainer" && Number(user?.id) === item.trainer_id && (
                        <>
                          <Link to={`/classes/${item.id}/edit`} className="gp-btn-secondary">
                            Editar
                          </Link>
                          <button
                            className="gp-class-delete"
                            onClick={() => handleDeleteClass(item.id)}
                            disabled={deletingClassId === item.id}
                            type="button"
                          >
                            {deletingClassId === item.id ? "Eliminando..." : "Eliminar"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};