import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const userData = localStorage.getItem("user");
		if (userData) {
			setUser(JSON.parse(userData));
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		navigate("/login");
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
			<div className="container">
				<Link className="navbar-brand fw-bold" to="/private">
					<i className="fas fa-dumbbell me-2"></i>
					GymPlanner
				</Link>

				<button
					className="navbar-toggler"
					type="button"
					onClick={() => setIsOpen(!isOpen)}
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
					<ul className="navbar-nav me-auto mb-2 mb-lg-0">
						<li className="nav-item">
							<Link className="nav-link" to="/private">
								<i className="fas fa-home me-1"></i>
								Inicio
							</Link>
						</li>
						{user && (
							<>
								<li className="nav-item">
									<Link className="nav-link" to="/classes">
										<i className="fas fa-calendar-alt me-1"></i>
										Clases
									</Link>
								</li>
								<li className="nav-item">
									<Link className="nav-link" to="/routines">
										<i className="fas fa-dumbbell me-1"></i>
										Rutinas
									</Link>
								</li>
								{user.role === "trainer" && (
									<>
										<li className="nav-item">
											<Link className="nav-link" to="/create-class">
												<i className="fas fa-plus-circle me-1"></i>
												Crear Clase
											</Link>
										</li>
										<li className="nav-item">
											<Link className="nav-link" to="/create-routine">
												<i className="fas fa-plus-circle me-1"></i>
												Crear Rutina
											</Link>
										</li>
									</>
								)}
							</>
						)}
					</ul>

					{user ? (
						<ul className="navbar-nav ms-auto mb-2 mb-lg-0">
							<li className="nav-item dropdown">
								<button
									className="nav-link dropdown-toggle btn btn-link text-white"
									onClick={() => setIsOpen(!isOpen)}
									data-bs-toggle="dropdown"
									style={{ cursor: "pointer" }}
								>
									<i className="fas fa-user-circle me-1"></i>
									{user.name || user.email}
								</button>
								<ul className="dropdown-menu dropdown-menu-end">
									<li>
										<Link className="dropdown-item" to="/editar-perfil">
											<i className="fas fa-user-edit me-2"></i>
											Editar Perfil
										</Link>
									</li>
									<li>
										<Link className="dropdown-item" to="/perfil">
											<i className="fas fa-id-card me-2"></i>
											Ver Perfil
										</Link>
									</li>
									<li><hr className="dropdown-divider" /></li>
									<li>
										<button className="dropdown-item text-danger" onClick={handleLogout}>
											<i className="fas fa-sign-out-alt me-2"></i>
											Cerrar Sesión
										</button>
									</li>
								</ul>
							</li>
						</ul>
					) : (
						<ul className="navbar-nav ms-auto mb-2 mb-lg-0">
							<li className="nav-item">
								<Link className="nav-link" to="/login">
									<i className="fas fa-sign-in-alt me-1"></i>
									Iniciar Sesión
								</Link>
							</li>
							<li className="nav-item">
								<Link className="nav-link btn btn-outline-light rounded-pill px-3" to="/signup">
									<i className="fas fa-user-plus me-1"></i>
									Registrarse
								</Link>
							</li>
						</ul>
					)}
				</div>
			</div>
		</nav>
	);
};