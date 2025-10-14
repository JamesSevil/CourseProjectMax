import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";

const Home = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [login, setLogin] = useState("");
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
            setLogin(storedLogin);
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

    const handleClick = (e, passed, type, id) => {
        if (type === "Лекция") {
            if (passed) {
                e.preventDefault();
                alert("Эта лекция уже пройдена!");
                return;
            }

            const sortedLectures = [...lectures].sort((a, b) => a.priority - b.priority);
            const currentIndex = sortedLectures.findIndex(l => l.id === id);
            if (currentIndex > 0) {
                const prevLecture = sortedLectures[currentIndex - 1];
                const prevProgress = studentprogress.find(p => p.id === prevLecture.id);
                if (!prevProgress || !prevProgress.passed) {
                    e.preventDefault();
                    alert(`Сначала завершите предыдущую лекцию: ${prevLecture.name}`);
                    return;
                }
            }
        } else if (type === "Тест") {
            if (passed) {
                e.preventDefault();
                alert("Этот тест уже пройден!");
                return;
            }

            const unpassedLectures = lectures.filter(l => {
                const lp = studentprogress.find(p => String(p.id) === String(l.id));
                return !lp || !lp.passed;
            });
            if (unpassedLectures.length > 0) {
                e.preventDefault();
                alert("Вы не можете пройти тест, пока не пройдены все лекции!");
                return;
            }

            const sortedTests = [...tests].sort((a, b) => a.priority - b.priority);
            const currentIndex = sortedTests.findIndex(t => t.id === id);
            if (currentIndex > 0) {
                const prevTest = sortedTests[currentIndex - 1];
                const prevProgress = studentprogress.find(p => p.id === prevTest.id);
                if (!prevProgress || !prevProgress.passed) {
                    e.preventDefault();
                    alert(`Сначала завершите предыдущий тест: "${prevTest.name}"`);
                    return;
                }
            }
        }  else if (type === "Итоговый тест") {
            if (passed) {
                e.preventDefault();
                alert("Итоговое тестирование уже пройдено!");
                return;
            }

            const unpassedTests = tests.filter(t => {
                const tp = studentprogress.find(p => String(p.id) === String(t.id));
                return !tp || !tp.passed;
            });
            if (unpassedTests.length > 0) {
                e.preventDefault();
                alert("Сначала завершите весь курс лекций и тестов!");
                return;
            }
        }

        let check;
        if (type === "Лекция") {
            check = confirm("Вы будете перенаправлены на страницу с лекцией, которую необходимо изучить и решить тест после лекции.\nЛекция считается пройденной, если вы наберете 70% и более правильных ответов.\nПодтвердить действие?")
        } else if (type === "Тест") {
            check = confirm("Вы будете перенаправлены на страницу с тестом, который необходимо решить.\nТест считается пройденным, если вы наберете 70% и более правильных ответов.\nПри окончании числа попыток вам придется начать учебный курс заново!\nПодтвердить действие?")
        } else if (type === "Итоговый тест") {
            check = confirm("Вы будете перенаправлены на страницу с итоговым тестом, который необходимо решить.\nТест считается пройденным, если вы наберете 70% и более правильных ответов.\nВремя ограничено. При неудаче вам придется пройти учебный курс заново!\nПодтвердить действие?")
        }
        if (!check) {
            e.preventDefault();
            return;
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login');
    };

    const hundleDownload = async (id) => {
        try {
            const response = await axios.post("http://localhost:5000/progress/final", {
                idLesson: id,
                login: login
            });

            if (response.status === 200 && response.data.success) {
                const content = document.createElement("div");
                content.style.width = "500px";
                content.style.padding = "20px";
                content.style.textAlign = "center";
                content.style.fontFamily = "Arial, sans-serif";
                content.style.position = "absolute";
                content.style.left = "-9999px";
                content.innerHTML = `
                    <h1>СЕРТИФИКАТ</h1>
                    <p>Настоящий сертификат подтверждает, что <b>${name} ${surname}</b></p>
                    <p>успешно прошёл курс обучения от <b>LearnProgaMixas</b></p>
                    <p>Результат: ${response.data.percent}%</p>
                    <hr></hr>
                    <p>Дата завершения курса: ${response.data.time}</p>
                `;

                document.body.appendChild(content);

                html2canvas(content, { scale: 2 }).then(canvas => {
                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF();
                    pdf.addImage(imgData, "PNG", 20, 20, 170, 0);
                    pdf.save(`Сертификат_${name}_${surname}.pdf`);

                    document.body.removeChild(content);
                });
            } else {
                console.error("Ошибка при загрузке сертификата: ", response.data.message);
                alert(`Не удалось загрузить сертификат: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при загрузке сертификата: ", error.response.data.message);
            alert(`Не удалось загрузить сертификат: ${error.response.data.message}`);
        }
    };


    return (
        <div className="home">
            <div className="relative">
                <button onClick={() => setIsOpen(!isOpen)}>{name && surname ? `${name} ${surname}` : "Профиль"}</button>

                {isOpen && (
                    <div>
                        {role === "Администратор" && (<><button onClick={() => navigate("/users")}>Управление пользователями</button><br/></>)}
                        {(role === "Администратор" || role === "Преподаватель") && (<><button onClick={() => navigate("/lessons")}>Управление материалом</button><br/></>)}
                        <button onClick={() => {
                            setIsOpen(false);
                            navigate("/profile");
                        }}>Личный кабинет</button><br/>
                        {(role === "Администратор" || role === "Преподаватель") && (<><button onClick={() => navigate("/statistics")}>Статистика</button><br/></>)}
                        <button onClick={handleLogout}>Выйти</button>
                    </div>
                )}
            </div>
            <h2>LearnProgaMixas</h2>
            <h4>С нами легко!</h4>
            <hr></hr>

            {role === "Студент" ?
                <div> 
                    <b>Лекции</b><br/>
                    {lectures.map(l => {
                        const progress = studentprogress?.find(p => p.id === l.id);
                        return (
                            <div key={l.id}>
                                <Link to={`/lesson/${l.id}`} onClick={(e) => handleClick(e, progress?.passed, "Лекция", l.id)}>{l.name}</Link> { }
                                {progress 
                                    ? `[${progress.passed ? "Пройдена" : "Не пройдена"}]` 
                                    : "[Не пройдена]"
                                }
                            </div>
                        );
                    })}<br/><hr/>


                    <b>Тесты</b><br/>
                    {tests.map(t => {
                        const progress = studentprogress?.find(p => p.id === t.id);
                        return (
                            <div key={t.id}>
                                <Link to={`/lesson/${t.id}`} onClick={(e) => handleClick(e, progress?.passed, "Тест", t.id)}>{t.name}</Link> { }
                                {progress 
                                    ? progress?.passed ? "[Пройден]" : `[Не пройден] [Попытки: ${progress.attempts}]`
                                    : "[Не пройден] [Попытки: 3]"
                                }
                            </div>
                        );
                    })}<br/><hr/>

                    <b>Итоговое тестирование</b><br/>
                    {finaltests.map(ft => {
                        const progress = studentprogress?.find(p => p.id === ft.id);
                        return (
                            <div>
                                <Link to={`/lesson/${ft.id}`} onClick={(e) => handleClick(e, progress?.passed, "Итоговый тест", ft.id)}>{ft.name}</Link> { }
                                {progress 
                                    ? progress.passed ? "[Пройден]" : "[Не пройден]"
                                    : "[Не пройдено]"
                                }
                                {progress?.passed && (
                                    <p><button onClick={() => hundleDownload(ft.id)}>Скачать сертификат</button></p>
                                )}
                            </div>
                        )
                    })}<br/>
                </div>
            : 
                <div> 
                    <b>Лекции</b><br/>
                    {lectures.map(l => (
                        <label>{l.name}<br/></label>    
                    ))}<br/><hr/>

                    <b>Тесты</b><br/>
                    {tests.map(t => (
                        <label>{t.name}<br/></label>    
                    ))}<br/><hr/>

                    <b>Итоговое тестирование</b><br/>
                    {finaltests.map(ft => (
                        <label>{ft.name}<br/></label>    
                    ))}<br/>
                </div>
            }     
        </div>
    );
};

export default Home;
