import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../server.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    const {login, password} = req.body;

    try {
        const result = await pool.query(
            `SELECT u.login, u.password, u.name, u.surname, r.role
            FROM users u
            JOIN usersrole r ON u.role_id = r.id
            WHERE u.login = $1`, // $1 placeholder для предотвращения SQL-инъекции
            [login] // значение, которое поставится вместо $1
        );

        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({success: false, message: "Неверный логин!"});
        }
        const checkpassword = await bcrypt.compare(password, user.password);
        if (!checkpassword) {
            return res.status(401).json({success: false, message: "Неверный пароль!"});
        }

        res.status(200).json({success: true, message: "Упешная авторизация!", user: {
            login: user.login,
            name: user.name,
            surname: user.surname,
            role: user.role
        }});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.put("/data", async (req, res) => {
    const {login, name, surname} = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE login = $1`,
            [login]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: "Пользователь не найден в базе данных!"});
        }

        await pool.query(
            `UPDATE users
            SET name = $1, surname = $2
            WHERE login = $3`,
            [name, surname, login]
        );
        res.status(200).json({success: true, message: "Упешное обновление данных!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.put("/pass", async (req, res) => {
    const {login, oldPassword, newPassword} = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE login = $1`,
            [login]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: "Пользователь не найден в базе данных!"});
        }

        const checkPassword = await bcrypt.compare(oldPassword, result.rows[0].password);
        if (!checkPassword) {
            return res.status(403).json({success: false, message: "Старый пароль неверный!"});
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            `UPDATE users
            SET password = $1
            WHERE login = $2`,
            [hashedNewPassword, login]
        );

        res.status(200).json({success: true, message: "Пароль успешно обновлён!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

export default router;