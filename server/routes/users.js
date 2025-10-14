import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../server.js";

const router = express.Router();

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

router.post("/", async (req, res) => {
    const {login, password, name, surname, role} = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE login = $1`,
            [login]
        );
        if (result.rows.length !== 0) {
            return res.status(404).json({success: false, message: "Такой пользователь уже существует!"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO users VALUES (DEFAULT, (SELECT id FROM usersrole WHERE role = $1), $2, $3, $4, $5)`,
            [role, login, hashedPassword, name, surname]
        );

        res.status(200).json({success: true, message: "Пользователь успешно добавлен!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.login, u.name, u.surname, r.role
            FROM users u
            JOIN usersrole r ON u.role_id = r.id
            WHERE r.role != $1`,
            ["Администратор"]
        );

        res.status(200).json({success: true, message: "Пользователи успешно загружены!", users: result.rows});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.delete("/:login", async (req, res) => {
    const login = req.params.login;

    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE login = $1`,
            [login]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: "Пользователь не найден в базе данных!"});
        }

        await pool.query(
            `DELETE FROM users WHERE login = $1`,
            [login]
        );

        res.status(200).json({success: true, message: "Пользователь успешно удален!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.put("/", async (req, res) => {
    const {loginuser, login, password, name, surname, role} = req.body;

    try {
        const checklogin = await pool.query(
          `SELECT * FROM users WHERE login = $1`,
          [login]  
        );
        if (checklogin.rows.length !== 0 && (checklogin.rows[0].name != name && checklogin.rows[0].surname != surname)) {
            return res.status(404).json({success: false, message: "Такой логин уже существует!"});
        }

        const result = await pool.query(
            `SELECT * FROM users WHERE login = $1`,
            [loginuser]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: "Пользователь не найден в базе данных!"});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `UPDATE users
            SET login = $1, password = $2, name = $3, surname = $4, role_id = (SELECT id FROM usersrole WHERE role = $5)
            WHERE id = $6`,
            [login, hashedPassword, name, surname, role, result.rows[0].id]
        );

        res.status(200).json({success: true, message: "Пользователь успешно обновлён!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

router.get("/students", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT name, surname FROM users WHERE role_id = (SELECT id FROM usersrole WHERE role = 'Студент')"
        );

        res.status(200).json({success: true, message: "Пользователи успешно загружены!", users: result.rows});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "Ошибка сервера!"});
    }
});

export default router;