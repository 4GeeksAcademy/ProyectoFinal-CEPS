import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const Layout = () => {
    const location = useLocation();
    const hideNavbarFooter = location.pathname === "/login" || location.pathname === "/signup";

    return (
        <ScrollToTop>
            {!hideNavbarFooter && <Navbar />}
            <Outlet />
            {!hideNavbarFooter && <Footer />}
        </ScrollToTop>
    );
};