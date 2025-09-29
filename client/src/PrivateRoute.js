import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, roles }) => {
    const isAuthenticated = sessionStorage.getItem("login") || localStorage.getItem("login");
    const userRole = sessionStorage.getItem("role") || localStorage.getItem("role");

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    if (roles && !roles.includes(userRole)) {
        return <Navigate to="/" replace/>;
    }
        
    return children;
};

export default PrivateRoute;