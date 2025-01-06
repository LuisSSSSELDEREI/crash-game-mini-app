const mongoose = require('mongoose');

// MongoDB подключение
const MONGODB_URI = 'mongodb+srv://Luiska:Qwerty6543211232@miniapp.mlzt1.mongodb.net/?retryWrites=true&w=majority&appName=Miniapp';

// Модель пользователя
const User = mongoose.model('User', {
    telegramId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 1000 },
    username: String,
    firstName: String,
    lastName: String,
    createdAt: { type: Date, default: Date.now }
});

async function runTests() {
    try {
        // Подключение к базе данных
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB Atlas');

        // 1. Создание тестового пользователя
        const testUser = {
            telegramId: '12345',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User'
        };

        console.log('\n1. Создание пользователя...');
        let user = await User.findOne({ telegramId: testUser.telegramId });
        if (!user) {
            user = new User(testUser);
            await user.save();
            console.log('Пользователь создан:', user);
        } else {
            console.log('Пользователь уже существует:', user);
        }

        // 2. Обновление баланса
        console.log('\n2. Обновление баланса...');
        const newBalance = 2000;
        user = await User.findOneAndUpdate(
            { telegramId: testUser.telegramId },
            { balance: newBalance },
            { new: true }
        );
        console.log('Баланс обновлен:', user);

        // 3. Получение всех пользователей
        console.log('\n3. Список всех пользователей:');
        const allUsers = await User.find({});
        console.log(`Всего пользователей: ${allUsers.length}`);
        allUsers.forEach(u => {
            console.log(`- ${u.username} (ID: ${u.telegramId}), баланс: ${u.balance}`);
        });

    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        // Закрываем соединение
        await mongoose.connection.close();
        console.log('\nСоединение с базой данных закрыто');
    }
}

runTests();
