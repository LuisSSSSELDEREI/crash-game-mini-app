const TelegramBot = require('node-telegram-bot-api');

// Токен бота
const token = '7748102471:AAGl8FGh8MPRHT0Ho7fpYRxacw3zYHPB28I';

// URL мини-приложения
const webAppUrl = 'https://luissssselderei.github.io/crash-game-mini-app/';

// Создаем бота
const bot = new TelegramBot(token, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        await bot.sendMessage(chatId, 'Добро пожаловать в Crash Game! 🎮', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🎲 Играть', web_app: { url: webAppUrl } }]
                ]
            }
        });
    } catch (error) {
        console.error('Error:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
    }
});

// Обработка всех остальных сообщений
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    
    // Если это не команда /start
    if (!msg.text || msg.text !== '/start') {
        try {
            await bot.sendMessage(chatId, 'Нажмите кнопку "Играть", чтобы начать игру! 🎮', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🎲 Играть', web_app: { url: webAppUrl } }]
                    ]
                }
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

console.log('Bot is running...');
