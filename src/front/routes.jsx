import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./pages/Layout";

import { Home } from "./pages/Home";
import { Signup } from "./pages/signup";
import { Login } from "./pages/login";
import { Private } from "./pages/private";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{
				path: "/",
				element: <Home />
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
			}
		]
	}
]);