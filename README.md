![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express.js-Backend-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![API](https://img.shields.io/badge/API-REST-orange)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen)
# Task Manager Backend

## Demo API

![Demo](./assets/demo.gif)

Backend API for managing projects and tasks.  
Created as part of a team project.

---
## Architecture

The application follows a simple 3-layer architecture:

- **Client layer** (e.g., Swagger UI / Postman)  
  interacts with the API via HTTP requests

- **Backend layer** (Node.js + Express)  
  handles routing, business logic and data processing

- **Database layer** (PostgreSQL)  
  stores users, projects and tasks with relational structure

## API Documentation

Swagger UI available at:

http://localhost:3000/api/docs

## Swagger API Documentation

Interactive API documentation is available after starting the server:

```text
http://localhost:3000/api/docs
```

Swagger UI allows testing all endpoints directly in the browser.

Documented endpoints include:

- Tasks
  - GET /tasks
  - POST /tasks
  - GET /tasks/{id}
  - PUT /tasks/{id}
  - DELETE /tasks/{id}

- Users
  - GET /users
  - POST /users
  - GET /users/{id}
  - PUT /users/{id}
  - DELETE /users/{id}
  - GET /users/{id}/tasks

- Projects
  - GET /projects
  - POST /projects
  - GET /projects/{id}
  - DELETE /projects/{id}
  - GET /projects/{id}/tasks

---

## API Validation

The backend includes validation mechanisms for secure and correct API usage.

Implemented validations:

- required fields validation
- maximum title length validation
- email format validation
- date format validation
- task status validation
- relational validation for:
  - assigned_user_id
  - project_id

The API returns proper HTTP status codes:

- 200 OK
- 201 Created
- 400 Bad Request
- 404 Not Found
- 500 Internal Server Error

### Data relationships:
- One user can have many tasks
- One project can contain many tasks
- Each task belongs to one user and one project

The API follows REST principles and communicates using JSON.

## Database Diagram (ERD)

![ERD](./assets/erd.png)

## Technologies

- Node.js
- Express
- PostgreSQL
- dotenv

---

## Project Structure
```text

task-manager-backend/
│
├── database/
│ └── init.sql # database schema + sample data
│
├── .env.example # environment variables template
├── .gitignore
├── db.js # database connection
├── server.js # main server file
├── package.json
└── package-lock.json
```
---

Installation

## Clone repository:

```bash
git clone https://github.com/krystianmarciniak/task-manager-backend.git
cd task-manager-backend
```
Install dependencies:
```bash
npm install
```
## Environment variables
Create .env file based on .env.example:
```text
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanager
DB_USER=postgres
DB_PASSWORD=your_password_here
```
## Database setup

Create database in PostgreSQL:
```text
CREATE DATABASE taskmanager;
```
Import schema and data:
psql -U postgres -d taskmanager -f database/init.sql

## Run project
```text
npm run dev

or
node server.js
```
## API (basic)

Example endpoints:

- GET /projects
- GET /projects/:id
- GET /users
- GET /users/:id

## Validation & Security

The backend includes server-side validation to improve API reliability and data consistency.

Implemented validations:

- Required task title validation
- Maximum task title length (100 characters)
- Allowed task statuses only:
  - todo
  - in_progress
  - done
- E-mail format validation
- Date format validation
- Validation of existing relations:
  - assigned_user_id
  - project_id

Example error response:

```json
{
  "error": "Nieprawidłowy format daty."
}
```

The API returns proper HTTP status codes:
- 200 OK
- 201 Created
- 400 Bad Request
- 404 Not Found
- 500 Internal Server Error

## Notes
.env file is not included in repository for security reasons
node_modules is ignored (run npm install after cloning)
Database dump is included in database/init.sql

## Author
Krystian Marciniak

