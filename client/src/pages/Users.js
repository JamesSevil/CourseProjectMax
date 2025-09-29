import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Users = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [role, setRole] = useState("");
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editLogin, setEditLogin] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editConfirmPassword, setEditConfirmPassword] = useState("");
    const [editName, setEditName] = useState("");
    const [editSurname, setEditSurname] = useState("");
    const [editRole, setEditRole] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/users", {});

            if (response.status === 200 && response.data.success) {
                setUsers(response.data.users);
            } else {
                console.error("Ошибка при загрузке пользователей: ", response.data.message);
                alert(`Не удалось загрузить пользователей: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при загрузке пользователей: ", error.response.data.message);
            alert(`Не удалось загрузить пользователей: ${error.response.data.message}`);
        }
    }

    const handleAddUser = async () => {
        if (password !== confirmPassword) {
            alert("Пароли не совпадают!");
            return;
        } else if (login.length < 4 || login.length > 20) {
            alert("Логин должен содержать от 4 до 20 символов!");
            return;
        } else if (password.length < 4 || password.length > 20) {
            alert("Пароль должен содержать от 4 до 20 символов!");
            return;
        } else if (name.length < 2 || name.length > 20) {
            alert("Имя должно содержать от 2 до 20 символов!");
            return;
        } else if (surname.length < 2 || surname.length > 20) {
            alert("Фамилия должна содержать от 2 до 20 символов!");
            return;
        } else if (!role) {
            alert("Выберите роль пользователя!");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/users", {
                login: login,
                password: password,
                name: name,
                surname: surname,
                role: role
            });

            if (response.status === 200 && response.data.success) {
                console.log(response.data.message);
                alert("Пользователь успешно добавлен!");
                setLogin("");
                setPassword("");
                setConfirmPassword("");
                setName("");
                setSurname("");
                setRole("");
                getUsers();
            } else {
                console.error("Ошибка при добавлении пользователя: ", response.data.message);
                alert(`Не удалось добавить пользователя: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при добавлении пользователя: ", error.response.data.message);
            alert(`Не удалось добавить пользователя: ${error.response.data.message}`);
        }
    }

    const handleDelUser = async (login) => {
        try {
            const response = await axios.delete(`http://localhost:5000/users/${login}`);

            if (response.status === 200 && response.data.success) {
                setUsers(prevUsers => prevUsers.filter(user => user.login !== login)); // обновление списка после удаления
                alert("Пользователь успешно удален!");
            } else {
                console.error("Ошибка при удалении пользователя: ", response.data.message);
                alert(`Не удалось удалить пользователя: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при удалении пользователя: ", error.response.data.message);
            alert(`Не удалось удалить пользователя: ${error.response.data.message}`);
        }
    }

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditLogin(user.login);
        setEditPassword("");
        setEditConfirmPassword("");
        setEditName(user.name);
        setEditSurname(user.surname);
        setEditRole(user.role);
    };

    const handleSaveChanges = async (user) => {
        const isChanged = editLogin !== user.login || editName !== user.name || editSurname !== user.surname || editRole !== user.role || editPassword;
        if (!isChanged) {
            alert("Данные не были изменены!");
            return;
        } else if (editPassword !== editConfirmPassword) {
            alert("Пароли не совпадают!");
            return;
        } else if (editLogin.length < 4 || login.length > 20) {
            alert("Логин должен содержать от 4 до 20 символов!");
            return;
        } else if ((editPassword.length < 4 || password.length > 20) && editPassword.length !== 0) {
            alert("Пароль должен содержать от 4 до 20 символов!");
            return;
        } else if (editName.length < 2 || name.length > 20) {
            alert("Имя должно содержать от 2 до 20 символов!");
            return;
        } else if (editSurname.length < 2 || surname.length > 20) {
            alert("Фамилия должна содержать от 2 до 20 символов!");
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/users`, {
                loginuser: user.login,
                login: editLogin,
                password: editPassword,
                name: editName,
                surname: editSurname,
                role: editRole
            });

            if (response.status === 200 && response.data.success) {
                alert("Пользователь успешно обновлен!");
                setEditingUser(null);
                getUsers();
            } else {
                console.error("Ошибка при обновлении пользователя: ", response.data.message);
                alert(`Не удалось обновить пользователя: ${response.data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при обновлении пользователя: ", error.response.data.message);
            alert(`Не удалось обновить пользователя: ${error.response.data.message}`);
        }
    };

    return (
        <div className="admin">
            <div className="adduser">
                <b>Добавление нового пользователя</b><br/>
                <div className="input">
                    <input type="text" value={login} placeholder="Логин" onChange={(e) => setLogin(e.target.value)}/><br/>
                    <input type="password" value={password} placeholder="Пароль" onChange={(e) => setPassword(e.target.value)}/><br/>
                    <input type="password" value={confirmPassword} placeholder="Подтверждение пароля" onChange={(e) => setConfirmPassword(e.target.value)}/><br/>
                    <input type="text" value={name} placeholder="Имя" onChange={(e) => setName(e.target.value)}/><br/>
                    <input type="text" value={surname} placeholder="Фамилия" onChange={(e) => setSurname(e.target.value)}/><br/>
                    <label><input type="radio" value="Преподаватель" checked={role === "Преподаватель"} onChange={(e) => setRole(e.target.value)}/>Преподаватель</label>
                    <label><input type="radio" value="Студент" checked={role === "Студент"} onChange={(e) => setRole(e.target.value)}/>Студент</label><br/>
                </div>
                <button onClick={handleAddUser}>Добавить</button><br/><br/>
            </div>

            <div className="tableusers">
                <b>Список пользователей</b><br/>
                {users.length === 0 ? (
                    <p>Пользователи не найдены</p>
                ) : (
                    <table border="1" cellPadding="5" cellSpacing="0">
                    <thead><tr>
                        <th>Имя</th>
                        <th>Фамилия</th>
                        <th>Логин</th>
                        <th>Роль</th>
                        <th>Действие</th>
                        </tr></thead>
                    <tbody>{users.map((user, index) => (
                        <tr key={index}>
                            <td>{user.name}</td>
                            <td>{user.surname}</td>
                            <td>{user.login}</td>
                            <td>{user.role}</td>
                            <td><button onClick={() => handleDelUser(user.login)}>Удалить</button> <button onClick={() => openEditModal(user)}>Изменить</button></td>
                        </tr>
                    ))}</tbody></table>)}

                    {editingUser && (
                        <div className="modal" style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            backgroundColor: "white",
                            padding: "20px",
                            border: "1px solid black",
                            zIndex: 1000}}>
                            <b>Редактирование пользователя</b><br/>
                            <input type="text" value={editLogin} placeholder="Логин" onChange={(e) => setEditLogin(e.target.value)}/><br/>
                            <input type="password" value={editPassword} placeholder="Пароль" onChange={(e) => setEditPassword(e.target.value)}/><br/>
                            <input type="password" value={editConfirmPassword} placeholder="Подтверждение пароля" onChange={(e) => setEditConfirmPassword(e.target.value)}/><br/>
                            <input type="text"value={editName} placeholder="Имя" onChange={(e) => setEditName(e.target.value)}/><br/>
                            <input type="text" value={editSurname} placeholder="Фамилия" onChange={(e) => setEditSurname(e.target.value)}/><br/>
                            <label><input type="radio" value="Преподаватель" checked={editRole === "Преподаватель"} onChange={(e) => setEditRole(e.target.value)}/>Преподаватель</label>
                            <label><input type="radio" value="Студент" checked={editRole === "Студент"} onChange={(e) => setEditRole(e.target.value)}/>Студент</label><br/>
                            <button onClick={() => handleSaveChanges(editingUser)}>Сохранить</button>
                            <button onClick={() => setEditingUser(null)}>Отмена</button>
                        </div>
                    )}
            </div>

            <p><button onClick={() => {navigate('/')}}>Назад</button></p>
        </div>

    );
};

export default Users;