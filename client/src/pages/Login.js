import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        try {
            const response = await axios.post("http://localhost:5000/auth/login", {
                login: username,
                password: password
            });
    
            if (response.status === 200 && response.data.success) {
                console.log(response.data.message);
                if (remember) {
                    localStorage.setItem("login", response.data.user.login);
                    localStorage.setItem("name", response.data.user.name);
                    localStorage.setItem("surname", response.data.user.surname);
                    localStorage.setItem("role", response.data.user.role);
                }
                else {
                    sessionStorage.setItem("login", response.data.user.login);
                    sessionStorage.setItem("name", response.data.user.name);
                    sessionStorage.setItem("surname", response.data.user.surname);
                    sessionStorage.setItem("role", response.data.user.role);
                }
                navigate('/');
            } else {
                console.error("Ошибка при авторизации: ", response.data.message);
                alert(`Не удалось авторизоваться: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при авторизации: ", error.response.data.message);
            alert(`Не удалось авторизоваться: ${error.response.data.message}`);
        }
    };

    return (
        <div className="login">
            <h2>Авторизация</h2>

            <form onSubmit={handleSubmit}>
                <div className="input">
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Логин"
                        required
                    />
                </div>
                <div className="input">
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Пароль"
                        required
                    />
                </div>
                <div className="checkbox">
                    <label>
                        <input
                            type="checkbox"
                            id="boxcheck"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        Запомнить меня
                    </label>
                </div>
                <button type="submit">Войти</button>
            </form>
        </div>
    );
};

export default Login;