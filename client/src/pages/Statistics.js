import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/statistics.css";

const Statistics = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [lectures, setLectures] = useState([]);
    const [tests, setTests] = useState([]);
    const [finaltests, setFinalTests] = useState([]);
    const [studentprogress, setStudentProgress] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getUsers();
        getLessons();
    }, []);

    const getUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/users/students", {});

            if (response.status === 200 && response.data.success) {
                setUsers(response.data.users);
            } else {
                console.error("Ошибка при загрузке пользователей: ", response.data.message);
                alert(`Не удалось загрузить пользователей: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при загрузке пользователей: ", error.response.data.message);
            alert(`Не удалось загрузить пользователей: ${error.response.data.message}`);
        }
    };

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
    
    const openModal = (user) => {
        if (!showModal) {
            setShowModal(true);
            getStudentProgress(user);
        }
    };

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

    return (
        <div className="statistics">
            <b>Список студентов</b><br/>
            {users.length === 0 ? (
                <p>Студенты не найдены</p>
            ) : (
                <table border="1" cellPadding="5" cellSpacing="0">
                <thead><tr>
                    <th>Имя</th>
                    <th>Фамилия</th>
                    <th>Действие</th>
                    </tr></thead>
                <tbody>{users.map((user, index) => (
                    <tr key={index}>
                        <td>{user.name}</td>
                        <td>{user.surname}</td>
                        <td><button onClick={() => openModal(user.login)}>Прогресс</button></td>
                    </tr>
                ))}</tbody></table>)}

                {showModal && (
                    <div className="modal" style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "white",
                        padding: "20px",
                        border: "1px solid black",
                        zIndex: 1000}}>
                        <b>Прогресс студента</b><br/><br/><hr></hr>
                        <div> 
                            <b>Лекции</b>
                            {lectures.map(l => {
                                const progress = studentprogress?.find(p => p.id === l.id);
                                return (
                                    <div key={l.id}>
                                        {l.name} { }
                                        {progress 
                                            ? `[${progress.passed ? "Пройдена" : "Не пройдена"}]` 
                                            : "[Не пройдена]"
                                        }
                                    </div>
                                );
                            })}<hr/>

                            <b>Тесты</b>
                            {tests.map(t => {
                                const progress = studentprogress?.find(p => p.id === t.id);
                                return (
                                    <div key={t.id}>
                                        {t.name} { }
                                        {progress 
                                            ? progress?.passed ? "[Пройден]" : `[Не пройден] [Попытки: ${progress.attempts}]`
                                            : "[Не пройден] [Попытки: 3]"
                                        }
                                    </div>
                                );
                            })}<hr/>

                            <b>Итоговое тестирование</b>
                            {finaltests.map(ft => {
                                const progress = studentprogress?.find(p => p.id === ft.id);
                                return (
                                    <div>
                                        {ft.name} { }
                                        {progress 
                                            ? progress.passed ? "[Пройден]" : "[Не пройден]"
                                            : "[Не пройдено]"
                                        }
                                    </div>
                                )
                            })}
                            <button onClick={() => setShowModal(false)}>Закрыть статистику</button>
                        </div>
                    </div>
                )}
                <br/><button onClick={() => navigate("/")}>Назад</button>
        </div>
    );
};

export default Statistics;