import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/modal.css"


const Lessons = () => {
    const [showModal, setShowModal] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [bookmark, setBookmark] = useState("lecture");
    const [lectureName, setLectureName] = useState("");
    const [lectureText, setLectureText] = useState("");
    const [questions, setQuestions] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [lessonEdit, setLessonEdit] = useState([]);
    const [typeTest, setTypeTest] = useState("");
    const [priority, setPriority] = useState(1);
    const [attempts, setAttempts] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        getLessons();
    }, []);

    const getLessons = async () => {
        try {
            const response = await axios.get("http://localhost:5000/lessons", {});

            if (response.status === 200 && response.data.success) {
                setLessons(response.data.lessons);
            } else {
                console.error("Ошибка при загрузке учебного материала: ", response.data.message);
                alert(`Не удалось загрузить учебный материал: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при загрузке учебного материала: ", error.response.data.message);
            alert(`Не удалось загрузить учебный материал: ${error.response.data.message}`);
        }
    }

    const openModal = () => {
        if (showModalEdit) return;
        else if (!showModal) {
            setShowModal(true);
            setQuestions([
                ...questions, {
                    text: "",
                    explanation: "",
                    answers: [{ text: "", isCorrect: false }]
                }
            ]);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setBookmark("lecture");
        setLectureName("");
        setLectureText("");
        setQuestions([]);
        setTypeTest("");
        setPriority(1);
    };

    const changeModal = (name) => {
        if (name === "lecture" && bookmark === "lecture") return;
        else if (name === "test" && bookmark === "test") return;
        else if (name === "lecture") setBookmark("lecture");
        else if (name === "test") setBookmark("test");
        setLectureName("");
        setLectureText("");
        setQuestions([
            {
                text: "",
                explanation: "",
                answers: [{ text: "", isCorrect: false }]
            }
        ]);
    };

    const addQuestion = () => {
        setQuestions([
            ...questions, {
                text: "",
                explanation: "",
                answers: [{ text: "", isCorrect: false }]
            }
        ]);
    };

    const removeQuestion = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions.splice(qIndex, 1);
        setQuestions(newQuestions);
    };

    const addAnswer = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].answers.push({ text: "", isCorrect: false });
        setQuestions(newQuestions);
    };

    const removeAnswer = (qIndex, aIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].answers.splice(aIndex, 1);
        setQuestions(newQuestions);
    };

    const openModalEdit = (lesson) => {
        if (showModal) return;
        setShowModalEdit(true);
        setLessonEdit(lesson);
        if (lesson.type === "Лекция") {
            setBookmark("lecture");
            setLectureText(lesson.data.lecture);
        } else if (lesson.type === "Тест") {
            setBookmark("test");
            setTypeTest("Тест");
        } else if (lesson.type === "Итоговый тест") {
            setBookmark("test");
            setTypeTest("Итоговый тест");
        }
        setLectureName(lesson.name);
        setQuestions(lesson.data.questions);
        setPriority(lesson.priority);
    };

    const closeModalEdit = () => {
        setShowModalEdit(false);
        setBookmark("lecture");
        setLectureName("");
        setLectureText("");
        setQuestions([]);
        setLessonEdit([]);
        setTypeTest("");
        setPriority(1);
    };

    const hundleAdd = async (type) => {
        if (typeTest === "Итоговый тест") type = "finaltest";

        if (typeTest.length === 0 && type !== "lecture") {
            alert("Выберите тип теста!");
            return;
        } else if (lectureName.length === 0) {
            alert("Введите название!");
            return;
        } else if (!lectureText.trim() && type === "lecture") {
            alert("Заполните текст лекции!");
            return;
        } else if (priority <= 0 || attempts <= 0) {
            alert("Приоритет не может быть меньше 1!");
            return;
        }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) {
                alert(`Вопрос ${i + 1} не заполнен!`);
                return;
            }
            let hasCorrect = false;
            for (let j = 0; j < q.answers.length; j++) {
                const a = q.answers[j];
                if (!a.text.trim()) {
                    alert(`Ответ ${j + 1} у вопроса ${i + 1} не заполнен!`);
                    return;
                } else if (a.isCorrect) {
                    hasCorrect = true;
                }
            }
            if (!hasCorrect) {
                alert(`В вопросе ${i + 1} нужно выбрать правильный ответ!`);
                return;
            } else if (!q.explanation.trim() && type === "lecture") {
                alert(`В вопросе ${i + 1} нужно заполнить пояснение!`);
                return;
            }
        }

        try {
            let response;
            if (type === "lecture") {
                response = await axios.post("http://localhost:5000/lessons/lecture", {
                    lectureName: lectureName,
                    lectureText: lectureText,
                    lecturePriority: priority,
                    questions: questions.map(q => ({
                        text: q.text,
                        explanation: q.explanation,
                        answers: q.answers.map(a => ({
                            text: a.text,
                            isCorrect: a.isCorrect
                        }))
                    }))
                });
            } else if (type === "test") {
                response = await axios.post("http://localhost:5000/lessons/test", {
                    testName: lectureName,
                    testPriority: priority,
                    questions: questions.map(q => ({
                        text: q.text,
                        answers: q.answers.map(a => ({
                            text: a.text,
                            isCorrect: a.isCorrect
                        }))
                    }))
                });
            } else if (type === "finaltest") {
                response = await axios.post("http://localhost:5000/lessons/finaltest", {
                    testName: lectureName,
                    questions: questions.map(q => ({
                        text: q.text,
                        answers: q.answers.map(a => ({
                            text: a.text,
                            isCorrect: a.isCorrect
                        }))
                    }))
                });
            }

            if (response.status === 200 && response.data.success) {
                console.log(response.data.message);
                alert("Материал успешно добавлен!");
                closeModal();
                getLessons();
            } else {
                console.error("Ошибка при добавлении: ", response.data.message);
                alert(`Не удалось добавить: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при добавлении: ", error.response.data.message);
            alert(`Не удалось добавить: ${error.response.data.message}`);
        }
    };

    const handleEdit = async () => {
        if (typeTest.length !== 0) lessonEdit.type = typeTest;

        if (lectureName.length === 0) {
            alert("Введите название!");
            return;
        } else if (!lectureText.trim() && lessonEdit.type === "Лекция") {
            alert("Заполните текст лекции!");
            return;
        } else if (priority <= 0) {
            alert("Приоритет не может быть меньше 1!");
            return;
        }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) {
                alert(`Вопрос ${i + 1} не заполнен!`);
                return;
            }
            let hasCorrect = false;
            for (let j = 0; j < q.answers.length; j++) {
                const a = q.answers[j];
                if (!a.text.trim()) {
                    alert(`Ответ ${j + 1} у вопроса ${i + 1} не заполнен!`);
                    return;
                } else if (a.isCorrect) {
                    hasCorrect = true;
                }
            }
            if (!hasCorrect) {
                alert(`В вопросе ${i + 1} нужно выбрать правильный ответ!`);
                return;
            } else if (lessonEdit.type == "Лекция") {
                if (!q.explanation.trim()) {
                    alert(`В вопросе ${i + 1} нужно заполнить пояснение!`);
                    return;
                }
            }
        }

        try {
            let response;
            if (lessonEdit.type === "Лекция") {
                response = await axios.put("http://localhost:5000/lessons/lecture", {
                    id: lessonEdit.id,
                    name: lectureName,
                    text: lectureText,
                    priority: priority,
                    questions: questions.map(q => ({
                        text: q.text,
                        explanation: q.explanation,
                        answers: q.answers.map(a => ({
                            text: a.text,
                            isCorrect: a.isCorrect
                        }))
                    }))
                });
            } else if (lessonEdit.type === "Тест") {
                response = await axios.put("http://localhost:5000/lessons/test", {
                    id: lessonEdit.id,
                    name: lectureName,
                    priority: priority,
                    questions: questions.map(q => ({
                        text: q.text,
                        answers: q.answers.map(a => ({
                            text: a.text,
                            isCorrect: a.isCorrect
                        }))
                    }))
                });
            } else if (lessonEdit.type === "Итоговый тест") {
                response = await axios.put("http://localhost:5000/lessons/finaltest", {
                    id: lessonEdit.id,
                    name: lectureName,
                    questions: questions.map(q => ({
                        text: q.text,
                        answers: q.answers.map(a => ({
                            text: a.text,
                            isCorrect: a.isCorrect
                        }))
                    }))
                });
            }

            if (response.status === 200 && response.data.success) {
                console.log(response.data.message);
                alert("Материал успешно изменен!");
                closeModalEdit();
                getLessons();
            } else {
                console.error("Ошибка при изменении: ", response.data.message);
                alert(`Не удалось изменить: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при изменении: ", error.response.data.message);
            alert(`Не удалось изменить: ${error.response.data.message}`);
        }
    };

    const handleDel = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:5000/lessons/${id}`);

            if (response.status === 200 && response.data.success) {
                setLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== id)); // обновление списка после удаления
                alert("Материал успешно удален!");
            } else {
                console.error("Ошибка при удалении материала: ", response.data.message);
                alert(`Не удалось удалить материал: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при удалении материала: ", error.response.data.message);
            alert(`Не удалось удалить материал: ${error.response.data.message}`);
        }
    }

    return (
        <div className="lectures">
            <button onClick={() => openModal()}>Создание лекции/теста</button><br/><br/>
            {showModal && (
                <div className="modal">
                    <div className="modal-bookmark">
                        <button onClick={() => changeModal("lecture")}>Лекция с тестом</button>
                        <button onClick={() => changeModal("test")}>Тест</button><br/><br/>
                    </div>

                    <div className="modal-content">
                        {bookmark === "lecture" && (
                            <div className="lecture">
                                <b>Лекция</b><br/>
                                Название: <input type="text" value={lectureName} onChange={(e) => setLectureName(e.target.value)}/><br/>
                                Приоритет: <input type="number" min="1" value={priority} onChange={(e) => setPriority(Number(e.target.value))}/><br/>

                                Текст:<br/><textarea className="lecture-text" value={lectureText} onChange={(e) => setLectureText(e.target.value)}/><br/><br/>

                                <b>Тест</b> <button onClick={() => addQuestion()}>Добавить вопрос</button>
                                {questions.map((q, qIndex) => (
                                    <div className="question">
                                        Вопрос {qIndex + 1}: <input type="text" value={q.text} onChange={(e) => {
                                            const newQuestions = [...questions];
                                            newQuestions[qIndex].text = e.target.value;
                                            setQuestions(newQuestions);
                                        }}/> { }
                                        <button onClick={() => removeQuestion(qIndex)}>Удалить вопрос</button><br/>
                                        
                                        Варианты ответа <button onClick={() => addAnswer(qIndex)}>Добавить ответ</button><br/>
                                        {q.answers.map((a, aIndex) => (
                                            <div className="answer">
                                                Ответ {aIndex + 1}: <input type="text" value={a.text} onChange={(e) => {
                                                    const newQuestions = [...questions];
                                                    newQuestions[qIndex].answers[aIndex].text = e.target.value;
                                                    setQuestions(newQuestions);
                                                }}/>
                                                <input type="radio" checked={a.isCorrect} onChange={() => {
                                                    const newQuestions = [...questions];
                                                    newQuestions[qIndex].answers =
                                                        newQuestions[qIndex].answers.map((ans, idx) => ({
                                                            ...ans,
                                                            isCorrect: idx === aIndex
                                                        }));
                                                    setQuestions(newQuestions);
                                                }}/> Правильный { }
                                                <button onClick={() => removeAnswer(qIndex, aIndex)}>Удалить ответ</button><br/>
                                            </div>
                                        ))}

                                        <div className="explanation">
                                            Пояснение: <input type="text" value={q.explanation} onChange={(e) => {
                                                const newQuestions = [...questions];
                                                newQuestions[qIndex].explanation = e.target.value;
                                                setQuestions(newQuestions);
                                            }}/><br/><br/>
                                        </div>

                                    </div>
                                ))}
                                <button onClick={() => hundleAdd("lecture")}>Сохранить</button>
                                <button onClick={() => closeModal()}>Отмена</button>
                            </div>
                        )}

                        {bookmark === "test" && (
                            <div className="test">
                                <b>Тест</b><br/>
                                <input type="radio" value="Тест" checked={typeTest === "Тест"} onChange={(e) => setTypeTest(e.target.value)}/>Обычный тест { }
                                <input type="radio" value="Итоговый тест" checked={typeTest === "Итоговый тест"} onChange={(e) => setTypeTest(e.target.value)}/>Итоговый тест<br/>
                                Название: <input type="text" value={lectureName} onChange={(e) => setLectureName(e.target.value)}/><br/>
                                Приоритет: <input type="number" min="1" value={priority} onChange={(e) => setPriority(Number(e.target.value))}/><br/><br/>

                                <button onClick={() => addQuestion()}>Добавить вопрос</button><br/>
                                {questions.map((q, qIndex) => (
                                    <div className="question">
                                        Вопрос {qIndex + 1}: <input type="text" value={q.text} onChange={(e) => {
                                            const newQuestions = [...questions];
                                            newQuestions[qIndex].text = e.target.value;
                                            setQuestions(newQuestions);
                                        }}/> { }
                                        <button onClick={() => removeQuestion(qIndex)}>Удалить вопрос</button><br/>
                                        
                                        Варианты ответа <button onClick={() => addAnswer(qIndex)}>Добавить ответ</button>
                                        {q.answers.map((a, aIndex) => (
                                            <div className="answer">
                                                Ответ {aIndex + 1}: <input type="text" value={a.text} onChange={(e) => {
                                                    const newQuestions = [...questions];
                                                    newQuestions[qIndex].answers[aIndex].text = e.target.value;
                                                    setQuestions(newQuestions);
                                                }}/>
                                                <input type="radio" checked={a.isCorrect} onChange={() => {
                                                    const newQuestions = [...questions];
                                                    newQuestions[qIndex].answers =
                                                        newQuestions[qIndex].answers.map((ans, idx) => ({
                                                            ...ans,
                                                            isCorrect: idx === aIndex
                                                        }));
                                                    setQuestions(newQuestions);
                                                }}/> Правильный { }
                                                <button onClick={() => removeAnswer(qIndex, aIndex)}>Удалить ответ</button><br/>
                                            </div>
                                        ))}
                                        <br/>
                                    </div>
                                ))}
                                <button onClick={() => hundleAdd("test")}>Сохранить</button>
                                <button onClick={() => closeModal()}>Отмена</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <b>Список учебного материала</b><br/>
            {lessons.length === 0 ? (
                <p>Учебный материал не найден</p>
            ) : (
                <table border="1" cellPadding="5" cellSpacing="0">
                    <thead><tr>
                        <th>Тип</th>
                        <th>Приоритет</th>
                        <th>Название</th>
                        <th>Действие</th>
                    </tr></thead>
                    <tbody>{lessons.map((lesson, index) => (
                        <tr key={index}>
                            <td>{lesson.type}</td>
                            <td>{lesson.priority}</td>
                            <td>{lesson.name}</td>
                            <td><button onClick={() => openModalEdit(lesson)}>Изменить</button> <button onClick={() => handleDel(lesson.id)}>Удалить</button> </td>
                        </tr>
                    ))}</tbody>
                </table>
            )}

            {showModalEdit && (
                <div className="modal">
                    {bookmark === "lecture" && (
                        <div className="lecture">
                            <b>Лекция</b><br/>
                            Название: <input type="text" value={lectureName} onChange={(e) => setLectureName(e.target.value)}/><br/>
                            Приоритет: <input type="number" min="1" value={priority} onChange={(e) => setPriority(Number(e.target.value))}/><br/>
                            Текст:<br/><textarea className="lecture-text" value={lectureText} onChange={(e) => setLectureText(e.target.value)}/><br/><br/>

                            <b>Тест</b> <button onClick={() => addQuestion()}>Добавить вопрос</button>
                            {questions.map((q, qIndex) => (
                                <div className="question">
                                    Вопрос {qIndex + 1}: <input type="text" value={q.text} onChange={(e) => {
                                        const newQuestions = [...questions];
                                        newQuestions[qIndex].text = e.target.value;
                                        setQuestions(newQuestions);
                                    }}/> { }
                                    <button onClick={() => removeQuestion(qIndex)}>Удалить вопрос</button><br/>
                                    
                                    Варианты ответа <button onClick={() => addAnswer(qIndex)}>Добавить ответ</button><br/>
                                    {q.answers.map((a, aIndex) => (
                                        <div className="answer">
                                            Ответ {aIndex + 1}: <input type="text" value={a.text} onChange={(e) => {
                                                const newQuestions = [...questions];
                                                newQuestions[qIndex].answers[aIndex].text = e.target.value;
                                                setQuestions(newQuestions);
                                            }}/>
                                            <input type="radio" checked={a.isCorrect} onChange={() => {
                                                const newQuestions = [...questions];
                                                newQuestions[qIndex].answers =
                                                    newQuestions[qIndex].answers.map((ans, idx) => ({
                                                        ...ans,
                                                        isCorrect: idx === aIndex
                                                    }));
                                                setQuestions(newQuestions);
                                            }}/> Правильный { }
                                            <button onClick={() => removeAnswer(qIndex, aIndex)}>Удалить ответ</button><br/>
                                        </div>
                                    ))}

                                    <div className="explanation">
                                        Пояснение: <input type="text" value={q.explanation} onChange={(e) => {
                                            const newQuestions = [...questions];
                                            newQuestions[qIndex].explanation = e.target.value;
                                            setQuestions(newQuestions);
                                        }}/><br/><br/>
                                    </div>

                                </div>
                            ))}
                            <button onClick={() => handleEdit()}>Сохранить</button>
                            <button onClick={() => closeModalEdit()}>Отмена</button>
                        </div>
                    )}

                    {bookmark === "test" && (
                        <div className="test">
                            <b>Тест</b><br/>
                            <input type="radio" value="Тест" checked={typeTest === "Тест"} onChange={(e) => setTypeTest(e.target.value)}/>Обычный тест { }
                            <input type="radio" value="Итоговый тест" checked={typeTest === "Итоговый тест"} onChange={(e) => setTypeTest(e.target.value)}/>Итоговый тест<br/>
                            Название: <input type="text" value={lectureName} onChange={(e) => setLectureName(e.target.value)}/><br/>
                            Приоритет: <input type="number" min="1" value={priority} onChange={(e) => setPriority(Number(e.target.value))}/><br/><br/>

                            <button onClick={() => addQuestion()}>Добавить вопрос</button><br/>
                            {questions.map((q, qIndex) => (
                                <div className="question">
                                    Вопрос {qIndex + 1}: <input type="text" value={q.text} onChange={(e) => {
                                        const newQuestions = [...questions];
                                        newQuestions[qIndex].text = e.target.value;
                                        setQuestions(newQuestions);
                                    }}/> { }
                                    <button onClick={() => removeQuestion(qIndex)}>Удалить вопрос</button><br/>
                                    
                                    Варианты ответа <button onClick={() => addAnswer(qIndex)}>Добавить ответ</button>
                                    {q.answers.map((a, aIndex) => (
                                        <div className="answer">
                                            Ответ {aIndex + 1}: <input type="text" value={a.text} onChange={(e) => {
                                                const newQuestions = [...questions];
                                                newQuestions[qIndex].answers[aIndex].text = e.target.value;
                                                setQuestions(newQuestions);
                                            }}/>
                                            <input type="radio" checked={a.isCorrect} onChange={() => {
                                                const newQuestions = [...questions];
                                                newQuestions[qIndex].answers =
                                                    newQuestions[qIndex].answers.map((ans, idx) => ({
                                                        ...ans,
                                                        isCorrect: idx === aIndex
                                                    }));
                                                setQuestions(newQuestions);
                                            }}/> Правильный { }
                                            <button onClick={() => removeAnswer(qIndex, aIndex)}>Удалить ответ</button><br/>
                                        </div>
                                    ))}
                                    <br/>
                                </div>
                            ))}
                            <button onClick={() => handleEdit()}>Сохранить</button>
                            <button onClick={() => closeModalEdit()}>Отмена</button>
                        </div>
                    )}
                </div>
            )}

            <p><button onClick={() => {navigate('/')}}>Назад</button></p>
        </div>
    );
};

export default Lessons;
