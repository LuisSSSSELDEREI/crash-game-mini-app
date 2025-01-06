const mongoose = require('mongoose');

// MongoDB подключение
const MONGODB_URI = 'mongodb://Luiska:Qwerty6543211232@ac-qgbwkzm-shard-00-00.mlzt1.mongodb.net:27017,ac-qgbwkzm-shard-00-01.mlzt1.mongodb.net:27017,ac-qgbwkzm-shard-00-02.mlzt1.mongodb.net:27017/crash-game?ssl=true&replicaSet=atlas-qgbwkzm-shard-0&authSource=admin&retryWrites=true&w=majority';

// Модель пользователя
const User = mongoose.model('User', {
    telegramId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 1000 },
    username: String,
    firstName: String,
    lastName: String,
    createdAt: { type: Date, default: Date.now }
});

async function checkUsers() {
    try {
        console.log('Подключение к MongoDB...');
        
        mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        })
        .then(() => {
            console.log('MongoDB подключено');
            return checkUsers();
        })
        .catch(err => console.error('Ошибка подключения к MongoDB:', err))
        .finally(() => {
            mongoose.connection.close();
            console.log('Соединение с базой данных закрыто');
        });

        // Получаем всех пользователей
        const users = await User.find({});
        
        if (users.length === 0) {
            console.log('База данных пуста. Пользователей нет.');
        } else {
            console.log(`Найдено пользователей: ${users.length}\n`);
            users.forEach(user => {
                console.log(`Пользователь:`);
                console.log(`- Telegram ID: ${user.telegramId}`);
                console.log(`- Имя пользователя: ${user.username}`);
                console.log(`- Имя: ${user.firstName}`);
                console.log(`- Фамилия: ${user.lastName}`);
                console.log(`- Баланс: ${user.balance}`);
                console.log(`- Создан: ${user.createdAt}`);
                console.log('-------------------');
            });
        }

    } catch (error) {
        console.error('Ошибка при проверке пользователей:', error);
    } 
}

checkUsers();
