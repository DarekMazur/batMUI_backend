# BatQuiz 3.0 Backend
This repository contains the backend code for BatQuiz 3.0. It is a Node.js application that provides a REST API for a quiz game. The application interacts with a PostgreSQL database to store quiz questions and the top scores.

## Features
- REST API for quiz functionality
- Data persistence using PostgreSQL
- Quiz questions and top scores management
- Built with TypeScript
- Environment variable configuration via `.env` file

## Technologies
- Node.js
- Express: REST API framework
- PostgreSQL: Database for storing quiz data
- TypeScript: Type safety and modern JavaScript features
- Dotenv: For environment variable management
- JWT: JSON Web Tokens for authentication 

## Requirements
- Node.js (v14+)
- PostgreSQL (v13+)
- npm (v6+)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/DarekMazur/batMUI_backend.git
cd batMUI_backend
```

2. Install dependencies:
```bash
npm install 
```

3. Create a `.env` file in the root directory. Example:
```
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=batquiz
JWT_SECRET=your_jwt_secret
```

4. Setup your PostgreSQL database:
  - Create a PostgreSQL database.
  - Set up the necessary tables questions and results for storing quiz questions and top scores.

5. Run the application in development mode:
```bash
npm run dev 
```

The application will start using `nodemon` for auto-reloading on file changes.

6. For production, build and start the application:
```bash
npm run tsc
npm run start:prod 
```

## Scripts

- `npm run dev:` Runs the application in development mode with `nodemon`.
- `npm run tsc:` Compiles the TypeScript code into JavaScript.
- `npm run start:prod:` Starts the compiled JavaScript application for production.

## API Endpoints

Here are some of the potential REST API routes (exact routes and payloads would need to be added as per the codebase):

- GET /quiz/questions: Fetches the list of available quiz questions.
- POST /quiz/submit: Submits quiz answers and calculates the score.
- GET /quiz/scores: Retrieves the highest scores.

## Database

The application uses a PostgreSQL database to store quiz questions and high scores. Ensure you configure the `.env` file correctly for database credentials.

## Environment Variables

- `DB_HOST:` Hostname for the PostgreSQL database
- `DB_USER:` Username for the database
- `DB_PASSWORD:` Password for the database
- `DB_NAME:` Name of the database
- `JWT_SECRET:` Secret key used for JWT authentication