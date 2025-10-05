import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Lessons from "./pages/Lessons";
import PrivateRoute from "./PrivateRoute";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/" element={<PrivateRoute><Home/></PrivateRoute>}/>
                <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>}/>
                <Route path="/users" element={<PrivateRoute roles={"Администратор"}><Users/></PrivateRoute>}/>
                <Route path="/lessons" element={<PrivateRoute roles={["Администратор", "Преподаватель"]}><Lessons/></PrivateRoute>}/>
            </Routes>
        </Router>
    );
};

export default App;