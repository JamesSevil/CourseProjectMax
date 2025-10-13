import express from "express";
import { pool } from "../server.js";
import crypt from "./crypt.js";

const router = express.Router();

router.get("/:login", async (req, res) => {
    const login = req.params.login;

    try {
        const result = await pool.query(
            `SELECT sp.lesson_id AS id, sp.correct_answers, sp.total_questions, (sp.max_attempts - sp.attempt_count) AS remaining_attempts, sp.passed
            FROM student_progress sp
            WHERE sp.user_id = (SELECT id FROM users WHERE login = $1)
            ORDER BY sp.lesson_id ASC`,
            [login]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({success: true, message: "Прогресса нет!", lessons: []});
        }

        const lessons = result.rows.map(row => {
            return {
                id: row.id,
                answers: row.correct_answers,
                questions: row.total_questions,
                attempts: row.remaining_attempts,
                passed: row.passed
            };
        });

        res.status(200).json({success: true, message: "Прогресс успешно получен!", lessons: lessons});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.post("/savelecture", async (req, res) => {
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
                });
            }
        });

        if (errors.length === 0) {
            result = await pool.query(
                "SELECT * FROM student_progress WHERE lesson_id = $1 AND user_id = (SELECT id FROM users WHERE login = $2)",
                [lessonid, login]
            );
            if (result.rows.length === 0) {
                await pool.query(
                    `INSERT INTO student_progress VALUES 
                    (DEFAULT, (SELECT id FROM users WHERE login = $1), $2, $3, $4, 1, 3, true)`,
                    [login, lessonid, answers.length, answers.length]
                ); 
            } else {
                await pool.query(
                    `UPDATE student_progress 
                    SET correct_answers = $1, attempt_count = $2, passed = $3 
                    WHERE lesson_id = $4 AND user_id = (SELECT id FROM users WHERE login = $5)`,
                    [answers.length, result.rows[0].attempt_count + 1, true, lessonid, login]
                ); 
            }

            return res.status(200).json({success: true, message: "Нет ошибок!"});
        } else {
            let reset;
            const totalQuestions = questions.length;
            const incorrectAnswers = errors.length;
            const correctAnswers = totalQuestions - incorrectAnswers;
            const percent = (correctAnswers / totalQuestions) * 100;
            const passed = percent >= 70;

            if (passed) {
                result = await pool.query(
                "SELECT * FROM student_progress WHERE lesson_id = $1 AND user_id = (SELECT id FROM users WHERE login = $2)",
                [lessonid, login]
                );
                if (result.rows.length === 0) {
                    await pool.query(
                        `INSERT INTO student_progress VALUES 
                        (DEFAULT, (SELECT id FROM users WHERE login = $1), $2, $3, $4, 1, 3, true)`,
                        [login, lessonid, correctAnswers, answers.length]
                    ); 
                } else {
                    await pool.query(
                        `UPDATE student_progress 
                        SET correct_answers = $1, attempt_count = $2, passed = $3 
                        WHERE lesson_id = $4 AND user_id = (SELECT id FROM users WHERE login = $5)`,
                        [answers.length, result.rows[0].attempt_count + 1, true, lessonid, login]
                    ); 
                }
            } else {
                result = await pool.query(
                "SELECT * FROM student_progress WHERE lesson_id = $1 AND user_id = (SELECT id FROM users WHERE login = $2)",
                [lessonid, login]
                );
                if (result.rows.length === 0) {
                    await pool.query(
                        `INSERT INTO student_progress VALUES 
                        (DEFAULT, (SELECT id FROM users WHERE login = $1), $2, $3, $4, 1, 3, false)`,
                        [login, lessonid, correctAnswers, answers.length]
                    );
                } else {
                    await pool.query(
                        `UPDATE student_progress 
                        SET correct_answers = $1, attempt_count = $2, passed = $3 
                        WHERE lesson_id = $4 AND user_id = (SELECT id FROM users WHERE login = $5)`,
                        [answers.length, result.rows[0].attempt_count + 1, false, lessonid, login]
                    );

                    if (result.rows[0].attempt_count + 1 >= result.rows[0].max_attempts) {
                        await pool.query(
                            "DELETE FROM student_progress WHERE user_id = (SELECT id FROM users WHERE login = $1)",
                            [login]
                        );
                    }
                }
            }

            return res.status(200).json({success: true, message: "Есть ошибки в тесте!", result: {passed, errors}});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

export default router;