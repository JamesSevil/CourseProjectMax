import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/modal.css"

const Lesson = () => {
    const [login, setLogin] = useState("");
    const { id } = useParams();
    const [lesson, setLesson] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [result, setResult] = useState({});
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
            } else {
                console.error("Ошибка при загрузке учебного материала: ", response.data.message);
                alert(`Не удалось загрузить учебный материал: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при загрузке учебного материала: ", error.response.data.message);
            alert(`Не удалось загрузить учебный материал: ${error.response.data.message}`);
        }
    }

    const handleAnswerChange = (questionIndex, questionText, answerText) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[questionIndex] = { question: questionText, answer: answerText };
            return newAnswers;
        });
    };

    const hundleSave = async () => {
        const totalQuestions = lesson.data.questions.length;
        const answeredCount = Object.keys(answers).length;
        if (answeredCount < totalQuestions) {
            alert("Необходимо ответить на все вопросы!");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5000/lessons/savetest`, {
                login: login,
                lessonid: id,
                answers: answers
            });

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
        } catch (error) {
            console.error("Ошибка при охранении ответов: ", error.response.data.message);
            alert(`Не удалось сохранить ответы: ${error.response.data.message}`);
        }
    };

  return (
    <div className="lesson">
        {lesson.type === "Лекция" && (
            <div className="lecture">
                <b>{lesson.name}</b><br/>
                <p style={{ whiteSpace: "pre-wrap" }}>{lesson.data.lecture}</p>
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

        <button onClick={() => hundleSave()}>Закончить тестирование</button>

        {showModal && (
            <div className="modal">
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

                <button onClick={() => navigate("/")}>Вернуться на главную страницу</button>
            </div>
        )}
    </div>
  );
};

export default Lesson;
