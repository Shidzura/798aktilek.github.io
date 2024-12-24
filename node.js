const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json()); // Для парсинга JSON тела запроса

// Подключаемся к базе данных
mongoose.connect('mongodb://localhost:27017/loginApp', { useNewUrlParser: true, useUnifiedTopology: true });

// Схема для пользователей
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    birthYear: String,
    birthDate: String,
});

const User = mongoose.model('User', userSchema);

// Регистрация пользователя
app.post('/register', async (req, res) => {
    const { firstName, lastName, birthYear, birthDate } = req.body;

    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    const password = `${birthYear}${birthDate.split('-').join('')}`; // Простой способ для теста

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, firstName, lastName, birthYear, birthDate });

    try {
        await newUser.save();
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: 'Error creating account' });
    }
});

// Логин пользователя
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.json({ success: false, message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.json({ success: false, message: 'Invalid password' });

    const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
    res.json({ success: true, token });
});

// Запуск сервера
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
