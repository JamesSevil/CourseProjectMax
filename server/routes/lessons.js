import express from "express";
import { pool } from "../server.js";
import crypt from "./crypt.js";

const router = express.Router();

router.post("/lecture", async (req, res) => {
    const { type, lectureName, lectureText, questions } = req.body;

    try {
        const payload = JSON.stringify({
            lecture: lectureText,
            questions: questions
        });
        const { encryptedData, iv } = crypt.encrypt(payload);

        await pool.query(
            "INSERT INTO lessons VALUES (DEFAULT, (SELECT id FROM lessonstype WHERE type = 'lecture'), $1, $2)",
            [lectureName, `${iv}:${encryptedData}`]
        );

        res.status(200).json({success: true, message: "Лекция успешно добавлена!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

export default router;