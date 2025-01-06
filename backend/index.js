const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB подключение
const MONGODB_URI = 'mongodb://Luiska:Qwerty6543211232@ac-qgbwkzm-shard-00-00.mlzt1.mongodb.net:27017,ac-qgbwkzm-shard-00-01.mlzt1.mongodb.net:27017,ac-qgbwkzm-shard-00-02.mlzt1.mongodb.net:27017/crash-game?ssl=true&replicaSet=atlas-qgbwkzm-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
}).then(() => console.log('MongoDB подключено'))
.catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Модель пользователя
const User = mongoose.model('User', {
    telegramId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 1000 },
    username: String,
    firstName: String,
    lastName: String,
    createdAt: { type: Date, default: Date.now }
});

// API endpoints
app.post('/api/user/init', async (req, res) => {
    try {
        const { telegramId, username, firstName, lastName } = req.body;
        
        // Поиск существующего пользователя
        let user = await User.findOne({ telegramId });
        
        if (!user) {
            // Создание нового пользователя
            user = new User({
                telegramId,
                username,
                firstName,
                lastName,
                balance: 1000 // Начальный баланс
            });
            await user.save();
            console.log('New user created:', user);
        }
        
        res.json({
            success: true,
            user: {
                telegramId: user.telegramId,
                balance: user.balance,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Error in /api/user/init:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Обновление баланса
app.post('/api/user/update-balance', async (req, res) => {
    try {
        const { telegramId, newBalance } = req.body;
        
        const user = await User.findOneAndUpdate(
            { telegramId },
            { balance: newBalance },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        console.log('Balance updated for user:', user);
        res.json({
            success: true,
            user: {
                telegramId: user.telegramId,
                balance: user.balance,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Error in /api/user/update-balance:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Получение данных пользователя
app.get('/api/user/:telegramId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.telegramId });
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({
            success: true,
            user: {
                telegramId: user.telegramId,
                balance: user.balance,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Error in /api/user/:telegramId:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Получить список всех пользователей
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        res.status(500).json({ error: 'Ошибка при получении пользователей' });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
