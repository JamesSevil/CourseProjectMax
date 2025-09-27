import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PrivateRoute from "./PrivateRoute";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<PrivateRoute><Home/></PrivateRoute>}/>
                <Route path="/login" element={<Login/>}/>
            </Routes>
        </Router>
    );
};

export default App;