import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer'; // Hook para acceder al estado global

export const FavoritesClasses = () => {
  const { store } = useGlobalReducer(); // Usamos el hook para obtener el store global
  const { token } = store; // Sacamos el token del store. ¡Lo necesitaremos para la autorización!
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Estados locales del componente
  const [favoriteClasses, setFavoriteClasses] = useState([]); // Para guardar las clases favoritas
  const [loading, setLoading] = useState(true); // Para mostrar un spinner mientras se cargan los datos
  const [error, setError] = useState(""); // Para mostrar mensajes de error

  // Función para obtener las clases favoritas desde el backend
  const getFavoriteClasses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${backendUrl}/api/favorites_classes`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}` //Enviamos el token para autenticarnos
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar las clases favoritas.");
      }

      const data = await response.json();
      setFavoriteClasses(data); // Guardamos los datos en el estado local del componente
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect se ejecuta cuando el componente se monta o cuando una de sus dependencias cambia.
  // En este caso, queremos que se ejecute cuando el token esté disponible.
  useEffect(() => {
    if (token) {
      getFavoriteClasses();
    } else {
      setLoading(false); // Si no hay token, no hacemos la llamada y dejamos de cargar
    }
  }, [token]); // El array de dependencias. Se volverá a ejecutar si 'token' cambia.


  // ------- Renderizado del componente --------

  if (loading) {
    return <div className="container mt-5 text-center">Cargando...</div>;
  }

  if (!token) {
    return <div className="container mt-5 alert alert-warning">Necesitas iniciar sesión para ver tus favoritos.</div>;
  }

  return (
    <div className="container mt-5">
      <h2>Mis Clases Favoritas</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        {favoriteClasses.length > 0 ? (
          favoriteClasses.map((fav) => (
            <div className="col-md-4 mb-4" key={fav.id}>
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{fav.class_title}</h5>
                  {/* Aquí podrías añadir más detalles de la clase si los devuelves en el serialize del backend */}
                  <Link to={`/classes/${fav.class_id}`} className="btn btn-primary">
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info">
              Aún no has agregado ninguna clase a tus favoritos.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};