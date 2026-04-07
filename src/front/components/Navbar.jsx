import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export const Navbar = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const dropdownRef = useRef(null);

	const [user, setUser] = useState(null);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);

	useEffect(() => {
		const localUser = localStorage.getItem("user");
		const sessionUser = sessionStorage.getItem("user");
		const userData = localUser || sessionUser;

		if (userData) {
			try {
				setUser(JSON.parse(userData));
			} catch {
				setUser(null);
			}
		}
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setProfileOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		setMobileOpen(false);
		setProfileOpen(false);
	}, [location.pathname]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		sessionStorage.removeItem("token");
		sessionStorage.removeItem("user");
		navigate("/login");
	};

	const isActive = (path) => location.pathname === path;

	return (
		<header className="gp-navbar-wrap">
			<nav className="gp-navbar">
				<div className="gp-navbar-inner">
					<div className="gp-navbar-left">
						<Link className="gp-navbar-brand" to={user ? "/private" : "/login"}>
							<span className="gp-navbar-brand-icon">
								<i className="fas fa-dumbbell"></i>
							</span>
							<span>GymPlanner</span>
						</Link>
					</div>

					<button
						className="gp-navbar-toggle"
						type="button"
						onClick={() => setMobileOpen(!mobileOpen)}
						aria-label="Abrir menú"
					>
						<i className="fas fa-bars"></i>
					</button>

					<div className={`gp-navbar-center ${mobileOpen ? "is-open" : ""}`}>
						<Link
							className={`gp-navbar-link ${isActive("/private") ? "is-active" : ""}`}
							to="/private"
						>
							Inicio
						</Link>

						{user && (
							<>
								<Link
									className={`gp-navbar-link ${isActive("/classes") ? "is-active" : ""}`}
									to="/classes"
								>
									Clases
								</Link>

								<Link
									className={`gp-navbar-link ${isActive("/routines") ? "is-active" : ""}`}
									to="/routines"
								>
									Rutinas
								</Link>

								{user.role === "trainer" && (
									<>
										<Link
											className={`gp-navbar-link ${isActive("/create-class") ? "is-active" : ""}`}
											to="/create-class"
										>
											Crear Clase
										</Link>

										<Link
											className={`gp-navbar-link ${isActive("/create-routine") ? "is-active" : ""}`}
											to="/create-routine"
										>
											Crear Rutina
										</Link>
									</>
								)}
							</>
						)}
					</div>

					<div className={`gp-navbar-right ${mobileOpen ? "is-open" : ""}`}>
						{user ? (
							<div className="gp-navbar-profile" ref={dropdownRef}>
								<button
									className="gp-navbar-profile-trigger"
									onClick={() => setProfileOpen(!profileOpen)}
									type="button"
								>
									<span className="gp-navbar-profile-avatar">
										{(user.email || "U").charAt(0).toUpperCase()}
									</span>

									<div className="gp-navbar-profile-copy">
										<span className="gp-navbar-profile-label">
											{user.role === "trainer" ? "Entrenador" : "Usuario"}
										</span>
										<strong>{user.name || user.email}</strong>
									</div>

									<i className="fas fa-chevron-down"></i>
								</button>

								{profileOpen && (
									<div className="gp-navbar-dropdown">
										<Link className="gp-navbar-dropdown-item" to="/editar-perfil">
											<i className="fas fa-user-edit"></i>
											<span>Editar perfil</span>
										</Link>

										<Link className="gp-navbar-dropdown-item" to="/perfil">
											<i className="fas fa-id-card"></i>
											<span>Ver perfil</span>
										</Link>

										<button
											className="gp-navbar-dropdown-item is-danger"
											onClick={handleLogout}
											type="button"
										>
											<i className="fas fa-sign-out-alt"></i>
											<span>Cerrar sesión</span>
										</button>
									</div>
								)}
							</div>
						) : (
							<div className="gp-navbar-auth">
								<Link className="gp-navbar-link" to="/login">
									Iniciar sesión
								</Link>
								<Link className="gp-btn-secondary gp-navbar-signup" to="/signup">
									Registrarse
								</Link>
							</div>
						)}
					</div>
				</div>
			</nav>
		</header>
	);
};