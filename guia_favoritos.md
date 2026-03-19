# Guía Detallada: Cómo Crear la Función de "Clases Favoritas"

¡Hola! Aquí tienes una guía completa para implementar la funcionalidad de "Clases Favoritas" en tu aplicación. Usaremos como base la lógica que ya tienes para "Rutinas Favoritas" y te explicaré cada paso para que entiendas cómo se conectan el backend y el frontend.

## Resumen de la Tarea

Vamos a crear una nueva página donde el usuario pueda ver una lista de sus clases favoritas. Para esto, necesitamos:
1.  **Backend**: Asegurarnos de que la base de datos y la API puedan manejar el concepto de "clases favoritas". (¡Buena noticia! Esto ya está implementado en tu código).
2.  **Frontend**:
    *   Crear un nuevo componente `FavoritesClasses.jsx` para mostrar las clases favoritas.
    *   Añadir una ruta para que los usuarios puedan navegar a esta página.
    *   Añadir un botón en la página de `Classes.jsx` para que los usuarios puedan marcar una clase como favorita.
    *   Conectar todo para que funcione de forma dinámica.

---

## Paso 1: Entendiendo el Backend (Python, Flask y SQLAlchemy)

Aunque esta parte ya está hecha en tu proyecto, es crucial que la entiendas. Así es como tu backend sabe qué clases son las favoritas de cada usuario.

### a) El Modelo de la Base de Datos (`src/api/models.py`)

Para poder guardar una clase como favorita, necesitamos una "tabla intermedia" en la base de datos que relacione a los usuarios con las clases. En tu archivo `models.py`, esta tabla se llama `Favorites_Classes`.

```python
# src/api/models.py

# ... (otras clases como User, GymClass, etc.)

class Favorites_Classes(db.Model):
    __tablename__ = "favorites_classes"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Foreign Key al usuario que marca la clase como favorita
    user_id : Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    # Foreign Key a la clase que es marcada como favorita
    class_id : Mapped[int] = mapped_column(ForeignKey("gym_class.id"), nullable=False)

    # Estas "relationships" nos ayudan a navegar entre los datos fácilmente.
    # Desde un usuario, puedes ver sus "favorites_classes".
    # Desde una clase, puedes ver por quién ha sido marcada como favorita.
    user = relationship("User", back_populates="favorites_classes")
    gym_class = relationship("GymClass", back_populates="favorites_classes")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "class_id": self.class_id,
            # Incluimos información de la clase para mostrarla en el front
            "class_title": self.gym_class.title if self.gym_class else None
        }

# También, en la clase User, se añade la relación inversa:
class User(db.Model):
    # ...
    favorites_classes = relationship("Favorites_Classes", back_populates="user", cascade="all, delete-orphan")

# Y en la clase GymClass:
class GymClass(db.Model):
    # ...
    favorites_classes = relationship("Favorites_Classes", back_populates="gym_class", cascade="all, delete-orphan")
```

**Explicación:**
*   Cada vez que un usuario marca una clase como favorita, se crea una nueva fila en la tabla `favorites_classes` con el `user_id` de ese usuario y el `class_id` de esa clase.
*   Esto nos permite tener una relación de "muchos a muchos": un usuario puede tener muchas clases favoritas, y una clase puede ser la favorita de muchos usuarios.

### b) Las Rutas de la API (`src/api/routes.py`)

Las rutas de la API (o *endpoints*) son las URLs que el frontend "llama" para pedir o enviar datos al backend. Para la funcionalidad de favoritos, tienes tres rutas clave en `routes.py`:

1.  **`GET /api/favorites_classes`**: Devuelve la lista de clases favoritas del usuario que está logueado.
2.  **`POST /api/favorites_classes/<int:class_id>`**: Añade una clase a la lista de favoritos del usuario.
3.  **`DELETE /api/favorites_classes/<int:class_id>`**: Elimina una clase de la lista de favoritos del usuario.

```python
# src/api/routes.py

# ...

# Endpoint para OBTENER las clases favoritas del usuario actual
@api.route("/favorites_classes", methods=["GET"])
@jwt_required() # <-- Esto protege la ruta, solo usuarios con un token válido pueden acceder
def get_favorites_classes():
    current_user = get_current_user() # Obtenemos el usuario a partir del token JWT

    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"})

    # Buscamos en la BBDD todas las entradas de Favorites_Classes para este usuario
    favorites_classes = Favorites_Classes.query.filter_by(user_id=current_user.id).all()

    # Devolvemos la lista de favoritos serializada (convertida a JSON)
    return jsonify([favorite.serialize() for favorite in favorites_classes]), 200

# Endpoint para AÑADIR una clase a favoritos
@api.route("/favorites_classes/<int:class_id>", methods=["POST"])
@jwt_required()
def add_favotites_classes(class_id):
    current_user = get_current_user()
    # ... (validaciones) ...

    # Creamos la nueva entrada en la tabla de favoritos
    new_class = Favorites_Classes(
        user_id=current_user.id,
        class_id=class_id
    )
    db.session.add(new_class)
    db.session.commit()

    return jsonify({"msg": "Clase agregada a favoritos exitosamente"}), 201

# Endpoint para ELIMINAR una clase de favoritos
@api.route("/favorites_classes/<int:class_id>", methods=["DELETE"])
@jwt_required()
def delete_classes(class_id):
    current_user = get_current_user()
    # ... (validaciones) ...

    # Buscamos la entrada en la tabla de favoritos y la eliminamos
    favorite = Favorites_Classes.query.filter_by(
        user_id=current_user.id,
        class_id=class_id
    ).first()

    # ... (más validaciones) ...

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({"msg": "Clase eliminada exitosamente"}), 200
```

**Explicación y Conexión con el Frontend:**
*   `@jwt_required()`: Este es un decorador que protege la ruta. El frontend deberá enviar un "token de autorización" en cada petición a estas rutas. Si el token no es válido o no se envía, el backend responderá con un error.
*   `get_current_user()`: Esta función extrae el `id` del usuario del token JWT. Así el backend sabe quién está haciendo la petición sin necesidad de que el frontend envíe el ID del usuario en el cuerpo de la petición.

---

## Paso 2: Creando la Página de Clases Favoritas en el Frontend (React)

Ahora vamos a crear la interfaz para que el usuario pueda ver sus clases favoritas.

### a) Crear el archivo `FavoritesClasses.jsx`

Crea un nuevo archivo en `src/front/pages/` llamado `FavoritesClasses.jsx`. Este componente será muy similar a tu `Favorites.jsx` (el de las rutinas).

```jsx
// src/front/pages/FavoritesClasses.jsx

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
          "Authorization": `Bearer ${token}` // ¡Aquí está la magia! Enviamos el token para autenticarnos
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
```

**Explicación de los conceptos clave:**

*   **`useGlobalReducer` y el `store`**: Tu aplicación está envuelta en un `StoreProvider` (en `main.jsx` seguramente). Este provider utiliza la Context API de React para hacer que el `store` (el estado global) esté disponible en cualquier componente que lo necesite. El `store` contiene el `token` y la información del `user` después de hacer login. El hook `useGlobalReducer` es simplemente una forma cómoda de acceder a ese `store` y al `dispatch` sin tener que escribir `useContext(StoreContext)` cada vez.
*   **`useState` vs. `useReducer`/`store`**:
    *   Usamos el **`store` global** para datos que son necesarios en *toda la aplicación*, como el estado de autenticación (`token`, `user`). Si el usuario cierra sesión en un sitio, toda la app debe saberlo.
    *   Usamos **`useState` local** para datos que solo le importan a *este componente*, como la lista de `favoriteClasses`, el estado de `loading` o los `error`. La página `Home` no necesita saber si la página de `FavoritesClasses` está cargando.
*   **`useEffect`**: Este hook es fundamental para realizar "efectos secundarios" en componentes funcionales. Un efecto secundario es cualquier cosa que interactúa con el mundo exterior al componente, como hacer una llamada a una API. El `useEffect` que hemos escrito se ejecuta solo cuando el `token` está disponible, asegurando que no intentamos buscar datos de favoritos si el usuario no ha iniciado sesión.
*   **`fetch` y la conexión con el Backend**: `fetch` es la función del navegador que nos permite hacer peticiones HTTP.
    *   La URL se construye con `backendUrl` (una variable de entorno) y la ruta de la API (`/api/favorites_classes`).
    *   Lo más importante es el objeto `headers`. Le añadimos la cabecera `Authorization` con el valor `Bearer ${token}`. El backend (`@jwt_required()`) buscará esta cabecera, decodificará el token y sabrá qué usuario está haciendo la petición.

### b) Añadir la nueva ruta en `src/front/routes.jsx`

Ahora que el componente está creado, necesitamos que sea accesible a través de una URL.

```jsx
// src/front/routes.jsx

import React from "react";
// ... otros imports
import { Favorites } from "./pages/Favorites";
import { FavoritesClasses } from "./pages/FavoritesClasses"; // 1. Importa tu nuevo componente

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			// ... otras rutas
			{
				path: "/favorites", // Esta es para las rutinas
				element: <Favorites />
			},
            { // 2. Añade la nueva ruta para las clases favoritas
				path: "/favorites-classes",
				element: <FavoritesClasses />
			},
		]
	}
]);
```

### c) Añadir un enlace a la nueva página

Para que el usuario pueda llegar a la nueva página, puedes añadir un enlace en `private.jsx`:

```jsx
// src/front/pages/private.jsx
// ...

// Dentro del return, donde muestras los enlaces
{user.role === "user" && (
    <>
        <Link to="/favorites" className="btn btn-primary me-2">Rutinas Favoritas</Link>
        {/* Añade este nuevo enlace */}
        <Link to="/favorites-classes" className="btn btn-info me-2">Clases Favoritas</Link>
    </>
)}
```

---

## Paso 3: Permitir al Usuario Añadir Clases a Favoritos

El último paso es modificar la página `Classes.jsx` para que el usuario pueda hacer clic en un botón y añadir (o quitar) una clase de sus favoritos.

Esto es un poco más complejo porque implica:
1.  Saber si una clase ya es favorita para mostrar el botón correcto ("Añadir" o "Quitar").
2.  Hacer una petición `POST` o `DELETE` al backend.
3.  Actualizar la UI sin tener que recargar la página.

Aquí te doy una versión simplificada de cómo podrías añadir el botón de "Añadir a Favoritos" en `Classes.jsx`.

```jsx
// src/front/pages/Classes.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from '../hooks/useGlobalReducer'; // Necesitamos el token

export const Classes = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { store } = useGlobalReducer(); // Obtener el store
    const { token } = store; // Y el token

    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ... (el useEffect para fetchClasses que ya tienes)

    // Nueva función para añadir a favoritos
    const handleAddFavorite = async (classId) => {
        if (!token) {
            alert("Necesitas iniciar sesión para añadir a favoritos.");
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/favorites_classes/${classId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Error al añadir a favoritos.");
            }

            alert("¡Clase añadida a favoritos!");
            // Aquí podrías implementar una lógica más avanzada para actualizar el estado
            // y cambiar el botón a "Quitar de favoritos" sin recargar.

        } catch (error) {
            alert(error.message);
        }
    };


    // ... (el return con el loading)

    return (
        <div className="container mt-5">
            {/* ... */}
            <div className="row">
                {classes.map((item) => (
                    <div className="col-md-4 mb-4" key={item.id}>
                        <div className="card h-100">
                            {/* ... (imagen, título, etc) ... */}
                            <div className="card-body">
                                {/* ... */}
                                <Link to={`/classes/${item.id}`} className="btn btn-outline-primary">
                                    Ver detalles
                                </Link>

                                {/* ¡Nuestro nuevo botón! */}
                                <button
                                    className="btn btn-outline-success ms-2"
                                    onClick={() => handleAddFavorite(item.id)}
                                >
                                    Añadir a Fav
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

**Para ir más allá (lógica de añadir/quitar):**

La `handleAddFavorite` de arriba es muy simple. Una implementación completa debería:
1.  Al cargar las clases, también cargar las clases favoritas del usuario.
2.  Guardar los IDs de las clases favoritas en un `Set` o un `Array` en el estado del componente `Classes.jsx`.
3.  Para cada clase que pintas, comprobar si su `id` está en tu lista de favoritos.
4.  Si está, mostrar un botón "Quitar de favoritos" que llame a la ruta `DELETE`.
5.  Si no está, mostrar el botón "Añadir a favoritos" que llame a la ruta `POST`.
6.  Después de cada operación, actualizar tu lista local de favoritos para que el botón cambie al instante.

¡Espero que esta guía te sea de gran ayuda! Has hecho una excelente pregunta y desglosar esto es la mejor manera de entender cómo se construye una aplicación web moderna. Si tienes más dudas, ¡pregunta sin miedo!