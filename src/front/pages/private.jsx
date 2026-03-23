import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Private = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const { user } = store;

    if (!user) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">Debes iniciar sesión.</div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/login")}
                >
                    Ir a Login
                </button>
            </div>
        );
    }

    const handleLogout = () => {
        dispatch({ type: "logout" });
        navigate("/login");
    };

    return (
        <div className="container mt-5 position-relative pt-5">
            <button
                className="btn btn-danger position-absolute top-0 end-0"
                onClick={handleLogout}
            >
                Cerrar sesión
            </button>

            <h1>Bienvenido</h1>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rol:</strong> {user.role}</p>

            <div className="mt-4">
                <Link to="/classes" className="btn btn-outline-primary me-2">Ver clases</Link>
                <Link to="/routines" className="btn btn-outline-success me-2">Ver rutinas</Link>

                <Link to="/editar-perfil" className="btn btn-warning me-2">
                    Editar perfil
                </Link>

                {user.role === "trainer" && (
                    <>
                        <Link to="/create-class" className="btn btn-primary me-2">Crear clase</Link>
                        <Link to="/create-routine" className="btn btn-success me-2">Crear rutina</Link>
                        <Link to="/assign-workouts" className="btn btn-info me-2">Asignar entrenamientos</Link>
                    </>
                )}
                {user.role === "user" && (
                    <>
                        <Link to="/favorites" className="btn btn-primary me-2">Favoritos</Link>
                        <Link to="/assigned-workouts" className="btn btn-warning me-2">Mis Asignaciones</Link>
                    </>
                )}
            </div>
        </div>
    );
};