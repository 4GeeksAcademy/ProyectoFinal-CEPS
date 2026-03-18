import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const Private = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">Debes iniciar sesión.</div>
            </div>
        );
    }

    return (
        <div className="container mt-5 position-relative pt-5">
            <button
                className="btn btn-danger position-absolute top-0 end-0"
                onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                }}
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
                    </>
                )}
            </div>
        </div>
    );
};