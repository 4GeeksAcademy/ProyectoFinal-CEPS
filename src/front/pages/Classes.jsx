import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const getYouTubeThumbnail = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : url;
};

export const Classes = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          return;
        }

        const response = await fetch(`${backendUrl}/api/private`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
    };

    fetchClasses();
    fetchUser();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando clases...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Clases disponibles</h2>
        <Link to="/private" className="btn btn-secondary">
          Volver al inicio
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {classes.length === 0 && !loading && !error ? (
        <div className="text-center py-5">
          <i className="fas fa-calendar-times fa-4x text-muted mb-3"></i>
          <h4 className="text-muted">No hay clases disponibles</h4>
          <p className="text-muted">En este momento no hay clases programadas. Vuelve más tarde para ver nuevas clases.</p>
          {user && user.role === "trainer" && (
            <Link to="/create-class" className="btn btn-primary mt-3">
              <i className="fas fa-plus me-2"></i>
              Crear Nueva Clase
            </Link>
          )}
        </div>
      ) : (
        <div className="row">
          {classes.map((item) => (
            <div className="col-md-4 mb-4" key={item.id}>
              <div className="card h-100">
                {item.image_url && (
                  <img
                    src={getYouTubeThumbnail(item.image_url)}
                    className="card-img-top"
                    alt={item.title}
                    style={{ objectFit: "cover", height: "200px" }}
                  />
                )}

                <div className="card-body">
                  <h5>{item.title}</h5>
                  <p><strong>Categoría:</strong> {item.category}</p>
                  <p><strong>Fecha:</strong> {item.date}</p>
                  <p><strong>Entrenador:</strong> {item.trainer_email}</p>
                  <p><strong>Capacidad total:</strong> {item.capacity}</p>
                  <p><strong>Cupos ocupados:</strong> {item.occupied_slots ?? 0}</p>
                  <p><strong>Cupos disponibles:</strong> {item.available_slots ?? item.capacity}</p>

                  <span className={`badge mb-3 ${(item.available_slots ?? item.capacity) > 0 ? "bg-success" : "bg-danger"}`}>
                    {(item.available_slots ?? item.capacity) > 0 ? "Disponible" : "Clase llena"}
                  </span>

                  <div>
                    <Link
                      to={`/classes/${item.id}`}
                      className="btn btn-outline-primary"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};