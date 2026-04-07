import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Favorites = () => {
  const { store } = useGlobalReducer();
  const { token } = store;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [favoriteRoutines, setFavoriteRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getFavoriteRoutines = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${backendUrl}/api/favorites_routines`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Error al cargar las rutinas favoritas.");
      }

      const data = await response.json();
      setFavoriteRoutines(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getFavoriteRoutines();
    } else {
      setLoading(false);
    }
  }, [token]);

  const removeFavorite = async (routineId) => {
    try {
      const response = await fetch(`${backendUrl}/api/favorites_routines/${routineId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Error al eliminar de favoritos.");
      }

      setFavoriteRoutines(favoriteRoutines.filter((fav) => fav.routine.id !== routineId));
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <div className="gp-empty-state gp-card">
            <div className="gp-list-spinner"></div>
            <p>Cargando rutinas favoritas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <div className="gp-auth-error">Necesitas iniciar sesión para ver tus favoritos.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="gp-list-page">
      <div className="gp-list-shell">
        <section className="gp-list-hero gp-card">
          <div>
            <div className="gp-eyebrow">FAVORITES</div>
            <h1 className="gp-list-title">RUTINAS FAVORITAS</h1>
            <p className="gp-list-subtitle">
              Guarda tus rutinas preferidas y vuelve a ellas rápidamente cuando quieras entrenar.
            </p>
          </div>

          <div className="gp-list-hero-actions">
            <Link to="/routines" className="gp-btn-primary">
              Ver todas las rutinas
            </Link>
            <Link to="/private" className="gp-btn-secondary">
              Volver
            </Link>
          </div>
        </section>

        {error && <div className="gp-auth-error">{error}</div>}

        {favoriteRoutines.length > 0 ? (
          <section className="gp-classes-grid">
            {favoriteRoutines.map((fav) => (
              <article className="gp-class-card gp-card" key={fav.id}>
                <div className="gp-class-content">
                  <div className="gp-class-meta">
                    <span>Favorita</span>
                    <span>{fav.routine.level}</span>
                  </div>

                  <h3>{fav.routine.name}</h3>

                  <div className="gp-class-info">
                    <div className="gp-class-info-item">
                      <span>Objetivo</span>
                      <strong>{fav.routine.goal}</strong>
                    </div>

                    <div className="gp-class-info-item">
                      <span>Rutina</span>
                      <strong>Guardada en favoritos</strong>
                    </div>
                  </div>

                  <div className="gp-class-actions">
                    <Link to={`/routines/${fav.routine.id}`} className="gp-btn-primary">
                      Ver detalles
                    </Link>

                    <button
                      className="gp-class-delete"
                      onClick={() => removeFavorite(fav.routine.id)}
                      type="button"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="gp-empty-state gp-card">
            <div className="gp-empty-icon">
              <i className="fas fa-star"></i>
            </div>
            <h3>Aún no tienes rutinas favoritas</h3>
            <p>Guarda tus rutinas preferidas para encontrarlas más rápido.</p>
            <Link to="/routines" className="gp-btn-primary">
              Explorar rutinas
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

