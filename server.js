const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const pageTemplate = (content) => `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Калькулятор ИМТ</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>
`;

app.get('/', (req, res) => {
    const form = `
        <h1>Калькулятор ИМТ</h1>
        <form action="/calculate-bmi" method="POST">
            <label>Вес (кг):</label>
            <input type="number" step="0.1" name="weight" required>

            <label>Рост (см):</label>
            <input type="number" name="height" required>

            <p>Пожалуйста, введите рост в сантиметрах!</p>

            <button type="submit">Рассчитать ИМТ</button>
        </form>
    `;
    res.send(pageTemplate(form));
});

app.post('/calculate-bmi', (req, res) => {
    const weight = parseFloat(req.body.weight);
    const heightCm = parseFloat(req.body.height);

    if (isNaN(weight) || isNaN(heightCm) || weight <= 0 || heightCm <= 0) {
        return res.send(pageTemplate(`
            <h1 style="color: red;">Ошибка ввода</h1>
            <p>Введите положительные числа!</p>
            <a href="/">← Вернуться</a>
        `));
    }

    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);

    let category, color;
    if (bmi < 18.5)      { category = 'Недостаточный вес'; color = '#e74c3c'; }
    else if (bmi < 25)   { category = 'Нормальный вес';     color = '#27ae60'; }
    else if (bmi < 30)   { category = 'Избыточный вес';    color = '#f39c12'; }
    else                 { category = 'Ожирение';          color = '#c0392b'; }

    const result = `
        <h1>Ваш ИМТ: ${bmi.toFixed(2)}</h1>
        <p style="color: ${color}; font-size: 1.5em; font-weight: bold;">
            Категория: ${category}
        </p>
        <a href="/">← Рассчитать ещё раз</a>
    `;

    res.send(pageTemplate(result));
});

app.listen(port, () => {
    console.log(`Сервер запущен → http://localhost:${port}`);
});