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
import { Routines } from "./pages/Routines";

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
				path: "/routines",
				element: <Routines />
			}
		]
	}
]);
