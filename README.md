Multiplayer Quiz Game Platform
A web-based quiz game platform for multiplayer interactive quizzes, designed for students and educators. The platform allows users to create, manage, and participate in quiz games, supporting both individual and multiplayer modes, with comprehensive administrative tools for quiz management.

Table of Contents
Project Overview
Features
Installation
Usage
Testing
Technical Details
Contributing
Authors
Project Overview
This project is a quiz game platform built as part of the LOG2990 course requirements. It combines both frontend (Angular) and backend (NestJS or Express) frameworks to create a dynamic, user-friendly quiz environment. Users can create quizzes, join multiplayer sessions, and track game history, with functionalities similar to platforms like Kahoot.

Features
For Players
Join or Create Games: Join an existing game using a code or create a new one.
Quiz Types: Supports multiple-choice and free-response questions.
Real-Time Gameplay: Participate in quizzes with real-time responses and a countdown timer.
Random Mode: Play randomly selected quizzes with questions drawn from the question bank.
Leaderboard: See scores at the end of each game, with top performers highlighted.
For Administrators
Quiz Management: Create, edit, delete, and reorder questions in a quiz.
Question Bank: Maintain a reusable question bank, with filtering options to quickly find questions.
Game Import/Export: Export quizzes in JSON format for sharing or re-importing.
Game History: View a history of all completed games with player stats.
Player Management: Ban or allow players to join, mute players in chat, and set visibility for specific quizzes.
Technical Features
Frontend: Built with Angular for a responsive and interactive user interface.
Backend: Choice of NestJS or Express for handling API requests and game logic.
Real-Time Chat: Integrated chat for player communication during games.
Data Persistence: Uses MongoDB for storing game data, questions, and player history.
Installation
Prerequisites
Node.js: Ensure you have Node.js installed. Download here
MongoDB: A running MongoDB instance is required for data storage.
Steps
Clone the repository:
bash
Copier le code
git clone https://github.com/Nofissa/multiplayer-quiz-game-web-app.git
Navigate to the project folder:
bash
Copier le code
cd multiplayer-quiz-game-web-app
Install dependencies:
For the client:
bash
Copier le code
cd client
npm ci
For the server:
bash
Copier le code
cd server
npm ci
Configure environment variables in .env files for the client and server, such as database URL and API keys.
Usage
Running the Application
Start the Frontend:

bash
Copier le code
cd client
npm start
This will serve the application at http://localhost:4200.
Start the Backend:

bash
Copier le code
cd server
npm start
This will serve the backend at http://localhost:3000.
Access the platform through your web browser at http://localhost:4200.

Admin Access
Restricted by a password (configurable in the backend .env).
Provides access to game creation, question management, import/export, and viewing game history.
Creating and Joining Games
Create a Game: Select a quiz from the list to create a game room with an access code.
Join a Game: Enter the game code provided by the host to join an ongoing game.
Testing
Unit Tests: Both frontend and backend contain unit tests.
Run npm run test in both client and server directories to execute tests.
Code Coverage: Generate code coverage reports by running npm run coverage in each directory.
Technical Details
Frontend (Angular)
Components: Built using Angular components, with features for dynamic routing, state management, and real-time updates.
Build Process:
Run ng build for production builds.
Development server: ng serve accessible at http://localhost:4200.
Backend (NestJS/Express)
API Documentation: Accessible at /api/docs (OpenAPI/Swagger format).
Real-Time Updates: Uses WebSocket for real-time gameplay interactions and chat.
Database: MongoDB for persistent data storage.
Test Framework: Mocha, Chai, Sinon, and Supertest for API testing.
Continuous Integration
The project includes a GitLab CI/CD pipeline with steps for install, lint, build, and test. Configured to run on commit to main branches and on merge requests.
Contributing
Clone the repository and create a branch for your feature:
bash
Copier le code
git checkout -b feature/your-feature-name
Ensure all tests pass and code quality checks are met:
bash
Copier le code
npm run lint
npm run test
Push to your fork and submit a pull request.
Authors
Nofissa Khaif
Jérémie Bolduc
Imed-Eddine Bennour
Romaine Brand
Dimitri Mansour
Let me know if there’s anything else you’d like to add or adjust!
