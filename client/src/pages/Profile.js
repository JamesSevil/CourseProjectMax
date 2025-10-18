import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/profile.css";

const Profile = () => {
    const [login, setLogin] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [role, setRole] = useState("");
    const [nameLabel, setNameLabel] = useState("");
    const [surnameLabel, setSurnameLabel] = useState("");
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedName = sessionStorage.getItem("name") || localStorage.getItem("name");
        const storedSurname = sessionStorage.getItem("surname") || localStorage.getItem("surname");
        const storedRole = sessionStorage.getItem("role") || localStorage.getItem("role");
        const storedLogin = sessionStorage.getItem("login") || localStorage.getItem("login");

        if (storedName || storedSurname) {
            setName(storedName);
            setSurname(storedSurname);
            setNameLabel(storedName);
            setSurnameLabel(storedSurname);
            setLogin(storedLogin);
            if (storedRole) setRole(storedRole);
        }
    }, []);

    const handleChangeInformation = async () => {
        if (nameLabel === name && surnameLabel === surname) {
            alert("Не внесены изменения!");
            return;
        } else if (nameLabel.length < 2 || nameLabel.length > 20) {
            alert("Имя должно содержать от 2 до 20 символов!");
            return;
        } else if (surnameLabel.length < 2 || surnameLabel.length > 20) {
            alert("Фамилия должна содержать от 2 до 20 символов!");
            return;
        }

        try {
            const response = await axios.put("http://localhost:5000/users/data", {
                login: login,
                name: nameLabel,
                surname: surnameLabel
            });

            if (response.status === 200 && response.data.success) {
                console.log(response.data.message);
                alert("Данные успешно изменены!");
                if (sessionStorage.getItem("name").length != 0) {
                    sessionStorage.setItem("name", nameLabel);
                    sessionStorage.setItem("surname", surnameLabel);
                } else if (localStorage.getItem("name").length != 0) {
                    localStorage.setItem("name", nameLabel);
                    localStorage.setItem("surname", surnameLabel);
                }
                setName(nameLabel);
                setSurname(surnameLabel);
            } else {
                console.error("Ошибка при изменении данных: ", response.data.message);
                alert(`Не удалось изменить данные: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при изменении данных: ", error.response.data.message);
            alert(`Не удалось изменить данные: ${error.response.data.message}`);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert("Пароли не совпадают!");
            return;
        } else if (oldPassword === newPassword) {
            alert("Старый и новый пароли совпадают!");
            return;
        } else if (newPassword.length < 4 || newPassword.length > 20) {
            alert("Пароль должен содержать от 4 до 20 символов!");
            return;
        }

        try {
            const response = await axios.put("http://localhost:5000/users/pass", {
                login: login,
                oldPassword: oldPassword,
                newPassword: newPassword
            });

            if (response.status === 200 && response.data.success) {
                console.log(response.data.message);
                alert("Пароль был успешно изменен!");
            } else {
                console.error("Ошибка при изменении пароля: ", response.data.message);
                alert(`Не удалось изменить пароль: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при изменении пароля: ", error.response.data.message);
            alert(`Не удалось изменить пароль: ${error.response.data.message}`);
        }

        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="profile">
            <b>{role}</b>  {name} {surname}

            <div className="changeinformation">
                <p></p>
                <b>Персональные данные</b>
                <div className="input">
                    <input
                        type="text"
                        id="name"
                        value={nameLabel}
                        onChange={(e) => setNameLabel(e.target.value)}
                        placeholder="Имя"
                    />
                </div>
                <div className="input">
                    <input
                        type="text"
                        id="surname"
                        value={surnameLabel}
                        onChange={(e) => setSurnameLabel(e.target.value)}
                        placeholder="Фамилия"
                    />
                </div>
                <button onClick={handleChangeInformation}>Сменить</button>
                <p></p>
            </div>

            <div className="changepassword">
                <b>Изменение пароля</b>
                <div className="input">
                    <input
                        type="password"
                        id="oldpassword"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Старый пароль"
                        required
                    />
                </div>
                <div className="input">
                    <input
                        type="password"
                        id="newpassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Новый пароль"
                        required
                    />
                </div>
                <div className="input">
                    <input
                        type="password"
                        id="confirmpassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Повтор нового пароля"
                        required
                    />
                </div>
                <button onClick={handleChangePassword}>Сохранить</button>
            </div>

            <p><button onClick={() => {navigate('/')}}>Назад</button></p>
        </div>
    );
};

export default Profile;