import express, { json } from "express";
import { pool } from "../server.js";
import crypt from "./crypt.js";

const router = express.Router();

router.post("/lecture", async (req, res) => {
    const { lectureName, lectureText, lecturePriority, questions } = req.body;

    try {
        const payload = JSON.stringify({
            lecture: lectureText,
            questions: questions
        });
        const { encryptedData, iv } = crypt.encrypt(payload);

        const result = await pool.query(
            "SELECT * FROM lessons WHERE type_id = (SELECT id FROM lessonstype WHERE type = 'Лекция') AND priority = $1",
            [lecturePriority]
        );
        if (result.rows.length !== 0) {
            return res.status(404).json({success: false, message: "Материал такого типа с таким приоритетом уже существует!"});
        }

        await pool.query(
            "INSERT INTO lessons VALUES (DEFAULT, (SELECT id FROM lessonstype WHERE type = 'Лекция'), $1, $2, $3)",
            [lecturePriority, lectureName, `${iv}:${encryptedData}`]
        );

        res.status(200).json({success: true, message: "Лекция успешно добавлена!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.post("/test", async (req, res) => {
    const { testName, testPriority, questions } = req.body;

    try {
        const payload = JSON.stringify({
            questions: questions
        });
        const { encryptedData, iv } = crypt.encrypt(payload);

        const result = await pool.query(
            "SELECT * FROM lessons WHERE type_id = (SELECT id FROM lessonstype WHERE type = 'Тест') AND priority = $1",
            [testPriority]
        );
        if (result.rows.length !== 0) {
            return res.status(404).json({success: false, message: "Материал такого типа с таким приоритетом уже существует!"});
        }

        await pool.query(
            "INSERT INTO lessons VALUES (DEFAULT, (SELECT id FROM lessonstype WHERE type = 'Тест'), $1, $2, $3)",
            [testPriority, testName, `${iv}:${encryptedData}`]
        );

        res.status(200).json({success: true, message: "Тест успешно добавлен!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.post("/finaltest", async (req, res) => {
    const { testName, questions } = req.body;

    try {
        const payload = JSON.stringify({
            questions: questions
        });
        const { encryptedData, iv } = crypt.encrypt(payload);

        const result = await pool.query(
            `SELECT * FROM lessons WHERE type_id = (SELECT id FROM lessonstype WHERE type = $1)`,
            ["Итоговый тест"]
        );
        if (result.rows.length !== 0) {
            return res.status(404).json({success: false, message: "Итоговое тестирование уже существует!"});
        }

        await pool.query(
            "INSERT INTO lessons VALUES (DEFAULT, (SELECT id FROM lessonstype WHERE type = 'Итоговый тест'), $1, $2, $3)",
            [1, testName, `${iv}:${encryptedData}`]
        );

        res.status(200).json({success: true, message: "Тест успешно добавлен!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT l.id, lt.type, l.priority, l.name, l.encrypted_data
            FROM lessons l
            JOIN lessonstype lt ON l.type_id = lt.id
            ORDER BY CASE 
                WHEN lt.type = 'Лекция' THEN 1
                WHEN lt.type = 'Тест' THEN 2
                WHEN lt.type = 'Итоговый тест' THEN 3
                ELSE 4
            END,
            l.priority ASC,
            l.id ASC`
        );

        const lessons = result.rows.map(row => {
            const [iv, encryptedData] = row.encrypted_data.split(":");
            const decrypted = crypt.decrypt(encryptedData, iv);
            const data = JSON.parse(decrypted);

            const lesson = {
                id: row.id,
                type: row.type,
                priority: row.priority,
                name: row.name,
                data: data
            };

            return lesson;
        });

        res.status(200).json({success: true, message: "Учебный материал успешно загружен!", lessons: lessons});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query(
            `SELECT * FROM lessons WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: "Материал не найден в базе данных!"});
        }

        await pool.query(
            `DELETE FROM lessons WHERE id = $1`,
            [id]
        );

        res.status(200).json({success: true, message: "Материал успешно удален!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.put("/lecture", async (req, res) => {
    const {id, name, text, priority, questions} = req.body;
    
    try {
        let result = await pool.query(
            `SELECT * FROM lessons WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: "Материал не найден в базе данных!"});
        }

        result = await pool.query(
            "SELECT * FROM lessons WHERE type_id = (SELECT id FROM lessonstype WHERE type = 'Лекция') AND priority = $1",
            [priority]
        );
        if (result.rows.length !== 0 && result.rows[0].id !== id) {
            return res.status(404).json({success: false, message: "Материал такого типа с таким приоритетом уже существует!"});
        }
        
        const payload = JSON.stringify({
            lecture: text,
            questions: questions
        });
        const { encryptedData, iv } = crypt.encrypt(payload);

        await pool.query(
            `UPDATE lessons
            SET type_id = (SELECT id FROM lessonstype WHERE type = $1), priority = $2, name = $3, encrypted_data = $4
            WHERE id = $5`,
            ["Лекция", priority, name, `${iv}:${encryptedData}`, id]
        );

        res.status(200).json({success: true, message: "Материал успешно изменен!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.put("/test", async (req, res) => {
    const {id, name, priority, questions} = req.body;
    
    try {
        let result = await pool.query(
            `SELECT * FROM lessons WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: "Материал не найден в базе данных!"});
        }

        result = await pool.query(
            "SELECT * FROM lessons WHERE type_id = (SELECT id FROM lessonstype WHERE type = 'Тест') AND priority = $1",
            [priority]
        );
        if (result.rows.length !== 0 && result.rows[0].id !== id) {
            return res.status(404).json({success: false, message: "Материал такого типа с таким приоритетом уже существует!"});
        }
        
        const payload = JSON.stringify({
            questions: questions
        });
        const { encryptedData, iv } = crypt.encrypt(payload);

        await pool.query(
            `UPDATE lessons
            SET type_id = (SELECT id FROM lessonstype WHERE type = $1), priority = $2, name = $3, encrypted_data = $4
            WHERE id = $5`,
            ["Тест", priority, name, `${iv}:${encryptedData}`, id]
        );

        res.status(200).json({success: true, message: "Материал успешно изменен!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.put("/finaltest", async (req, res) => {
    const {id, name, questions} = req.body;
    
    try {
        let result = await pool.query(
            `SELECT * FROM lessons WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: "Материал не найден в базе данных!"});
        }

        result = await pool.query(
            `SELECT * FROM lessons WHERE type_id = (SELECT id FROM lessonstype WHERE type = $1)`,
            ["Итоговый тест"]
        );
        if (result.rows.length !== 0 && result.rows[0].id !== id) {
            return res.status(404).json({success: false, message: "Итоговое тестирование уже существует!"});
        }
        
        const payload = JSON.stringify({
            questions: questions
        });
        const { encryptedData, iv } = crypt.encrypt(payload);

        await pool.query(
            `UPDATE lessons
            SET type_id = (SELECT id FROM lessonstype WHERE type = $1), name = $2, encrypted_data = $3
            WHERE id = $4`,
            ["Итоговый тест", name, `${iv}:${encryptedData}`, id]
        );

        res.status(200).json({success: true, message: "Материал успешно изменен!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query(
            `SELECT lt.type, l.name, l.encrypted_data
            FROM lessons l
            JOIN lessonstype lt ON l.type_id = lt.id
            WHERE l.id = $1`,
            [id]
        );

        const [iv, encryptedData] = result.rows[0].encrypted_data.split(":");
        const decrypted = crypt.decrypt(encryptedData, iv);
        const data = JSON.parse(decrypted);
        const lesson = {
            type: result.rows[0].type,
            name: result.rows[0].name,
            data: data
        };

        res.status(200).json({success: true, message: "Учебный материал успешно загружен!", lesson: lesson});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.post("/savetest", async (req, res) => {
    const { login, lessonid, answers } = req.body;

    try {
        let result = await pool.query(
            `SELECT encrypted_data FROM lessons WHERE id = $1`,
            [lessonid]
        );
        const [iv, encryptedData] = result.rows[0].encrypted_data.split(":");
        const decrypted = crypt.decrypt(encryptedData, iv);
        const data = JSON.parse(decrypted);
        const questions = data.questions;

        let errors = [];
        answers.forEach(userAnswer => {
            const question = questions.find(q => q.text === userAnswer.question);
            const correctAnswer = question.answers.find(a => a.isCorrect);
            if (userAnswer.answer !== correctAnswer.text) {
                errors.push({
                    question: question.text,
                    userAnswer: userAnswer.answer,
                    correctAnswer: correctAnswer.text,
                    explanation: question.explanation
                });
            }
        });

        if (errors.length === 0) {
            result = await pool.query(
                "SELECT * FROM student_progress WHERE lesson_id = $1",
                [lessonid]
            );
            await pool.query(
                `INSERT INTO student_progress VALUES 
                (DEFAULT, (SELECT id FROM users WHERE login = $1), $2, $3, $4, 0, 100, true)`,
                [login, lessonid, answers.length, answers.length]
            );

            return res.status(200).json({success: true, message: "Нет ошибок!"});
        } else {
            const totalQuestions = questions.length;
            const incorrectAnswers = errors.length;
            const correctAnswers = totalQuestions - incorrectAnswers;
            const percent = (correctAnswers / totalQuestions) * 100;
            const passed = percent >= 70;

            if (passed) {
                await pool.query(
                    `INSERT INTO student_progress VALUES 
                    (DEFAULT, (SELECT id FROM users WHERE login = $1), $2, $3, $4, 0, 100, true)`,
                    [login, lessonid, answers.length, answers.length]
                );
            }

            return res.status(200).json({success: true, message: "Есть ошибки в тесте!", result: {passed, errors}});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

export default router;