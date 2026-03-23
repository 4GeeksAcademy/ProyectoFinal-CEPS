import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const AssignWorkouts = () => {
    const { store } = useGlobalReducer();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [users, setUsers] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = store.token || sessionStorage.getItem("token");
                if (!token) {
                    setError("No autenticado");
                    return;
                }

                // Fetch users (only regular users)
                const usersRes = await fetch(`${backendUrl}/api/users`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                // Fetch routines created by current trainer
                const routinesRes = await fetch(`${backendUrl}/api/routines`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                // Fetch classes created by current trainer
                const classesRes = await fetch(`${backendUrl}/api/classes`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setUsers(usersData.filter(user => user.role === "user"));
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

            const response = await fetch(`${backendUrl}/api/assigned_routines/${selectedUser}/${routineId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || "Error al asignar rutina");
            }

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

            const response = await fetch(`${backendUrl}/api/assigned_classes/${selectedUser}/${classId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || "Error al asignar clase");
            }

            setSuccess("Clase asignada exitosamente");
        } catch (err) {
            setError(err.message);
        } finally {
            setAssigning(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2">Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Asignar Rutinas y Clases</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="mb-4">
                <label className="form-label">Seleccionar Usuario:</label>
                <select
                    className="form-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                >
                    <option value="">-- Seleccionar usuario --</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name || user.email}
                        </option>
                    ))}
                </select>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <h3>Rutinas Disponibles</h3>
                    {routines.length === 0 ? (
                        <p>No has creado rutinas aún. <Link to="/create-routine">Crear rutina</Link></p>
                    ) : (
                        <div className="list-group">
                            {routines.map((routine) => (
                                <div key={routine.id} className="list-group-item">
                                    <h5>{routine.name}</h5>
                                    <p>{routine.description}</p>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => assignRoutine(routine.id)}
                                        disabled={assigning || !selectedUser}
                                    >
                                        {assigning ? "Asignando..." : "Asignar"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-md-6">
                    <h3>Clases Disponibles</h3>
                    {classes.length === 0 ? (
                        <p>No has creado clases aún. <Link to="/create-class">Crear clase</Link></p>
                    ) : (
                        <div className="list-group">
                            {classes.map((gymClass) => (
                                <div key={gymClass.id} className="list-group-item">
                                    <h5>{gymClass.title}</h5>
                                    <p>{gymClass.description}</p>
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => assignClass(gymClass.id)}
                                        disabled={assigning || !selectedUser}
                                    >
                                        {assigning ? "Asignando..." : "Asignar"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <Link to="/private" className="btn btn-secondary">Volver al perfil</Link>
            </div>
        </div>
    );
};