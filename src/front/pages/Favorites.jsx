import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer'; // Correct hook for global state

export const Favorites = () => {
  const { store } = useGlobalReducer(); // Use the global reducer hook
  const { token } = store;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [favoriteRoutines, setFavoriteRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // OBTENER rutinas favoritas del usuario
  const getFavoriteRoutines = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${backendUrl}/api/favorites_routines`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
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

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Necesitas iniciar sesión para ver tus favoritos.</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Mis Rutinas Favoritas</h2>
        <Link to="/routines" className="btn btn-outline-primary">
          Ver todas las rutinas
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {!loading && favoriteRoutines.length > 0 ? (
          favoriteRoutines.map((fav) => (
            <div className="col-md-6 col-lg-4 mb-4" key={fav.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{fav.routine.name}</h5>
                  <p className="card-text"><strong>Objetivo:</strong> {fav.routine.goal}</p>
                  <p className="card-text"><strong>Nivel:</strong> {fav.routine.level}</p>
                  <div className="mt-auto">
                    <Link
                      to={`/routines/${fav.routine.id}`}
                      className="btn btn-primary"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            {!loading && !error && (
              <div className="alert alert-info">
                Aún no has agregado ninguna rutina a tus favoritos.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
