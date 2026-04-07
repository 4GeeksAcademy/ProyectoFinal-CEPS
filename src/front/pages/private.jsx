import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Private = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();
  const { user } = store;

  if (!user) {
    return (
      <div className="gp-auth-page">
        <div className="gp-auth-shell">
          <div
            className="gp-auth-visual"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1400&q=80')"
            }}
          >
            <div className="gp-auth-visual-overlay"></div>

            <div className="gp-auth-visual-content">
              <div className="gp-auth-kicker">
                <span className="gp-auth-kicker-line"></span>
                PROTECTED ACCESS
              </div>

              <h1 className="gp-auth-hero">
                ACCESS
                <br />
                <em>DENIED</em>
              </h1>

              <p className="gp-auth-hero-copy">
                Debes iniciar sesión para entrar a tu dashboard de entrenamiento.
              </p>
            </div>
          </div>

          <div className="gp-auth-panel">
            <div className="gp-auth-panel-inner">
              <div className="gp-auth-brand">GYMPLANNER</div>
              <h2 className="gp-auth-title">Debes iniciar sesión</h2>
              <p className="gp-auth-subtitle">
                Accede con tu cuenta para ver tu panel privado, clases y rutinas.
              </p>

              <button
                className="gp-auth-submit"
                onClick={() => navigate("/login")}
              >
                IR A LOGIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isTrainer = user.role === "trainer";

  const handleLogout = () => {
    dispatch({ type: "logout" });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const quickActions = isTrainer
    ? [
        {
          title: "Clases",
          description: "Explora clases activas, cupos disponibles y detalles de cada sesión.",
          to: "/classes",
          icon: "fas fa-calendar-alt"
        },
        {
          title: "Rutinas",
          description: "Consulta rutinas, estructura ejercicios y organiza sesiones de entrenamiento.",
          to: "/routines",
          icon: "fas fa-dumbbell"
        },
        {
          title: "Crear clase",
          description: "Publica una nueva clase para tus usuarios y gestiona su disponibilidad.",
          to: "/create-class",
          icon: "fas fa-plus-circle"
        },
        {
          title: "Crear rutina",
          description: "Diseña nuevas rutinas y mantenlas listas para asignar o reutilizar.",
          to: "/create-routine",
          icon: "fas fa-layer-group"
        },
        {
          title: "Asignar entrenamientos",
          description: "Envía rutinas o clases a tus usuarios desde un solo panel central.",
          to: "/assign-workouts",
          icon: "fas fa-bolt"
        },
        {
          title: "Banco Ejercicios",
          description: "Consulta y administra la biblioteca de ejercicios disponibles.",
          to: "/exercises",
          icon: "fas fa-fire"
        },
        {
          title: "Editar perfil",
          description: "Actualiza tu información y mantiene tu cuenta siempre al día.",
          to: "/editar-perfil",
          icon: "fas fa-user-edit"
        }
      ]
    : [
        {
          title: "Clases",
          description: "Descubre clases disponibles, revisa horarios y consulta información detallada.",
          to: "/classes",
          icon: "fas fa-calendar-alt"
        },
        {
          title: "Rutinas",
          description: "Explora rutinas disponibles y mantén tus entrenamientos organizados.",
          to: "/routines",
          icon: "fas fa-dumbbell"
        },
        {
          title: "Favoritos",
          description: "Accede rápido al contenido que guardaste para volver cuando quieras.",
          to: "/favorites",
          icon: "fas fa-star"
        },
        {
          title: "Mis asignaciones",
          description: "Consulta entrenamientos o rutinas que te han sido asignadas.",
          to: "/assigned-workouts",
          icon: "fas fa-clipboard-check"
        },
        {
          title: "Editar perfil",
          description: "Actualiza tus datos y mantén tu cuenta siempre completa.",
          to: "/editar-perfil",
          icon: "fas fa-user-edit"
        }
      ];

  const primaryActions = isTrainer
    ? [
        { label: "Ver clases", to: "/classes", variant: "primary" },
        { label: "Ver rutinas", to: "/routines", variant: "secondary" },
        { label: "Asignar entrenamientos", to: "/assign-workouts", variant: "secondary" }
      ]
    : [
        { label: "Ver clases", to: "/classes", variant: "primary" },
        { label: "Ver rutinas", to: "/routines", variant: "secondary" },
        { label: "Mis asignaciones", to: "/assigned-workouts", variant: "secondary" }
      ];

  return (
    <div className="gp-dashboard-page">
      <section className="gp-dashboard-hero">
        <div className="gp-dashboard-shell">
          <div className="gp-dashboard-grid">
            <div className="gp-dashboard-main gp-card">
              <div className="gp-dashboard-topbar">
                <div>
                  <div className="gp-eyebrow">PRIVATE DASHBOARD</div>
                  <h1 className="gp-dashboard-title">
                    {isTrainer ? "CONTROL DEL ENTRENADOR" : "MI PANEL DE ENTRENAMIENTO"}
                  </h1>
                </div>
              </div>

              <p className="gp-dashboard-copy">
                {isTrainer
                  ? "Gestiona clases, crea rutinas, asigna entrenamientos y administra la experiencia de tus usuarios desde una interfaz clara, moderna y enfocada en performance."
                  : "Consulta tus clases, revisa tus rutinas, administra tus favoritos y mantén tu progreso organizado en un solo lugar."}
              </p>

              <div className="gp-dashboard-actions">
                {primaryActions.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className={action.variant === "primary" ? "gp-btn-primary" : "gp-btn-secondary"}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="gp-dashboard-side gp-card">
              <div className="gp-dashboard-usercard">
                <div className="gp-dashboard-avatar">
                  {(user.email || "U").charAt(0).toUpperCase()}
                </div>

                <div className="gp-dashboard-userinfo">
                  <span className="gp-dashboard-label">Usuario activo</span>
                  <h3>{user.email}</h3>
                  <p>{isTrainer ? "Entrenador" : "Usuario"}</p>
                </div>
              </div>

              <div className="gp-dashboard-divider"></div>

              <div className="gp-dashboard-metrics">
                <div className="gp-dashboard-metric">
                  <span>Rol</span>
                  <strong>{isTrainer ? "Trainer" : "User"}</strong>
                </div>

                <div className="gp-dashboard-metric">
                  <span>Estado</span>
                  <strong>Activo</strong>
                </div>

                <div className="gp-dashboard-metric">
                  <span>Acceso</span>
                  <strong>Habilitado</strong>
                </div>
              </div>

              <div className="gp-dashboard-progress">
                <div className="gp-dashboard-progress-head">
                  <span>Perfil completado</span>
                  <span>88%</span>
                </div>

                <div className="gp-progress">
                  <div className="gp-progress-bar"></div>
                </div>
              </div>

              <Link to="/editar-perfil" className="gp-btn-primary gp-full-width">
                Editar perfil
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="gp-dashboard-section">
        <div className="gp-dashboard-shell">
          <div className="gp-dashboard-section-head">
            <div>
              <div className="gp-eyebrow">QUICK ACTIONS</div>
              <h2 className="gp-section-title">
                {isTrainer ? "GESTIÓN Y CONTROL" : "TU ESPACIO DE ENTRENAMIENTO"}
              </h2>
            </div>
          </div>

          <div className="gp-dashboard-cards">
            {quickActions.map((item) => (
              <Link to={item.to} className="gp-action-card gp-card" key={item.to}>
                <div className="gp-action-icon">
                  <i className={item.icon}></i>
                </div>

                <div className="gp-action-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <div className="gp-action-link">
                  Abrir
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};