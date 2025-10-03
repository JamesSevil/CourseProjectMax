import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/modal.css"


const Lectures = () => {
    const [showModal, setShowModal] = useState(false);
    const [bookmark, setBookmark] = useState("lecture");
    const [lectureName, setLectureName] = useState("");
    const [lectureText, setLectureText] = useState("");
    const [questions, setQuestions] = useState([]);

    const openModal = () => {
        setShowModal(true);
        setQuestions([
            ...questions, {
                text: "",
                explanation: "",
                answers: [{ text: "", isCorrect: false }]
            }
        ]);
    };

    const closeModal = () => {
        setShowModal(false);
        setBookmark("lecture");
        setLectureName("");
        setLectureText("");
        setQuestions([]);
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

    const hundleAddLecture = async () => {
        if (lectureName.length === 0) {
            alert("Введите название лекции!");
            return;
        } else if (!lectureText.trim()) {
            alert("Заполните текст лекции!");
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
            } else if (!q.explanation.trim()) {
                alert(`В вопросе ${i + 1} нужно заполнить пояснение!`);
                return;
            }
        }

        try {
            const response = await axios.post("http://localhost:5000/lessons/lecture", {
                lectureName: lectureName,
                lectureText: lectureText,
                questions: questions.map(q => ({
                    text: q.text,
                    explanation: q.explanation,
                    answers: q.answers.map(a => ({
                        text: a.text,
                        isCorrect: a.isCorrect
                    }))
                }))
            });

            if (response.status === 200 && response.data.success) {
                console.log(response.data.message);
                alert("Лекция успешно добавлена!");
                closeModal();
            } else {
                console.error("Ошибка при добавлении лекции: ", response.data.message);
                alert(`Не удалось добавить лекцию: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при добавлении лекции: ", error.response.data.message);
            alert(`Не удалось добавить лекцию: ${error.response.data.message}`);
        }
    };


    return (
        <div className="lectures">
            <button onClick={() => openModal()}>Создание лекции/теста</button><br/><br/>
            {showModal && (
                <div className="modal">
                    <div className="modal-bookmark">
                        <button onClick={() => setBookmark("lecture")}>Лекция с тестом</button>
                        <button onClick={() => setBookmark("test")}>Тест</button><br/><br/>
                    </div>

                    {bookmark === "lecture" && (
                        <div className="lecture">
                            <b>Лекция</b><br/>
                            Название: <input type="text" value={lectureName} onChange={(e) => setLectureName(e.target.value)}/><br/>
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
                        </div>
                    )}

                    {bookmark === "test" && (
                        <div className="test">
                            <b>Тест</b><br/>
                        </div>
                    )}
        
                    <div className="modal-content"></div>
                    <button onClick={() => hundleAddLecture()}>Сохранить</button>
                    <button onClick={() => closeModal()}>Отмена</button>
                </div>
            )}

            <b>Список лекций/тестов</b><br/>
            
        </div>
    );
};

export default Lectures;
