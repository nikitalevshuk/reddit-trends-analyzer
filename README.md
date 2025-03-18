# Reddit Topic Analyzer

A web application that allows users to search for any topic on Reddit and get an analysis of recent posts.

## Features

- Search Reddit posts by topic
- View detailed post information
- Expandable post cards
- Modern Material-UI interface
- Real-time search results

## Prerequisites

- Python 3.8+
- Node.js 16+
- Redis server
- Reddit API credentials
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd reddit-topic-analyzer
```

2. Set up the backend:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy .env.example to .env and fill in your credentials
cp .env.example .env
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Start Redis server:
```bash
# On Windows, make sure Redis is installed and running
# On Linux/Mac:
redis-server
```

5. Start the backend server:
```bash
# From the root directory
uvicorn backend.main:app --reload
```

6. Start the frontend development server:
```bash
# From the frontend directory
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=your_user_agent
OPENAI_API_KEY=your_openai_api_key
REDIS_URL=redis://localhost:6379
```

## API Endpoints

- `POST /api/search`: Search Reddit posts by topic
  - Request body: `{ "topic": "your search topic", "limit": 100 }`
  - Returns: List of Reddit posts with their details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 