# Multiplayer Quiz Game Platform

A web-based quiz game platform for multiplayer interactive quizzes, designed for students and educators. The platform allows users to create, manage, and participate in quiz games, supporting both individual and multiplayer modes, with comprehensive administrative tools for quiz management.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Usage](#usage)
- [Testing](#testing)
- [Technical Details](#technical-details)
- [Authors](#authors)


# Project Overview
This project is a quiz game platform built as part of the LOG2990 course requirements. It combines both frontend (Angular) and backend (NestJS or Express) frameworks to create a dynamic, user-friendly quiz environment. Users can create quizzes, join multiplayer sessions, and track game history, with functionalities similar to platforms like Kahoot.

# Features

## For Players
- Join or Create Games: Join an existing game using a code or create a new one.
- Quiz Types: Supports multiple-choice and free-response questions.
- Real-Time Gameplay: Participate in quizzes with real-time responses and a countdown timer.
- Random Mode: Play randomly selected quizzes with questions drawn from the question bank.
- Leaderboard: See scores at the end of each game, with top performers highlighted.
- Real-Time Chat: Integrated chat for player communication during games.

## For Administrators
- Quiz Management: Create, edit, delete, and reorder questions in a quiz.
- Question Bank: Maintain a reusable question bank, with filtering options to quickly find questions.
- Game Import/Export: Export quizzes in JSON format for sharing or re-importing.
- Game History: View a history of all completed games with player stats.
- Player Management: Ban or allow players to join, mute players in chat, and set visibility for specific quizzes.

## Technical Features
- Frontend: Built with Angular for a responsive and interactive user interface.
- Backend: NestJs for handling API requests and game logic.
- Data Persistence: Uses MongoDB for storing game data, questions, and player history.


# Usage

- Running the Application
1. **Start the Frontend** : 
    `cd client`
    `npm start`
    - This will serve the application at http://localhost:4200.

2. **Start the Backend** : 
    `cd server`
    `npm start`
    - This will serve the application at http://localhost:3000.

3. **Access the platform through your web browser at http://localhost:4200.**

## Admin Access

- Restricted by a password (configurable in the backend .env).
- Provides access to game creation, question management, import/export, and viewing game history

## Creating and Joining Games

- Create a Game: Select a quiz from the list to create a game room with an access code.
- Join a Game: Enter the game code provided by the host to join an ongoing game.

# Testing

- Unit Tests: Both frontend and backend contain unit tests.
    - Run `npm run test` in both client and server directories to execute tests.
- Code Coverage: Generate code coverage reports by running npm run coverage in each directory.

# Technical Details

## Frontend (Angular)
- Components: Built using Angular components, with features for dynamic routing, state management, and real-time updates.
- Build Process:
    - Run `ng build` for production builds.
    - Development server: `ng serve` accessible at http://localhost:4200.

## Backend (NestJS/Express)

- API Documentation: Accessible at /api/docs (OpenAPI/Swagger format).
- Real-Time Updates: Uses WebSocket for real-time gameplay interactions and chat.
- Database: MongoDB for persistent data storage.
- Test Framework: Mocha, Chai, Sinon, and Supertest for API testing.

# Continuous Integration

- The project includes a GitLab CI/CD pipeline with steps for install, lint, build, and test. Configured to run on commit to main branches and on merge requests.

# Authors
- Nofissa Khaif
- Jérémie Bolduc
- Imed-Eddine Bennour
- Romaine Brand
- Dimitri Mansour
