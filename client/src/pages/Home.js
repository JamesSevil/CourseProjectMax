import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [role, setRole] = useState("");
    const [isOpen, setIsOpen] = useState(false); // состояние для выпадающего меню
    const [lectures, setLectures] = useState([]);
    const [tests, setTests] = useState([]);
    const [finaltests, setFinalTests] = useState([]);
    const [studentprogress, setStudentProgress] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedLogin = sessionStorage.getItem("login") || localStorage.getItem("login");
        const storedName = sessionStorage.getItem("name") || localStorage.getItem("name");
        const storedSurname = sessionStorage.getItem("surname") || localStorage.getItem("surname");
        const storedRole = sessionStorage.getItem("role") || localStorage.getItem("role");
        if (storedName || storedSurname) {
            setName(storedName);
            setSurname(storedSurname);
            setRole(storedRole);
            getStudentProgress(storedLogin);
        }
        getLessons();
    }, []);

    const getLessons = async () => {
        try {
            const response = await axios.get("http://localhost:5000/lessons", {});

            if (response.status === 200 && response.data.success) {
                const lessons = response.data.lessons;
                setLectures(lessons.filter(l => l.type === "Лекция"));
                setTests(lessons.filter(l => l.type === "Тест"));
                setFinalTests(lessons.filter(l => l.type === "Итоговый тест"));
            } else {
                console.error("Ошибка при загрузке учебного материала: ", response.data.message);
                alert(`Не удалось загрузить учебный материал: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при загрузке учебного материала: ", error.response.data.message);
            alert(`Не удалось загрузить учебный материал: ${error.response.data.message}`);
        }
    }

    const getStudentProgress = async (login) => {
        try {
            const response = await axios.get(`http://localhost:5000/progress/${login}`);

            if (response.status === 200 && response.data.success) {
                setStudentProgress(response.data.lessons);
            } else {
                console.error("Ошибка при загрузке прогресса: ", response.data.message);
                alert(`Не удалось загрузить прогресс: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при загрузке прогресса: ", error.response.data.message);
            alert(`Не удалось загрузить прогресс: ${error.response.data.message}`);
        }
    };

    const handleClick = (e, passed, type) => {
        if (type === "Лекция" && passed) {
            e.preventDefault();
            alert("Эта лекция уже пройдена!");
            return;
        }

        if (type === "Тест") {
            // фильтруем все лекции заново прямо в момент клика
            const unpassedLectures = lectures.filter(l => {
                const lp = studentprogress.find(p => String(p.id) === String(l.id));
                return !lp || !lp.passed; // нет прогресса или не пройдена
            });

            if (unpassedLectures.length > 0) {
                e.preventDefault();
                alert("Вы не можете пройти тест, пока не пройдены все лекции!");
                return;
            }

            if (passed) {
                e.preventDefault();
                alert("Этот тест уже пройден!");
                return;
            }
        }
    };



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
                        {(role === "Администратор" || role === "Преподаватель") && (<><button onClick={() => navigate("/lessons")}>Управление лекциями</button><br/></>)}
                        <button onClick={() => {
                            setIsOpen(false);
                            navigate("/profile");
                        }}>Личный кабинет</button><br/>
                        <button onClick={handleLogout}>Выйти</button>
                    </div>
                )}
            </div>
            
            <h2>LearnProgaMixas</h2>
            <h4>С нами легко!</h4>
            <hr></hr>

            <b>Лекции</b><br/>
            {lectures.map(l => {
                const progress = studentprogress.find(p => p.id === l.id);
                return (
                    <div key={l.id}>
                        <Link to={`/lesson/${l.id}`} onClick={(e) => handleClick(e, progress.passed, "Лекция")}>{l.name}</Link> { }
                        {progress 
                            ? `[${progress.passed ? "Пройдена" : "Не пройдена"}]` 
                            : "[Не пройдена]"
                        }
                    </div>
                );
            })}<br/><hr/>


            <b>Лекции</b><br/>
            {tests.map(t => {
                const progress = studentprogress.find(p => p.id === t.id);
                return (
                    <div key={t.id}>
                        <Link to={`/lesson/${t.id}`} onClick={(e) => handleClick(e, progress?.passed, "Тест")}>{t.name}</Link> { }
                        {progress 
                            ? progress.passed ? "[Пройден]" : `[Не пройден] [Попытки: ${progress.attempts}]`
                            : "[Не пройден] [Попытки: 3]"
                        }
                    </div>
                );
            })}<br/><hr/>

            <b>Итоговое тестирование</b><br/>
            {finaltests.map(ft => (
                <div><Link to={`/lesson/${ft.id}`}>{ft.name}</Link></div>
            ))}<br/>
        </div>
    );
};

export default Home;
