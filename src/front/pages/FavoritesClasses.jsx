import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const FavoritesClasses = () => {
  const { store } = useGlobalReducer();
  const { token } = store;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [favoriteClasses, setFavoriteClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getFavoriteClasses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${backendUrl}/api/favorites_classes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar las clases favoritas.");
      }

      const data = await response.json();
      setFavoriteClasses(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getFavoriteClasses();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <div className="gp-empty-state gp-card">
            <div className="gp-list-spinner"></div>
            <p>Cargando clases favoritas...</p>
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
            <h1 className="gp-list-title">CLASES FAVORITAS</h1>
            <p className="gp-list-subtitle">
              Tus clases guardadas para volver más rápido a las sesiones que más te interesan.
            </p>
          </div>

          <div className="gp-list-hero-actions">
            <Link to="/classes" className="gp-btn-primary">
              Ver todas las clases
            </Link>
            <Link to="/private" className="gp-btn-secondary">
              Volver
            </Link>
          </div>
        </section>

        {error && <div className="gp-auth-error">{error}</div>}

        {favoriteClasses.length > 0 ? (
          <section className="gp-classes-grid">
            {favoriteClasses.map((fav) => (
              <article className="gp-class-card gp-card" key={fav.id}>
                <div className="gp-class-content">
                  <div className="gp-class-meta">
                    <span>Favorita</span>
                    <span>Clase</span>
                  </div>

                  <h3>{fav.class_title}</h3>

                  <div className="gp-class-info">
                    <div className="gp-class-info-item">
                      <span>Estado</span>
                      <strong>Guardada en favoritos</strong>
                    </div>
                  </div>

                  <div className="gp-class-actions">
                    <Link to={`/classes/${fav.class_id}`} className="gp-btn-primary">
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="gp-empty-state gp-card">
            <div className="gp-empty-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h3>Aún no has agregado clases favoritas</h3>
            <p>Cuando marques clases como favoritas aparecerán aquí.</p>
            <Link to="/classes" className="gp-btn-primary">
              Explorar clases
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};