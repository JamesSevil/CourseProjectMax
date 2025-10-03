import express from "express";
import cors from "cors";
import pkg from "pg";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import lessonsRoutes from "./routes/lessons.js";

const app = express();
const { Pool } = pkg;
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/lessons", lessonsRoutes);
const PORT = 5000;

export const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "learnprogamixas",
    password: "superparol",
    port: 5432,
});

const StartServer = async () => {
    try {
        await pool.connect();
        console.log("Успешное подключение к базе данных!");
        
        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    } catch (error) {
        console.error("Ошибка подключения к базе данных: ", error);
        process.exit(1);
    }
};

StartServer();