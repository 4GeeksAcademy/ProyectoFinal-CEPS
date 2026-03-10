import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Private = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPrivate = async () => {
            const token = localStorage.getItem("token");
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch(`${backendUrl}/api/private`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.msg || "No autorizado");
                }

                setMessage(data.msg);
                setUser(data.user);

            } catch (error) {
                setError(error.message);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            }
        };

        fetchPrivate();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3>Ruta Privada</h3>
                    <button className="btn btn-danger" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    {message && <div className="alert alert-success">{message}</div>}
                    {user && (
                        <div>
                            <p><strong>ID:</strong> {user.id}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};