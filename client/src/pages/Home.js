import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [role, setRole] = useState("");
    const [isOpen, setIsOpen] = useState(false); // состояние для выпадающего меню
    const navigate = useNavigate();

    useEffect(() => {
        const storedName = sessionStorage.getItem("name") || localStorage.getItem("name");
        const storedSurname = sessionStorage.getItem("surname") || localStorage.getItem("surname");
        const storedRole = sessionStorage.getItem("role") || localStorage.getItem("role");
        if (storedName || storedSurname) {
            setName(storedName);
            setSurname(storedSurname);
            setRole(storedRole);
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login');
    };


    return (
        <div className="home">
            <div className="relative">
                <button onClick={() => setIsOpen(!isOpen)}>{name && surname ? `${name} ${surname}` : "Профиль"}</button>

                {isOpen && (
                    <div>
                        {role === "Администратор" && (<><button onClick={() => navigate("/users")}>Управление пользователями</button><br/></>)}
                        <button onClick={() => {
                            setIsOpen(false);
                            navigate("/profile");
                        }}>Личный кабинет</button><br/>
                        <button onClick={handleLogout}>Выйти</button>
                    </div>
                )}
            </div>
            
            <h1>LearnProgaMixas</h1>
            <h4>С нами легко!</h4>
            <hr></hr>

            <h3>Список лекций</h3>
        </div>
    );
};

export default Home;
