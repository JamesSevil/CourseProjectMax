import express from "express";
import { pool } from "../server.js";

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

export default router;