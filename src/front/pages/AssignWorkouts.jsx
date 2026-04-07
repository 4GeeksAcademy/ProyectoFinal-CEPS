import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AssignWorkouts = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [users, setUsers] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedUserObj = users.find(u => u.id === selectedUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = store.token || sessionStorage.getItem("token");
        if (!token) {
          setError("No autenticado");
          return;
        }

        const usersRes = await fetch(`${backendUrl}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const routinesRes = await fetch(`${backendUrl}/api/routines`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const classesRes = await fetch(`${backendUrl}/api/classes`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.filter((u) => u.role === "user"));
        }

        if (routinesRes.ok) {
          const routinesData = await routinesRes.json();
          setRoutines(routinesData);
        }

        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [backendUrl, store.token]);

  const assignRoutine = async (routineId) => {
    if (!selectedUser) {
      setError("Selecciona un usuario primero");
      return;
    }

    setAssigning(true);
    setError("");
    setSuccess("");

    try {
      const token = store.token || sessionStorage.getItem("token");

      const response = await fetch(
        `${backendUrl}/api/assigned_routines/${selectedUser}/${routineId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg);

      setSuccess("Rutina asignada exitosamente");

    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const assignClass = async (classId) => {
    if (!selectedUser) {
      setError("Selecciona un usuario primero");
      return;
    }

    setAssigning(true);
    setError("");
    setSuccess("");

    try {
      const token = store.token || sessionStorage.getItem("token");

      const response = await fetch(
        `${backendUrl}/api/assigned_classes/${selectedUser}/${classId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg);

      setSuccess("Clase asignada exitosamente");

    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="gp-list-page">
        <div className="gp-list-shell">
          <div className="gp-empty-state gp-card">
            <h3>Cargando datos...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gp-list-page">
      <div className="gp-list-shell">

        {/* HERO */}
        <section className="gp-list-hero gp-card">
          <div>
            <div className="gp-eyebrow">ASSIGN WORKOUTS</div>
            <h1 className="gp-list-title">ASIGNAR ENTRENAMIENTOS</h1>
            <p className="gp-list-subtitle">
              Asigna rutinas y clases a tus usuarios desde un solo panel.
            </p>
          </div>

          <div className="gp-list-hero-actions">
            <button
              className="gp-btn-secondary"
              onClick={() => navigate("/private")}
            >
              Volver
            </button>
          </div>
        </section>

        {error && <div className="gp-auth-error">{error}</div>}
        {success && <div className="gp-success">{success}</div>}

        {/* SELECT USER */}
        <section className="gp-assign-user-card gp-card">
          <div className="gp-assign-user-copy">
            <div className="gp-eyebrow">SELECCIONAR USUARIO</div>
            <h3>Elige a quién quieres asignarle contenido</h3>
            <p>
              Selecciona un usuario antes de asignar una rutina o una clase.
            </p>
          </div>

          <div className="gp-assign-user-control">
            <label>Usuario</label>

            <div className="gp-custom-select">
              <button
                className="gp-custom-select-trigger"
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                {selectedUserObj
                  ? (selectedUserObj.name || selectedUserObj.email)
                  : "Seleccionar usuario"}

                <span className={`gp-chevron ${openDropdown ? "open" : ""}`}>
                  ▼
                </span>
              </button>

              {openDropdown && (
                <div className="gp-custom-select-menu">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="gp-custom-select-item"
                      onClick={() => {
                        setSelectedUser(user.id);
                        setOpenDropdown(false);
                      }}
                    >
                      {user.name || user.email}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RUTINAS */}
        <section className="gp-assign-section">
          <div className="gp-assign-section-head">
            <div className="gp-eyebrow">RUTINAS</div>
            <h2 className="gp-assign-title">Rutinas disponibles</h2>
          </div>

          <section className="gp-classes-grid">
            {routines.map((routine) => (
              <article className="gp-class-card gp-card" key={routine.id}>
                <div className="gp-class-content">
                  <div className="gp-class-meta"><span>Rutina</span></div>
                  <h3>{routine.name}</h3>
                  <p>{routine.description}</p>

                  <button
                    className="gp-btn-primary"
                    onClick={() => assignRoutine(routine.id)}
                    disabled={assigning || !selectedUser}
                  >
                    {assigning ? "Asignando..." : "Asignar rutina"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        </section>

        {/* CLASES */}
        <section className="gp-assign-section">
          <div className="gp-assign-section-head">
            <div className="gp-eyebrow">CLASES</div>
            <h2 className="gp-assign-title">Clases disponibles</h2>
          </div>

          <section className="gp-classes-grid">
            {classes.map((gymClass) => (
              <article className="gp-class-card gp-card" key={gymClass.id}>
                <div className="gp-class-content">
                  <div className="gp-class-meta"><span>Clase</span></div>
                  <h3>{gymClass.title}</h3>
                  <p>{gymClass.description}</p>

                  <button
                    className="gp-btn-primary"
                    onClick={() => assignClass(gymClass.id)}
                    disabled={assigning || !selectedUser}
                  >
                    {assigning ? "Asignando..." : "Asignar clase"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        </section>

      </div>
    </div>
  );
};