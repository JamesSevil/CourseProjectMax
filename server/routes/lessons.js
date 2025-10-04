import express, { json } from "express";
import { pool } from "../server.js";
import crypt from "./crypt.js";

const router = express.Router();

router.post("/lecture", async (req, res) => {
    const { lectureName, lectureText, questions } = req.body;

    try {
        const payload = JSON.stringify({
            lecture: lectureText,
            questions: questions
        });
        const { encryptedData, iv } = crypt.encrypt(payload);

        await pool.query(
            "INSERT INTO lessons VALUES (DEFAULT, (SELECT id FROM lessonstype WHERE type = 'Лекция'), $1, $2)",
            [lectureName, `${iv}:${encryptedData}`]
        );

        res.status(200).json({success: true, message: "Лекция успешно добавлена!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.post("/test", async (req, res) => {
    const { testName, questions } = req.body;

    try {
        const payload = JSON.stringify({
            questions: questions
        });
        const { encryptedData, iv } = crypt.encrypt(payload);

        await pool.query(
            "INSERT INTO lessons VALUES (DEFAULT, (SELECT id FROM lessonstype WHERE type = 'Тест'), $1, $2)",
            [testName, `${iv}:${encryptedData}`]
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

        await pool.query(
            "INSERT INTO lessons VALUES (DEFAULT, (SELECT id FROM lessonstype WHERE type = 'Итоговый тест'), $1, $2)",
            [testName, `${iv}:${encryptedData}`]
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
            `SELECT l.id, lt.type, l.name, l.encrypted_data
            FROM lessons l
            JOIN lessonstype lt ON l.type_id = lt.id
            ORDER BY l.id DESC`
        );

        const lessons = result.rows.map(row => {
            const [iv, encryptedData] = row.encrypted_data.split(":");
            const decrypted = crypt.decrypt(encryptedData, iv);
            const data = JSON.parse(decrypted);

            const lesson = {
                id: row.id,
                type: row.type,
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
    const {id, name, text, questions} = req.body;
    
    try {
        const result = await pool.query(
            `SELECT * FROM lessons WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: "Материал не найден в базе данных!"});
        }
        
        const payload = JSON.stringify({
            lecture: text,
            questions: questions
        });
        const { encryptedData, iv } = crypt.encrypt(payload);

        await pool.query(
            `UPDATE lessons
            SET type_id = (SELECT id FROM lessonstype WHERE type = $1), name = $2, encrypted_data = $3
            WHERE id = $4`,
            ["Лекция", name, `${iv}:${encryptedData}`, id]
        );

        res.status(200).json({success: true, message: "Материал успешно изменен!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.put("/test", async (req, res) => {
    const {id, name, questions} = req.body;
    
    try {
        const result = await pool.query(
            `SELECT * FROM lessons WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: "Материал не найден в базе данных!"});
        }
        
        const payload = JSON.stringify({
            questions: questions
        });
        const { encryptedData, iv } = crypt.encrypt(payload);

        await pool.query(
            `UPDATE lessons
            SET type_id = (SELECT id FROM lessonstype WHERE type = $1), name = $2, encrypted_data = $3
            WHERE id = $4`,
            ["Тест", name, `${iv}:${encryptedData}`, id]
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
        const result = await pool.query(
            `SELECT * FROM lessons WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: "Материал не найден в базе данных!"});
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

export default router;