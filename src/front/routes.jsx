import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./pages/Layout";

import { Home } from "./pages/Home";
import { Signup } from "./pages/signup";
import { Login } from "./pages/login";
import { Private } from "./pages/private";
import { CreateClass } from "./pages/CreateClass";
import { CreateRoutine } from "./pages/CreateRoutine";
import { Classes } from "./pages/Classes";
import { ClassDetails } from "./pages/ClassDetails";
import { Routines } from "./pages/Routines";
import { RoutineDetails } from "./pages/RoutineDetails";
import { EditarPerfil } from "./pages/EditarPerfil";

import { VerPerfil } from "./pages/VerPerfil";
import { Favorites } from "./pages/Favorites";
import { AssignWorkouts } from "./pages/AssignWorkouts";
import { AssignedWorkouts } from "./pages/AssignedWorkouts";


export const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{
				path: "/",
				element: <Navigate to="/login" replace />
			},
			{
				path: "/signup",
				element: <Signup />
			},
			{
				path: "/login",
				element: <Login />
			},
			{
				path: "/private",
				element: <Private />
			},
			{
				path: "/create-class",
				element: <CreateClass />
			},
			{
				path: "/create-routine",
				element: <CreateRoutine />
			},
			{
				path: "/classes",
				element: <Classes />
			},
			{
				path: "/classes/:id",
				element: <ClassDetails />
			},
			{
				path: "/routines",
				element: <Routines />
			},
			{
				path: "/routines/:id",
				element: <RoutineDetails />
			},
			{
				path: "/editar-perfil",
				element: <EditarPerfil />
			},

			{
				path: "/perfil",
				element: <VerPerfil />
			},
			{
				path: "/favorites",
				element: <Favorites />
			},
			{
				path: "/assign-workouts",
				element: <AssignWorkouts />
			},
			{
				path: "/assigned-workouts",
				element: <AssignedWorkouts />
			}
		]
	}
]);
