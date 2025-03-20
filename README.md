# Reddit Topic Analyzer

Reddit Topic Analyzer - это веб-приложение, которое позволяет анализировать обсуждения и настроения на Reddit по заданной теме. Приложение использует AI для анализа постов и комментариев, предоставляя полезные инсайты и визуализацию данных.

## Основные возможности

- 🔍 Поиск постов на Reddit по теме
- 📊 Анализ настроений (sentiment analysis)
- 📈 Определение трендов и часто используемых слов
- 🎯 Выявление влиятельных пользователей
- 📱 Адаптивный дизайн для всех устройств

## Технологический стек

- Frontend:
  - React
  - TypeScript
  - Material-UI (MUI)
  - React Router
  - Context API для управления состоянием

- Backend:
  - Python
  - FastAPI
  - PRAW (Python Reddit API Wrapper)
  - Natural Language Processing (NLP) библиотеки

## Требования

- Node.js (версия 14 или выше)
- Python (версия 3.8 или выше)
- Reddit API credentials

## Установка и запуск

### Frontend

1. Перейдите в директорию frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
# или
yarn install
```

3. Создайте файл .env в директории frontend:
```env
REACT_APP_API_URL=http://localhost:8000
```

4. Запустите приложение:
```bash
npm start
# или
yarn start
```

Приложение будет доступно по адресу http://localhost:3000

### Backend

1. Перейдите в директорию backend:
```bash
cd backend
```

2. Создайте и активируйте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # для Linux/Mac
venv\Scripts\activate     # для Windows
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Создайте файл .env в директории backend:
```env
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=your_user_agent
```

5. Запустите сервер:
```bash
uvicorn main:app --reload
```

Сервер будет доступен по адресу http://localhost:8000

## Структура проекта

```
reddit-analyzer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Reddit/
│   │   │   ├── Auth/
│   │   │   └── Layout/
│   │   ├── contexts/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   └── services/
│   ├── requirements.txt
│   └── main.py
└── README.md
```

## API Endpoints

### POST /api/search
Поиск и анализ постов на Reddit.

Request:
```json
{
  "topic": "string"
}
```

Response:
```json
{
  "posts": [
    {
      "id": "string",
      "title": "string",
      "text": "string",
      "url": "string",
      "score": "number",
      "num_comments": "number",
      "created_utc": "number",
      "subreddit": "string",
      "author": "string",
      "permalink": "string"
    }
  ],
  "analysis": {
    "overall_sentiment": "string",
    "toxicity_level": "number",
    "frequent_words": ["string"],
    "influential_accounts": ["string"]
  }
}
```

## Разработка

### Добавление новых функций

1. Создайте новую ветку для функционала:
```bash
git checkout -b feature/new-feature
```

2. Внесите изменения и создайте коммит:
```bash
git add .
git commit -m "Add new feature"
```

3. Отправьте изменения в репозиторий:
```bash
git push origin feature/new-feature
```

### Код стайл

- Frontend: следуйте правилам ESLint и Prettier
- Backend: следуйте PEP 8

## Лицензия

MIT License. См. файл LICENSE для деталей. 