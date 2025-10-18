import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/lesson.css";

const Lesson = () => {
    const [login, setLogin] = useState("");
    const { id } = useParams();
    const [lesson, setLesson] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [result, setResult] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const TIMER_DURATION = 600; // общее время теста (в секундах)
    const navigate = useNavigate();

    useEffect(() => {
        const storedLogin = sessionStorage.getItem("login") || localStorage.getItem("login");
        setLogin(storedLogin);
        getLesson();
    }, []);

    const getLesson = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/lessons/${id}`, {});

            if (response.status === 200 && response.data.success) {
                setLesson(response.data.lesson);

                if (response.data.lesson.type === "Итоговый тест") {
                    const savedStartTime = localStorage.getItem(`test_start_${id}`);
                    const now = Date.now();
                    if (savedStartTime) {
                        const elapsed = Math.floor((now - parseInt(savedStartTime)) / 1000);
                        const remaining = TIMER_DURATION - elapsed;
                        if (remaining > 0) {
                            setTimeLeft(remaining);
                        } else {
                            handleTimeOutFail();
                        }
                    } else {
                        localStorage.setItem(`test_start_${id}`, now.toString());
                        setTimeLeft(TIMER_DURATION);
                    }
                }
            } else {
                console.error("Ошибка при загрузке учебного материала: ", response.data.message);
                alert(`Не удалось загрузить учебный материал: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при загрузке учебного материала: ", error.response.data.message);
            alert(`Не удалось загрузить учебный материал: ${error.response.data.message}`);
        }
    }

    // для таймера
    useEffect(() => {
        if (lesson.type === "Итоговый тест" && timeLeft !== null) {
            if (timeLeft <= 0) {
                alert("Время истекло! Тест завершён с неудачей.");
                handleTimeOutFail();
                return;
            }

            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, lesson.type]);

    const handleTimeOutFail = async () => {
        localStorage.removeItem(`test_start_${id}`);
        try {
            const response = await axios.post(`http://localhost:5000/progress/savefinaltest`, {
                login: login,
                lessonid: id,
                answers: [],
                failedByTime: true
            });

            if (response.status === 200 && response.data.success) {
                navigate("/");
            } else {
                console.error("Ошибка при сохранении ответов: ", response.data.message);
                alert(`Не удалось сохранить ответы: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при охранении ответов: ", error.response.data.message);
            alert(`Не удалось сохранить ответы: ${error.response.data.message}`);
        }
    };

    const handleAnswerChange = (questionIndex, questionText, answerText) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[questionIndex] = { question: questionText, answer: answerText };
            return newAnswers;
        });
    };

    const hundleSave = async () => {
        localStorage.removeItem(`test_start_${id}`);
        const totalQuestions = lesson.data.questions.length;
        const answeredCount = Object.keys(answers).length;
        if (answeredCount < totalQuestions) {
            alert("Необходимо ответить на все вопросы!");
            return;
        }

        try {
            let response;
            if (lesson.type === "Лекция") {
                response = await axios.post(`http://localhost:5000/progress/savelecture`, {
                    login: login,
                    lessonid: id,
                    answers: answers
                });
            } else if (lesson.type === "Тест") {
                response = await axios.post(`http://localhost:5000/progress/savetest`, {
                    login: login,
                    lessonid: id,
                    answers: answers
                });
            } else if (lesson.type === "Итоговый тест") {
                response = await axios.post(`http://localhost:5000/progress/savefinaltest`, {
                    login: login,
                    lessonid: id,
                    answers: answers,
                    failedByTime: false
                });
            }

            if (lesson.type === "Итоговый тест") {
                if (response.status === 200 && response.data.success) {
                    if (response.data.message === "Тест пройден!") {
                        alert("Итоговый тест успешно пройден!");
                    } else if (response.data.message === "Тест не пройден!") {
                        alert("Итоговый тест не пройден! Вы превысили число ошибок!")
                    }
                    navigate("/");
                } else {
                    console.error("Ошибка при сохранении ответов: ", response.data.message);
                    alert(`Не удалось сохранить ответы: ${response.data.message}`);
                }
            } else {
                if (response.status === 200 && response.data.success) {
                    if (response.data.message === "Нет ошибок!") {
                        alert("Тест успешно пройден!");
                        navigate("/");
                    } else if (response.data.message === "Есть ошибки в тесте!") {
                        setResult(response.data.result);
                        setShowModal(true);
                    }
                } else {
                    console.error("Ошибка при сохранении ответов: ", response.data.message);
                    alert(`Не удалось сохранить ответы: ${response.data.message}`);
                } 
            }
        } catch (error) {
            console.error("Ошибка при охранении ответов: ", error.response.data.message);
            alert(`Не удалось сохранить ответы: ${error.response.data.message}`);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" + s : s}`;
    };

  return (

    <div className="lesson">
        {lesson.type === "Итоговый тест" && timeLeft !== null && (
            <div className="timer">
                <b>Оставшееся время: {formatTime(timeLeft)}</b>
                <hr />
            </div>
        )}

        {lesson.type === "Лекция" && (
            <div className="lecture">
                <b>{lesson.name}</b><br/>
                <label style={{ whiteSpace: "pre-wrap" }}>{lesson.data.lecture}</label>
                <hr></hr>

                <b>Тест:</b><br/>
                {lesson.data.questions.map((q, i) => (
                    <p>{i + 1}. {q.text}
                    {q.answers?.map((a, j) => (
                        <label><br/><input type="radio" name={`q${i}`} value={a.text} checked={answers[i]?.answer === a.text} onChange={() => handleAnswerChange(i, q.text, a.text)}/>{a.text}</label>
                    ))}</p>
                ))}
            </div>
        )}

        {lesson.type === "Тест" && (
            <div className="test">
                <b>Тест:</b><br/>
                {lesson.data.questions.map((q, i) => (
                    <p>{i + 1}. {q.text}
                    {q.answers?.map((a, j) => (
                        <label><br/><input type="radio" name={`q${i}`} value={a.text} checked={answers[i]?.answer === a.text} onChange={() => handleAnswerChange(i, q.text, a.text)}/>{a.text}</label>
                    ))}</p>
                ))}
            </div>
        )}

        {lesson.type === "Итоговый тест" && (
            <div className="finaltest">
                <b>Итоговый тест:</b><br/>
                {lesson.data.questions.map((q, i) => (
                    <p>{i + 1}. {q.text}
                    {q.answers?.map((a, j) => (
                        <label><br/><input type="radio" name={`q${i}`} value={a.text} checked={answers[i]?.answer === a.text} onChange={() => handleAnswerChange(i, q.text, a.text)}/>{a.text}</label>
                    ))}</p>
                ))}
            </div>
        )}

        <button onClick={() => hundleSave()}>Закончить тестирование</button>

        {showModal && (
            <div className="modal">
                {lesson.type === "Лекция" && (
                    <div className="lecture">
                        {result.passed ? (<p><h3>Тест пройден с ошибками!</h3></p>) : 
                        (<h3>Тест не пройден!</h3>)}
                        {result.errors.map((err, index) => (
                            <p>
                                <b>Вопрос: </b> {err.question}<br/>
                                <b>Ваш ответ: </b> {err.userAnswer}<br/>
                                <b>Правильный ответ: </b> {err.correctAnswer}<br/>
                                <b>Пояснение: </b> {err.explanation}<br/>
                            </p>
                        ))}
                    </div>
                )}

                {lesson.type === "Тест" && (
                    <div className="test">
                        {result.passed ? (<p><h3>Тест пройден с ошибками!</h3></p>) : 
                        (<h3>Тест не пройден!</h3>)}

                        {result.errors.map((err, index) => (
                            <p>
                                <b>Вопрос: </b> {err.question}<br/>
                                <b>Ваш ответ: </b> {err.userAnswer}<br/>
                                <b>Правильный ответ: </b> {err.correctAnswer}<br/>
                            </p>
                        ))}
                    </div>
                )}

                <button onClick={() => navigate("/")}>Вернуться на главную страницу</button>
            </div>
        )}
    </div>
  );
};

export default Lesson;
