import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const isAuthenticated = sessionStorage.getItem("login") || localStorage.getItem("login");

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }
        
    return children;
};

export default PrivateRoute;