import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const EditRoutine = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { store } = useGlobalReducer();
    const { user, token } = store;

    const [form, setForm] = useState({
        name: "",
        description: "",
        goal: "",
        level: "",
        estimated_time: "",
        muscle_group: ""
    });
    const [allExercises, setAllExercises] = useState([]);
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [showExerciseSelection, setShowExerciseSelection] = useState(false);
    const [filterZone, setFilterZone] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const [routineRes, exercisesRes] = await Promise.all([
                    fetch(`${backendUrl}/api/routines/${id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }),
                    fetch(`${backendUrl}/api/exercises`)
                ]);

                const routineData = await routineRes.json();
                const exercisesData = await exercisesRes.json();

                if (!routineRes.ok) {
                    throw new Error(routineData.msg || "Error al cargar la rutina");
                }

                if (!user || user.role !== "trainer" || Number(user.id) !== Number(routineData.trainer_id)) {
                    throw new Error("No puedes editar esta rutina");
                }

                setForm({
                    name: routineData.name || "",
                    description: routineData.description || "",
                    goal: routineData.goal || "",
                    level: routineData.level || "",
                    estimated_time: routineData.estimated_time || "",
                    muscle_group: routineData.muscle_group || ""
                });
                setSelectedExercises(routineData.exercises || []);
                setAllExercises(exercisesData || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [backendUrl, id, token, user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddExercise = (exercise) => {
        if (!selectedExercises.find((ex) => ex.id === exercise.id)) {
            setSelectedExercises([...selectedExercises, exercise]);
        }
        setShowExerciseSelection(false);
    };

    const handleRemoveExercise = (id) => {
        setSelectedExercises(selectedExercises.filter((ex) => ex.id !== id));
    };

    const filteredExercises = filterZone
        ? allExercises.filter((ex) => ex.zone.toLowerCase().includes(filterZone.toLowerCase()))
        : allExercises;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        if (selectedExercises.length === 0) {
            setError("Debes seleccionar al menos un ejercicio para la rutina.");
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/routines/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    estimated_time: form.estimated_time,
                    exercises: selectedExercises.map((ex) => ex.id)
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || "Error al actualizar la rutina");
            }

            alert("Rutina actualizada exitosamente");
            navigate("/routines");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!user || user.role !== "trainer") {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">Solo los entrenadores pueden acceder a esta página.</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando rutina...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2>Editar Rutina</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            {showExerciseSelection ? (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Seleccionar Ejercicio</h2>
                        <button className="btn btn-secondary" onClick={() => setShowExerciseSelection(false)}>
                            Volver a la Rutina
                        </button>
                    </div>

                    <input
                        type="text"
                        className="form-control mb-4"
                        placeholder="Filtrar por grupo muscular (Ej: Pecho, Pierna...)"
                        value={filterZone}
                        onChange={(e) => setFilterZone(e.target.value)}
                    />

                    <div className="row">
                        {filteredExercises.map((ex) => (
                            <div className="col-md-4 mb-3" key={ex.id}>
                                <div className="card h-100">
                                    {ex.image_url && (
                                        <img
                                            src={ex.image_url}
                                            alt={ex.name}
                                            className="card-img-top"
                                            style={{ height: "200px", objectFit: "contain" }}
                                        />
                                    )}
                                    <div className="card-body">
                                        <h5 className="card-title">{ex.name}</h5>
                                        <p className="card-text text-muted">Zona: {ex.zone}</p>
                                        <button className="btn btn-outline-success w-100" onClick={() => handleAddExercise(ex)}>
                                            Seleccionar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredExercises.length === 0 && <p className="text-muted">No se encontraron ejercicios para esa zona.</p>}
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="row mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-bold">Nombre</label>
                        </div>
                        <div className="col-md-10">
                            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-bold">Objetivo</label>
                        </div>
                        <div className="col-md-10">
                            <input className="form-control" name="goal" value={form.goal} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-bold">Nivel</label>
                        </div>
                        <div className="col-md-10">
                            <select className="form-select" name="level" value={form.level} onChange={handleChange} required>
                                <option value="" disabled>Selecciona el nivel</option>
                                <option value="Principiante">Principiante</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                            </select>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-bold">Tiempo estimado (min)</label>
                        </div>
                        <div className="col-md-10">
                            <input className="form-control" type="number" name="estimated_time" value={form.estimated_time} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-bold">Grupo muscular</label>
                        </div>
                        <div className="col-md-10">
                            <select className="form-select" name="muscle_group" value={form.muscle_group} onChange={handleChange} required>
                                <option value="" disabled>Selecciona el grupo muscular</option>
                                <option value="chest">Pecho</option>
                                <option value="legs">Piernas</option>
                                <option value="back">Espalda</option>
                                <option value="shoulders">Hombros</option>
                                <option value="arms">Brazos</option>
                                <option value="core">Abdomen</option>
                            </select>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-2">
                            <label className="form-label fw-bold">Descripción</label>
                        </div>
                        <div className="col-md-10">
                            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="card mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Ejercicios Seleccionados ({selectedExercises.length})</h5>
                            <button type="button" className="btn btn-sm btn-success" onClick={() => setShowExerciseSelection(true)}>
                                + Añadir Ejercicio
                            </button>
                        </div>
                        <ul className="list-group list-group-flush">
                            {selectedExercises.map((ex) => (
                                <li key={ex.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <span><strong>{ex.name}</strong> - {ex.zone}</span>
                                    <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemoveExercise(ex.id)}>
                                        Quitar
                                    </button>
                                </li>
                            ))}
                            {selectedExercises.length === 0 && <li className="list-group-item text-muted text-center py-3">Aún no has seleccionado ningún ejercicio</li>}
                        </ul>
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-success flex-fill py-2" disabled={saving}>
                            {saving ? "Guardando..." : "Actualizar Rutina"}
                        </button>
                        <button type="button" className="btn btn-secondary flex-fill py-2" disabled={saving} onClick={() => navigate("/routines")}>
                            Cancelar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
